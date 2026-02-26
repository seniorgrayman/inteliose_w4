import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../_lib/cors.js";
import { neynarClient, BOT_FID } from "../_lib/neynar.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!BOT_FID) {
      return res.json({ casts: [] });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 25, 50);
    const result = await neynarClient.fetchCastsForUser({ fid: BOT_FID, limit });
    const casts = ((result as any)?.casts || []).map((c: any) => ({
      hash: c.hash,
      text: c.text || "",
      timestamp: c.timestamp,
      likes: c.reactions?.likes_count || 0,
      recasts: c.reactions?.recasts_count || 0,
      replies: c.replies?.count || 0,
      parentHash: c.parent_hash || null,
    }));

    return res.status(200).json({ casts });
  } catch (err: any) {
    console.error("Farcaster casts error:", err);
    return res.status(500).json({ error: "Failed to fetch casts" });
  }
}
