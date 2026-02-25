/**
 * POST /api/burn/estimate
 * Calculate burn cost for a query.
 * Uses complexity-tiered USD pricing:
 *   simple=$0.25, medium=$0.75, complex=$2.50, very_complex=$8.00
 * Converts USD cost to token amount using live DexScreener price.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/cors.js";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { getTokenPriceUsd, tokensForUsd } from "../_lib/price.js";
import { calculateUsdCost } from "../_lib/complexity.js";

const BURN_BASE_USD = parseFloat(process.env.VITE_BURN_USD_COST || "0.25");
const FALLBACK_TOKENS = parseInt(process.env.VITE_BURN_FALLBACK_TOKENS || "200", 10);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, req.headers.origin);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
  const rl = checkRateLimit(`estimate:${ip}`, 30);
  if (!rl.allowed) return res.status(429).json({ error: "Rate limited" });

  if (process.env.VITE_BURN_ENABLED !== "true") {
    return res.status(200).json({ burnRequired: false });
  }

  const { query } = req.body || {};
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Missing query" });
  }
  if (query.length > 2000) {
    return res.status(400).json({ error: "Query too long (max 2000 chars)" });
  }

  const tokenAddress = process.env.VITE_BURN_TOKEN_ADDRESS || "";
  const tokenDecimals = parseInt(process.env.VITE_BURN_TOKEN_DECIMALS || "18", 10);
  const tokenSymbol = process.env.VITE_BURN_TOKEN_SYMBOL || "TOKEN";

  const { usdCost, complexity, multipliers } = calculateUsdCost(query, BURN_BASE_USD);

  const priceUsd = tokenAddress ? await getTokenPriceUsd(tokenAddress) : null;

  let tokenAmount: number;
  if (priceUsd && priceUsd > 0) {
    tokenAmount = tokensForUsd(usdCost, priceUsd);
  } else {
    tokenAmount = Math.ceil(FALLBACK_TOKENS * (usdCost / BURN_BASE_USD));
  }

  return res.status(200).json({
    burnRequired: true,
    tokenAmount,
    complexity,
    multipliers,
    usdCost,
    priceUsd: priceUsd || null,
    tokenAddress,
    tokenDecimals,
    tokenSymbol,
    deadAddress: "0x000000000000000000000000000000000000dEaD",
  });
}
