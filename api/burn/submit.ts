/**
 * POST /api/burn/submit
 * Create a pending burn record in Firestore, return burnId.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/cors.js";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { db } from "../_lib/firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, req.headers.origin);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
  const rl = checkRateLimit(`submit:${ip}`, 10);
  if (!rl.allowed) return res.status(429).json({ error: "Rate limited" });

  if (process.env.VITE_BURN_ENABLED !== "true") {
    return res.status(200).json({ burnRequired: false });
  }

  const { walletAddress, query, tokenAmount, complexity } = req.body || {};

  if (!walletAddress || !WALLET_RE.test(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Missing query" });
  }
  if (!tokenAmount || typeof tokenAmount !== "number" || tokenAmount <= 0 || tokenAmount > 1_000_000_000) {
    return res.status(400).json({ error: "Invalid token amount" });
  }
  if (!complexity || !["simple", "medium", "complex", "very_complex"].includes(complexity)) {
    return res.status(400).json({ error: "Invalid complexity" });
  }

  const tokenAddress = process.env.VITE_BURN_TOKEN_ADDRESS || "";
  if (!tokenAddress) {
    return res.status(503).json({ error: "Burn token not configured" });
  }

  try {
    const docRef = await addDoc(collection(db, "burn_transactions"), {
      wallet_address: walletAddress.toLowerCase(),
      query_text: query.trim().slice(0, 2000),
      token_address: tokenAddress,
      amount_burned: tokenAmount,
      complexity,
      status: "pending",
      ai_model: "inteliose",
      chain_id: 8453,
      burn_signature: null,
      error_message: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return res.status(200).json({
      burnId: docRef.id,
      tokenAmount,
      tokenAddress,
      tokenDecimals: parseInt(process.env.VITE_BURN_TOKEN_DECIMALS || "18", 10),
      deadAddress: "0x000000000000000000000000000000000000dEaD",
    });
  } catch (err: any) {
    console.error("Burn submit error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
