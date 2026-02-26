import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neynarClient } from "../_lib/neynar.js";
import { extractTokenFromCast } from "../../server/farcaster/utils.js";
import { executeTokenHealthCheck } from "../../server/a2a/skills/token-health-check.js";

const BASE_URL = "https://www.daointel.io";

function buildResultFrame(verdict: any, tokenData: any, chain: string): string {
  const healthEmoji =
    verdict.health === "GREEN" ? "\u{1F7E2}" :
    verdict.health === "YELLOW" ? "\u{1F7E1}" :
    "\u{1F534}";

  const bgColor =
    verdict.health === "GREEN" ? "2d5a27" :
    verdict.health === "YELLOW" ? "5a4f27" :
    "5a2727";

  // Use a dynamic OG image placeholder with text overlay
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate frame message via Neynar
    const { untrustedData, trustedData } = req.body;

    if (trustedData?.messageBytes) {
      try {
        await neynarClient.validateFrameAction({ messageBytesInHex: trustedData.messageBytes });
      } catch {
        // Non-fatal: continue even if validation fails in dev
      }
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
