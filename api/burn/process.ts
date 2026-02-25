/**
 * POST /api/burn/process
 * Verify a burn transaction on-chain via Base RPC and update Firestore.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/cors.js";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { db } from "../_lib/firebase.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { rpcCall } from "../_lib/rpc.js";

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function getTransactionReceipt(txHash: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await rpcCall("eth_getTransactionReceipt", [txHash]);
      if (result) return result;
    } catch (err) {
      console.warn(`[burn/process] Receipt fetch attempt ${i + 1} failed:`, err);
    }
    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return null;
}

function extractAddress(topic: string): string {
  return "0x" + topic.slice(-40).toLowerCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, req.headers.origin);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
  const rl = checkRateLimit(`process:${ip}`, 10);
  if (!rl.allowed) return res.status(429).json({ error: "Rate limited" });

  const { burnId, txHash } = req.body || {};

  if (!burnId || typeof burnId !== "string") {
    return res.status(400).json({ error: "Invalid burnId" });
  }
  if (!txHash || !TX_HASH_RE.test(txHash)) {
    return res.status(400).json({ error: "Invalid txHash" });
  }

  const tokenAddress = (process.env.VITE_BURN_TOKEN_ADDRESS || "").toLowerCase();
  if (!tokenAddress) {
    return res.status(503).json({ error: "Burn token not configured" });
  }

  try {
    const burnRef = doc(db, "burn_transactions", burnId);
    const burnSnap = await getDoc(burnRef);

    if (!burnSnap.exists()) {
      return res.status(404).json({ error: "Burn record not found" });
    }

    const record = burnSnap.data();

    if (record.status === "confirmed" || record.status === "processed") {
      return res.status(200).json({ verified: true, burnId, txHash: record.burn_signature });
    }

    if (record.status !== "pending" && record.status !== "signed") {
      return res.status(400).json({ error: `Cannot process burn in status: ${record.status}` });
    }

    const receipt = await getTransactionReceipt(txHash);

    if (!receipt) {
      await updateDoc(burnRef, { status: "failed", error_message: "Receipt not found", updated_at: serverTimestamp() });
      return res.status(400).json({ verified: false, error: "Transaction receipt not found" });
    }

    if (receipt.status !== "0x1") {
      await updateDoc(burnRef, { status: "failed", error_message: "Transaction reverted", updated_at: serverTimestamp() });
      return res.status(400).json({ verified: false, error: "Transaction reverted" });
    }

    const transferLog = (receipt.logs || []).find((log: any) => {
      if (log.topics?.[0] !== TRANSFER_TOPIC) return false;
      if (log.address?.toLowerCase() !== tokenAddress) return false;
      const to = extractAddress(log.topics[2]);
      return to === DEAD_ADDRESS;
    });

    if (!transferLog) {
      await updateDoc(burnRef, { status: "failed", error_message: "No valid burn transfer found in tx", updated_at: serverTimestamp() });
      return res.status(400).json({ verified: false, error: "No valid burn transfer found" });
    }

    const from = extractAddress(transferLog.topics[1]);
    if (from !== record.wallet_address.toLowerCase()) {
      await updateDoc(burnRef, { status: "failed", error_message: "Sender mismatch", updated_at: serverTimestamp() });
      return res.status(400).json({ verified: false, error: "Sender address mismatch" });
    }

    await updateDoc(burnRef, {
      status: "confirmed",
      burn_signature: txHash,
      updated_at: serverTimestamp(),
    });

    return res.status(200).json({ verified: true, burnId, txHash });
  } catch (err: any) {
    console.error("Burn process error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
