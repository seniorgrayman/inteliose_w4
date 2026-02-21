/**
 * Token data fetcher - works with Base (Coinbase/RPC) and Solana (QuickNode/DexScreener)
 */

export interface TokenData {
  name: string;
  symbol: string;
  price: string | null;
  volume24h: string | null;
  liquidity: string | null;
  marketCap: string | null;
  holders: number | null;
}

// --- Base Chain (EVM) ---
export async function fetchBaseTokenData(address: string): Promise<TokenData | null> {
  try {
    // Try DexScreener API (free, no auth)
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data.pairs || data.pairs.length === 0) return null;
    
    const pair = data.pairs[0];
    return {
      name: pair.baseToken?.name || pair.tokenAddress || "Unknown",
      symbol: pair.baseToken?.symbol || "???",
      price: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(8)}` : null,
      volume24h: pair.volume?.h24 ? `$${(pair.volume.h24 / 1e6).toFixed(2)}M` : null,
      liquidity: pair.liquidity?.usd ? `$${(pair.liquidity.usd / 1e6).toFixed(2)}M` : null,
      marketCap: pair.marketCap ? `$${(pair.marketCap / 1e6).toFixed(2)}M` : null,
      holders: null, // DexScreener doesn't provide holder count
    };
  } catch (e) {
    console.warn("fetchBaseTokenData error:", e);
    return null;
  }
}

// --- Solana Chain ---
export async function fetchSolanaTokenData(mint: string): Promise<TokenData | null> {
  try {
    // Try DexScreener for Solana (works for all chains)
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data.pairs || data.pairs.length === 0) return null;
    
    const pair = data.pairs[0];
    return {
      name: pair.baseToken?.name || pair.tokenAddress || "Unknown",
      symbol: pair.baseToken?.symbol || "???",
      price: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(8)}` : null,
      volume24h: pair.volume?.h24 ? `$${(pair.volume.h24 / 1e6).toFixed(2)}M` : null,
      liquidity: pair.liquidity?.usd ? `$${(pair.liquidity.usd / 1e6).toFixed(2)}M` : null,
      marketCap: pair.marketCap ? `$${(pair.marketCap / 1e6).toFixed(2)}M` : null,
      holders: null,
    };
  } catch (e) {
    console.warn("fetchSolanaTokenData error:", e);
    return null;
  }
}

// --- Generic fetch (auto-detect or try both) ---
export async function fetchTokenData(
  address: string,
  chain?: "Base" | "Solana"
): Promise<TokenData | null> {
  if (chain === "Base") {
    return fetchBaseTokenData(address);
  } else if (chain === "Solana") {
    return fetchSolanaTokenData(address);
  }
  
  // Try auto-detect (Base addresses are longer, Solana are ~43-44 chars)
  if (address.length === 42 || address.length === 66) {
    // Likely Base (0x + 40 or 64 hex chars)
    return fetchBaseTokenData(address);
  } else {
    // Likely Solana
    return fetchSolanaTokenData(address);
  }
}

export default { fetchTokenData, fetchBaseTokenData, fetchSolanaTokenData };
