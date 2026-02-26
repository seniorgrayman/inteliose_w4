import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { BOT_FID } from "../_lib/neynar.js";
import { verifyWebhookSignature } from "../../server/farcaster/utils.js";
import { handleMention } from "../../server/farcaster/mention-handler.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify webhook signature
  const secret = process.env.VITE_NEYNAR_WEBHOOK_SECRET || "";
  const signature = req.headers["x-neynar-signature"] as string;

  if (!signature || !secret) {
    return res.status(401).json({ error: "Missing webhook signature" });
  }

  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  try {
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }
  } catch {
    return res.status(401).json({ error: "Signature verification failed" });
  }

  const { type, data } = req.body;

  // Only handle cast.created events
  if (type !== "cast.created") {
    return res.status(200).json({ ok: true });
  }

  // Check if bot is mentioned
  const mentionedFids: number[] = (data?.mentioned_profiles || []).map((p: any) => p.fid);
  if (!mentionedFids.includes(BOT_FID)) {
    return res.status(200).json({ ok: true });
  }

  // Rate limit by author FID
  const authorFid = data?.author?.fid;
  if (authorFid) {
    const { allowed } = checkRateLimit(`farcaster:${authorFid}`, 5);
    if (!allowed) {
      return res.status(200).json({ ok: true, skipped: "rate_limited" });
    }
  }

  // Handle mention asynchronously — return 200 immediately
  handleMention(data.hash, authorFid, data.text || "").catch((err) => {
    console.error("Farcaster mention handler error:", err);
  });

  return res.status(200).json({ ok: true });
}
