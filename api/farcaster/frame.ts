import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL = "https://www.daointel.io";
const OG_IMAGE = `${BASE_URL}/inteliose-agent.png`;

export default function handler(_req: VercelRequest, res: VercelResponse) {
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
