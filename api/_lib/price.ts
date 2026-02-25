/**
 * Token price fetcher using DexScreener API.
 * Caches price for 60 seconds to avoid rate limits.
 */

const CACHE_TTL = 60_000;
const STALE_TTL = 300_000;

interface PriceCache {
  usd: number;
  timestamp: number;
  tokenAddress: string;
}

let cache: PriceCache | null = null;

export async function getTokenPriceUsd(tokenAddress: string): Promise<number | null> {
  if (!tokenAddress) return null;

  if (cache && cache.tokenAddress === tokenAddress && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.usd;
  }

  try {
    const resp = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!resp.ok) throw new Error(`DexScreener ${resp.status}`);

    const data = await resp.json();
    const pairs = data.pairs || [];
    if (!pairs.length) return null;

    const basePairs = pairs.filter((p: any) => p.chainId === "base");
    const sorted = (basePairs.length ? basePairs : pairs).sort(
      (a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    );

    const priceUsd = parseFloat(sorted[0].priceUsd);
    if (isNaN(priceUsd) || priceUsd <= 0) return null;

    cache = { usd: priceUsd, timestamp: Date.now(), tokenAddress };
    return priceUsd;
  } catch {
    if (cache && cache.tokenAddress === tokenAddress && Date.now() - cache.timestamp < STALE_TTL) {
      return cache.usd;
    }
    return null;
  }
}

export function tokensForUsd(usdAmount: number, priceUsd: number): number {
  if (priceUsd <= 0) return 0;
  return Math.ceil(usdAmount / priceUsd);
}
