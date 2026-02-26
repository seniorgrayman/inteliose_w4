import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../_lib/cors.js";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { neynarClient, BOT_FID } from "../_lib/neynar.js";
import { getFarcasterProfile, getIdentityLinkStatus } from "../../server/farcaster/identity-link.js";
import { verifyWebhookSignature, extractTokenFromCast } from "../../server/farcaster/utils.js";
import { handleMention } from "../../server/farcaster/mention-handler.js";
import { executeTokenHealthCheck } from "../../server/a2a/skills/token-health-check.js";
import { db } from "../_lib/firebase.js";
import { collection, getCountFromServer } from "firebase/firestore";

const BASE_URL = "https://www.daointel.io";
const OG_IMAGE = `${BASE_URL}/inteliose-agent.png`;

// ── Status handler ──
async function handleStatus(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const [profile, identityLink, interactionCount] = await Promise.all([
      getFarcasterProfile().catch(() => null),
      getIdentityLinkStatus().catch(() => ({ linked: false, details: "Error checking identity link" })),
      getCountFromServer(collection(db, "farcaster_interactions"))
        .then((snap) => snap.data().count)
        .catch(() => 0),
    ]);

    return res.status(200).json({
      profile,
      interactionCount,
      autoCastEnabled: process.env.VITE_FARCASTER_AUTO_CAST === "true",
      identityLink,
      botActive: !!profile,
    });
  } catch (err: any) {
    console.error("Farcaster status error:", err);
    return res.status(500).json({ error: "Failed to fetch Farcaster status" });
  }
}

// ── Frame handler ──
function handleFrame(_req: VercelRequest, res: VercelResponse) {
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
  <p>Paste a token address to get an AI-powered health verdict.</p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}

// ── Frame action handler ──
function buildResultFrame(verdict: any, tokenData: any, chain: string): string {
  const healthEmoji =
    verdict.health === "GREEN" ? "\u{1F7E2}" :
    verdict.health === "YELLOW" ? "\u{1F7E1}" :
    "\u{1F534}";
  const bgColor =
    verdict.health === "GREEN" ? "2d5a27" :
    verdict.health === "YELLOW" ? "5a4f27" :
    "5a2727";
  const imageText = encodeURIComponent(
    `${healthEmoji} ${verdict.health} | ${tokenData?.symbol || "TOKEN"} on ${chain} | Risk: ${verdict.riskLevel}`
  );
  const imageUrl = `https://placehold.co/1200x630/${bgColor}/ffffff?text=${imageText}&font=mono`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:title" content="${verdict.health} - ${tokenData?.symbol || "Token"} Analysis" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:button:1" content="Analyze Another" />
  <meta property="fc:frame:button:1:action" content="post_redirect" />
  <meta property="fc:frame:button:1:target" content="${BASE_URL}/farcaster/frame" />
  <meta property="fc:frame:button:2" content="Full Report" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${BASE_URL}" />
</head>
<body>
  <h1>${verdict.health} - ${tokenData?.name || "Token"}</h1>
  <p>${verdict.summary}</p>
</body>
</html>`;
}

function buildErrorFrame(message: string): string {
  const imageUrl = `https://placehold.co/1200x630/5a2727/ffffff?text=${encodeURIComponent(message)}&font=mono`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:title" content="Analysis Error" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:input:text" content="Paste token address (Base or Solana)" />
  <meta property="fc:frame:button:1" content="Try Again" />
  <meta property="fc:frame:post_url" content="${BASE_URL}/api/farcaster/frame-action" />
</head>
<body>
  <p>${message}</p>
</body>
</html>`;
}

async function handleFrameAction(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { untrustedData, trustedData } = req.body;

    if (trustedData?.messageBytes) {
      try {
        await neynarClient.validateFrameAction({ messageBytesInHex: trustedData.messageBytes });
      } catch { /* non-fatal */ }
    }

    const inputText = (untrustedData?.inputText || "").trim();
    if (!inputText) {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(buildErrorFrame("Please enter a token address"));
    }

    const extracted = extractTokenFromCast(inputText);
    if (!extracted) {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(buildErrorFrame("Invalid token address format"));
    }

    const result = await executeTokenHealthCheck({
      tokenAddress: extracted.tokenAddress,
      chain: extracted.chain,
    });

    if (result.error) {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(buildErrorFrame(result.error));
    }

    const dataPart = result.parts.find((p) => p.type === "data");
    const data = dataPart?.data;
    const verdict = data?.aiVerdict;
    const tokenData = data?.tokenData;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(
      buildResultFrame(
        verdict || { health: "YELLOW", riskLevel: "Unknown", summary: "Analysis complete" },
        tokenData,
        extracted.chain
      )
    );
  } catch (err: any) {
    console.error("Frame action error:", err);
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(buildErrorFrame("Analysis failed. Try again."));
  }
}

// ── Webhook handler ──
async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.VITE_NEYNAR_WEBHOOK_SECRET || "";
  const signature = req.headers["x-neynar-signature"] as string;

  if (!signature || !secret) return res.status(401).json({ error: "Missing webhook signature" });

  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  try {
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }
  } catch {
    return res.status(401).json({ error: "Signature verification failed" });
  }

  const { type, data } = req.body;
  if (type !== "cast.created") return res.status(200).json({ ok: true });

  const mentionedFids: number[] = (data?.mentioned_profiles || []).map((p: any) => p.fid);
  if (!mentionedFids.includes(BOT_FID)) return res.status(200).json({ ok: true });

  const authorFid = data?.author?.fid;
  if (authorFid) {
    const { allowed } = checkRateLimit(`farcaster:${authorFid}`, 5);
    if (!allowed) return res.status(200).json({ ok: true, skipped: "rate_limited" });
  }

  handleMention(data.hash, authorFid, data.text || "").catch((err) => {
    console.error("Farcaster mention handler error:", err);
  });

  return res.status(200).json({ ok: true });
}

// ── Router ──
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract sub-path from URL: /api/farcaster/<sub>
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const segments = url.pathname.replace(/^\/api\/farcaster\/?/, "").split("/").filter(Boolean);
  const sub = segments[0] || "";

  switch (sub) {
    case "status":
      return handleStatus(req, res);
    case "frame":
      return handleFrame(req, res);
    case "frame-action":
      return handleFrameAction(req, res);
    case "webhook":
      return handleWebhook(req, res);
    default:
      return res.status(404).json({ error: "Not found" });
  }
}
