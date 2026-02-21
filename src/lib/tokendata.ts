/**
 * Token data fetcher - works with Base and Solana
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

// --- DexScreener Fetcher (as a reliable fallback) ---
async function fetchTokenDataFromDexScreener(address: string): Promise<TokenData | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    if (!data.pairs || data.pairs.length === 0) return null;
    
    const pair = data.pairs[0];
    return {
      name: pair.baseToken?.name || "Unknown",
      symbol: pair.baseToken?.symbol || "???",
      price: pair.priceUsd ? `${parseFloat(pair.priceUsd).toFixed(8)}` : null,
      volume24h: pair.volume?.h24 ? `${(pair.volume.h24 / 1e6).toFixed(2)}M` : null,
      liquidity: pair.liquidity?.usd ? `${(pair.liquidity.usd / 1e6).toFixed(2)}M` : null,
      marketCap: pair.marketCap ? `${(pair.marketCap / 1e6).toFixed(2)}M` : null,
      holders: null, // DexScreener doesn't provide holder count
    };
  } catch (e) {
    console.warn(`DexScreener fetch error for ${address}:`, e);
    return null;
  }
}


// --- Base Chain (EVM) ---
// Note: The user requested to fetch from Coinbase. However, the public Coinbase API
// cannot look up arbitrary token contract addresses. We are using a DexScreener
// implementation that provides the necessary data (price, volume, liquidity).
// This can be replaced with a service like Coinbase Cloud RPC if available.
export async function fetchBaseTokenData(address: string): Promise<TokenData | null> {
    // For now, we'll use the reliable DexScreener API.
    // This can be swapped with a different provider if needed.
    return fetchTokenDataFromDexScreener(address);
}

// --- Solana Chain ---
export async function fetchSolanaTokenData(mint: string): Promise<TokenData | null> {
  // User-specified QuickNode endpoint from environment variables
  const quickNodeEndpoint = import.meta.env.VITE_QUICKNODE_SOLANA_RPC_URL;

  if (quickNodeEndpoint) {
    try {
      // This is a HYPOTHETICAL example of a QuickNode API call.
      // The actual implementation depends on the specific API provided by QuickNode.
      // You will need to replace this with your actual API call.
      const res = await fetch(quickNodeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Example: Using a hypothetical custom method for token data
          method: 'qn_getTokenDataWithPrice', 
          params: { mintAddress: mint }
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const response = await res.json();
        // Assuming the API returns data in a format that can be mapped to TokenData
        const tokenInfo = response.result; 
        if (tokenInfo && tokenInfo.price) {
          return {
            name: tokenInfo.name || "Unknown",
            symbol: tokenInfo.symbol || "???",
            price: tokenInfo.price ? `${parseFloat(tokenInfo.price).toFixed(8)}` : null,
            volume24h: tokenInfo.volume24h ? `${(tokenInfo.volume24h / 1e6).toFixed(2)}M` : null,
            liquidity: tokenInfo.liquidity ? `${(tokenInfo.liquidity / 1e6).toFixed(2)}M` : null,
            marketCap: tokenInfo.marketCap ? `${(tokenInfo.marketCap / 1e6).toFixed(2)}M` : null,
            holders: tokenInfo.holders || null,
          };
        }
      }
    } catch (e) {
      console.warn("QuickNode fetch failed, falling back to DexScreener:", e);
    }
  }

  // Fallback to DexScreener if QuickNode is not configured or fails
  return fetchTokenDataFromDexScreener(mint);
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
  
  // Try auto-detect (Base addresses are 42 chars, Solana are ~43-44 chars)
  if (address.length === 42) {
    // Likely Base (0x + 40 hex chars)
    return fetchBaseTokenData(address);
  } else {
    // Likely Solana
    return fetchSolanaTokenData(address);
  }
}

export default { fetchTokenData, fetchBaseTokenAta: fetchBaseTokenData, fetchSolanaTokenData };
