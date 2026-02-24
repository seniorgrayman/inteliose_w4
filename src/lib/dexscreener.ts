
// src/lib/dexscreener.ts

const DEXSCREENER_API_BASE_URL = "https://api.dexscreener.com/latest/dex";

export async function fetchTokenDetailsBySymbol(symbol: string, chainId: string = "ethereum") {
  try {
    // DexScreener API typically requires a pair address or a token address.
    // Searching by symbol directly is not a primary method for detailed token info.
    // We'll need to find a pair first, then extract token info from the pair.
    // For simplicity, let's assume we're looking for a common pair like WETH/TOKEN.
    // This is a simplification and might need refinement based on actual requirements.

    // First, search for pairs involving the token symbol on the specified chain.
    // This endpoint is for searching pairs, not directly tokens.
    const searchResponse = await fetch(`${DEXSCREENER_API_BASE_URL}/search?q=${symbol}`);
    if (!searchResponse.ok) {
      throw new Error(`DexScreener search API error: ${searchResponse.statusText}`);
    }
    const searchData = await searchResponse.json();

    if (!searchData.pairs || searchData.pairs.length === 0) {
      console.warn(`No pairs found for symbol: ${symbol} on chain: ${chainId}`);
      return null;
    }

    // Find a suitable pair. Prioritize pairs with good liquidity or a specific base token (e.g., WETH).
    const targetPair = searchData.pairs.find((pair: any) =>
      pair.chainId === chainId &&
      (pair.baseToken.symbol.toLowerCase() === symbol.toLowerCase() || pair.quoteToken.symbol.toLowerCase() === symbol.toLowerCase())
    );

    if (!targetPair) {
      console.warn(`No suitable pair found for symbol: ${symbol} on chain: ${chainId}`);
      return null;
    }

    // From the pair, we can extract token details.
    // DexScreener's pair object contains details about both base and quote tokens.
    const tokenInfo = targetPair.baseToken.symbol.toLowerCase() === symbol.toLowerCase() ? targetPair.baseToken : targetPair.quoteToken;

    // Augment with pair-specific data like price, liquidity, volume
    return {
      ...tokenInfo,
      pairAddress: targetPair.pairAddress,
      priceUsd: targetPair.priceUsd,
      liquidity: targetPair.liquidity ? targetPair.liquidity.usd : null,
      volume24h: targetPair.volume ? targetPair.volume.h24 : null,
      fdv: targetPair.fdv,
      marketCap: targetPair.marketCap, // DexScreener provides FDV, marketCap might need calculation or be absent
      // Add other relevant fields from targetPair as needed
    };

  } catch (error) {
    console.error("Error fetching token details from DexScreener:", error);
    return null;
  }
}

// You might also want a function to fetch by token address directly if available
export async function fetchTokenDetailsByAddress(address: string, chainId: string = "ethereum") {
  try {
    const response = await fetch(`${DEXSCREENER_API_BASE_URL}/token/${address}`);
    
    // Handle 404 - token not yet indexed on DexScreener
    if (response.status === 404) {
      console.warn(`Token not found on DexScreener: ${address}`);
      return { _notAvailable: true }; // Special marker for UI
    }
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      console.warn(`No pairs found for token address: ${address} on chain: ${chainId}`);
      return null;
    }

    // Find a suitable pair for the given chainId
    const targetPair = data.pairs.find((pair: any) => pair.chainId === chainId);

    if (!targetPair) {
      console.warn(`No suitable pair found for token address: ${address} on chain: ${chainId}`);
      return null;
    }

    // Extract token details from the pair
    const tokenInfo = targetPair.baseToken.address.toLowerCase() === address.toLowerCase() ? targetPair.baseToken : targetPair.quoteToken;

    return {
      ...tokenInfo,
      pairAddress: targetPair.pairAddress,
      priceUsd: targetPair.priceUsd,
      liquidity: targetPair.liquidity ? targetPair.liquidity.usd : null,
      volume24h: targetPair.volume ? targetPair.volume.h24 : null,
      fdv: targetPair.fdv,
      marketCap: targetPair.marketCap,
      // Add other relevant fields from targetPair as needed
    };

  } catch (error) {
    console.error("Error fetching token details by address from DexScreener:", error);
    return null;
  }
}
