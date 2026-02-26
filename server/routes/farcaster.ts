import { Router } from "express";
import { verifyWebhookSignature } from "../farcaster/utils.js";
import { handleMention } from "../farcaster/mention-handler.js";
import { getFarcasterProfile, getIdentityLinkStatus } from "../farcaster/identity-link.js";
import { getBotFid } from "../farcaster/neynar-client.js";
import { extractTokenFromCast } from "../farcaster/utils.js";
import { executeTokenHealthCheck } from "../a2a/skills/token-health-check.js";
import { db } from "../firestore.js";
import { collection, getCountFromServer } from "firebase/firestore";

const router = Router();

/**
 * POST /farcaster/webhook
 * Farcaster bot webhook (mirrors api/farcaster/webhook.ts)
 */
router.post("/farcaster/webhook", async (req, res) => {
  const secret = process.env.VITE_NEYNAR_WEBHOOK_SECRET || "";
  const signature = req.headers["x-neynar-signature"] as string;

  if (!signature || !secret) {
    return res.status(401).json({ error: "Missing webhook signature" });
  }

  const rawBody = JSON.stringify(req.body);

  try {
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }
  } catch {
    return res.status(401).json({ error: "Signature verification failed" });
  }

  const { type, data } = req.body;

  if (type !== "cast.created") {
    return res.status(200).json({ ok: true });
  }

  const mentionedFids: number[] = (data?.mentioned_profiles || []).map((p: any) => p.fid);
  if (!mentionedFids.includes(getBotFid())) {
    return res.status(200).json({ ok: true });
  }

  handleMention(data.hash, data.author?.fid, data.text || "").catch((err) => {
    console.error("Farcaster mention handler error:", err);
  });

  return res.status(200).json({ ok: true });
});

/**
 * GET /farcaster/frame
 * Farcaster Frame initial view (mirrors api/farcaster/frame.ts)
 */
router.get("/farcaster/frame", (_req, res) => {
  const BASE_URL = "https://www.daointel.io";
  const OG_IMAGE = `${BASE_URL}/inteliose-agent.png`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:title" content="Inteliose Token Analyzer" />
  <meta property="og:description" content="AI-powered token health analysis for Base and Solana" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${OG_IMAGE}" />
  <meta property="fc:frame:input:text" content="Paste token address (Base or Solana)" />
  <meta property="fc:frame:button:1" content="Analyze" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/farcaster/frame-action" />
</head>
<body>
  <h1>Inteliose Token Analyzer</h1>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

/**
 * POST /farcaster/frame-action
 * Farcaster Frame action handler (mirrors api/farcaster/frame-action.ts)
 */
router.post("/farcaster/frame-action", async (req, res) => {
  const { untrustedData } = req.body;
  const inputText = (untrustedData?.inputText || "").trim();

  if (!inputText) {
    return res.status(200).json({ error: "Please enter a token address" });
  }

  const extracted = extractTokenFromCast(inputText);
  if (!extracted) {
    return res.status(200).json({ error: "Invalid token address format" });
  }

  const result = await executeTokenHealthCheck({
    tokenAddress: extracted.tokenAddress,
    chain: extracted.chain,
  });

  if (result.error) {
    return res.status(200).json({ error: result.error });
  }

  const dataPart = result.parts.find((p) => p.type === "data");
  return res.json(dataPart?.data || {});
});

/**
 * GET /farcaster/status
 * Farcaster bot status (mirrors api/farcaster/status.ts)
 */
router.get("/farcaster/status", async (_req, res) => {
  try {
    const [profile, identityLink, interactionCount] = await Promise.all([
      getFarcasterProfile().catch(() => null),
      getIdentityLinkStatus().catch(() => ({ linked: false, details: "Error" })),
      getCountFromServer(collection(db, "farcaster_interactions"))
        .then((snap) => snap.data().count)
        .catch(() => 0),
    ]);

    res.json({
      profile,
      interactionCount,
      autoCastEnabled: process.env.VITE_FARCASTER_AUTO_CAST === "true",
      identityLink,
      botActive: !!profile,
    });
  } catch (err: any) {
    console.error("Farcaster status error:", err);
    res.status(500).json({ error: "Failed to fetch Farcaster status" });
  }
});

export default router;
