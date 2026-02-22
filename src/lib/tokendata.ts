/**
 * Real token data fetcher
 * Base: Coinbase + Zerion API (env: VITE_ZERION_API_KEY_BASE)
 * Solana: QuickNode RPC (env: VITE_QUICKNODE_API_KEY) + fallback to DexScreener
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

export interface SecurityScan {
  hiddenOwner: boolean;
  obfuscatedAddress: boolean;
  suspiciousFunctions: boolean;
  proxyContract: boolean;
  mintable: boolean;
  transferPausable: boolean;
  tradingCooldown: boolean;
  hasBlacklist: boolean;
  hasWhitelist: boolean;
  buyTax: string;
  sellTax: string;
  ownershipRenounced: string;
  ownerAddress: string;
}

// --- Base Chain (Coinbase + Zerion API) ---
export async function fetchBaseTokenData(address: string): Promise<TokenData | null> {
  try {
    // Try Zerion API first (using env key)
    const zerionKey = import.meta.env.VITE_ZERION_API_KEY_BASE || "";
    if (zerionKey) {
      try {
        const res = await fetch(`https://api.zerion.io/v1/tokens?filter[address]=${address}&chain=base&currency=usd`, {
          headers: { Authorization: `Basic ${btoa(zerionKey + ":")}` },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          const token = data.data?.[0];
          if (token) {
            return {
              name: token.attributes?.name || "Unknown",
              symbol: token.attributes?.symbol || "???",
              price: token.attributes?.price ? `$${token.attributes.price.toFixed(8)}` : null,
              volume24h: token.attributes?.volume24h ? `$${(token.attributes.volume24h / 1e6).toFixed(2)}M` : null,
              liquidity: token.attributes?.liquidity ? `$${(token.attributes.liquidity / 1e6).toFixed(2)}M` : null,
              marketCap: token.attributes?.market_cap ? `$${(token.attributes.market_cap / 1e6).toFixed(2)}M` : null,
              holders: token.attributes?.holders_count || null,
            };
          }
        }
      } catch (e) {
        console.warn("Zerion API error:", e);
      }
    }

    // Fallback to DexScreener
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
      holders: null,
    };
  } catch (e) {
    console.warn("fetchBaseTokenData error:", e);
    return null;
  }
}

// --- Solana Chain (QuickNode RPC) ---
export async function fetchSolanaTokenData(mint: string): Promise<TokenData | null> {
  try {
    const quickNodeUrl = import.meta.env.VITE_QUICKNODE_API_KEY || "";
    
    if (!quickNodeUrl) {
      console.warn("QuickNode API key not configured, using DexScreener fallback");
      return fetchSolanaFallback(mint);
    }

    // Try QuickNode RPC to get token metadata
    const rpcRes = await fetch(quickNodeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenSupply",
        params: [mint],
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!rpcRes.ok) {
      return fetchSolanaFallback(mint);
    }

    // Fallback to DexScreener for market data
    return fetchSolanaFallback(mint);
  } catch (e) {
    console.warn("fetchSolanaTokenData error:", e);
    return fetchSolanaFallback(mint);
  }
}

export async function fetchSolanaFallback(mint: string): Promise<TokenData | null> {
  try {
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
    console.warn("fetchSolanaFallback error:", e);
    return null;
  }
}

// --- Security Scanning (Go+ / RugCheck APIs) ---
export async function fetchSecurityScan(address: string, chain: "Base" | "Solana"): Promise<SecurityScan | null> {
  try {
    if (chain === "Base") {
      // Go+ Security API for Base/EVM tokens
      const res = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${address}?chain_id=base`, {
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        const tokenSec = data.result?.[address.toLowerCase()];
        if (tokenSec) {
          return {
            hiddenOwner: tokenSec.hidden_owner === "1",
            obfuscatedAddress: tokenSec.obfuscated_owner === "1",
            suspiciousFunctions: tokenSec.suspicious_functions?.length > 0 || false,
            proxyContract: tokenSec.is_proxy === "1",
            mintable: tokenSec.is_mintable === "1",
            transferPausable: tokenSec.can_take_back_ownership === "1",
            tradingCooldown: tokenSec.trading_cooldown === "1",
            hasBlacklist: tokenSec.is_blacklisted === "1",
            hasWhitelist: tokenSec.is_whitelisted === "1",
            buyTax: tokenSec.buy_tax || "N/A",
            sellTax: tokenSec.sell_tax || "N/A",
            ownershipRenounced: tokenSec.owner_change_balance === "1" ? "No" : "Yes",
            ownerAddress: tokenSec.owner_address || "Unknown",
          };
        }
      }
    } else {
      // Solana: Use RugCheck API
      try {
        const rugRes = await fetch(`https://api.rugcheck.xyz/v1/tokens/${address}/report`, {
          signal: AbortSignal.timeout(5000),
        });

        if (rugRes.ok) {
          const rugData = await rugRes.json();
          return {
            hiddenOwner: rugData.risks?.some((r: any) => r.name?.includes("Hidden")) || false,
            obfuscatedAddress: rugData.risks?.some((r: any) => r.name?.includes("Obfuscated")) || false,
            suspiciousFunctions: rugData.risks?.some((r: any) => r.name?.includes("Suspicious")) || false,
            proxyContract: rugData.is_proxy || false,
            mintable: rugData.is_mintable || false,
            transferPausable: rugData.can_pause || false,
            tradingCooldown: rugData.has_cooldown || false,
            hasBlacklist: rugData.has_blacklist || false,
            hasWhitelist: rugData.has_whitelist || false,
            buyTax: rugData.buy_tax || "N/A",
            sellTax: rugData.sell_tax || "N/A",
            ownershipRenounced: rugData.owner_renounced ? "Yes" : "No",
            ownerAddress: rugData.owner || "Unknown",
          };
        }
      } catch (e) {
        console.warn("RugCheck API error:", e);
      }
    }

    return null;
  } catch (e) {
    console.warn("fetchSecurityScan error:", e);
    return null;
  }
}

// --- Generic fetch ---
export async function fetchTokenData(
  address: string,
  chain?: "Base" | "Solana"
): Promise<TokenData | null> {
  if (chain === "Base") {
    return fetchBaseTokenData(address);
  } else if (chain === "Solana") {
    return fetchSolanaTokenData(address);
  }

  // Auto-detect chain
  if (address.toLowerCase().startsWith("0x") && address.length === 42) {
    return fetchBaseTokenData(address);
  } else {
    return fetchSolanaTokenData(address);
  }
}

export default { fetchTokenData, fetchBaseTokenData, fetchSolanaTokenData, fetchSecurityScan };
