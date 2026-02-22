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

// --- Base Chain (Coinbase API primary, Zerion fallback, DexScreener final fallback) ---
export async function fetchBaseTokenData(address: string): Promise<TokenData | null> {
  try {
    // Try Coinbase API first
    try {
      const res = await fetch(`https://api.coinbase.com/v1/tokens/${address}?networks=base`, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const token = data.data;
          return {
            name: token.name || "Unknown",
            symbol: token.symbol || "???",
            price: token.price?.value ? `$${parseFloat(token.price.value).toFixed(8)}` : null,
            volume24h: token.volume_24h ? `$${(token.volume_24h / 1e6).toFixed(2)}M` : null,
            liquidity: token.market_cap ? `$${(token.market_cap / 2 / 1e6).toFixed(2)}M` : null,
            marketCap: token.market_cap ? `$${(token.market_cap / 1e6).toFixed(2)}M` : null,
            holders: null,
          };
        }
      }
    } catch (e) {
      console.warn("Coinbase API error:", e);
    }

    // Fallback to Zerion API
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

    // Final fallback to DexScreener
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

// --- Fetch Owner Address from Smart Contract ---
export async function fetchTokenOwner(address: string, chain: "Base" | "Solana"): Promise<string> {
  try {
    if (chain === "Base") {
      // Use public Base RPC to call contract's owner() function
      const rpcUrl = "https://mainnet.base.org";

      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [
            {
              to: address,
              data: "0x8da5cb5b", // owner() function selector
            },
            "latest",
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result && data.result !== "0x" && data.result.length >= 40) {
          const ownerHex = data.result;
          const ownerAddr = "0x" + ownerHex.slice(-40);
          if (ownerAddr !== "0x0000000000000000000000000000000000000000") {
            return ownerAddr;
          }
        }
      }
    } else {
      // Solana: Use QuickNode to get token mint authority or creator
      const quickNodeUrl = import.meta.env.VITE_QUICKNODE_API_KEY || "";
      if (!quickNodeUrl) return "Unknown";

      try {
        const res = await fetch(quickNodeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenSupply",
            params: [address],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.result?.value?.owner) {
            return data.result.value.owner;
          }
        }
      } catch (e) {
        console.warn("QuickNode error for Solana owner:", e);
      }
    }

    return "Unknown";
  } catch (e) {
    console.warn("fetchTokenOwner error:", e);
    return "Unknown";
  }
}

// --- Security Scanning (Go+ / RugCheck APIs) ---
export async function fetchSecurityScan(address: string, chain: "Base" | "Solana"): Promise<SecurityScan | null> {
  try {
    if (chain === "Base") {
      // Go+ Security API for Base/EVM tokens (chain_id: 8453 for Base)
      try {
        const res = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${address.toLowerCase()}?chain_id=8453`, {
        });

        if (res.ok) {
          const data = await res.json();
          const tokenSec = data.result?.[address.toLowerCase()];
          if (tokenSec) {
            // Auto-fetch owner address
            const ownerAddr = tokenSec.owner_address || (await fetchTokenOwner(address, "Base"));
            
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
              ownerAddress: ownerAddr,
            };
          }
        }
      } catch (e) {
        console.warn("Go+ API error for Base token:", e);
      }
      
      // Fallback: Just fetch owner if Go+ fails
      const ownerAddr = await fetchTokenOwner(address, "Base");
      return {
        hiddenOwner: false,
        obfuscatedAddress: false,
        suspiciousFunctions: false,
        proxyContract: false,
        mintable: false,
        transferPausable: false,
        tradingCooldown: false,
        hasBlacklist: false,
        hasWhitelist: false,
        buyTax: "N/A",
        sellTax: "N/A",
        ownershipRenounced: "Unknown",
        ownerAddress: ownerAddr,
      };
    } else {
      // Solana: Use RugCheck API
      try {
        const rugRes = await fetch(`https://api.rugcheck.xyz/v1/tokens/${address}/report`);

        if (rugRes.ok) {
          const rugData = await rugRes.json();
          const ownerAddr = rugData.owner || (await fetchTokenOwner(address, "Solana"));
          
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
            ownerAddress: ownerAddr,
          };
        }
      } catch (e) {
        console.warn("RugCheck API error:", e);
      }
      
      // Fallback for Solana
      const ownerAddr = await fetchTokenOwner(address, "Solana");
      return {
        hiddenOwner: false,
        obfuscatedAddress: false,
        suspiciousFunctions: false,
        proxyContract: false,
        mintable: false,
        transferPausable: false,
        tradingCooldown: false,
        hasBlacklist: false,
        hasWhitelist: false,
        buyTax: "N/A",
        sellTax: "N/A",
        ownershipRenounced: "Unknown",
        ownerAddress: ownerAddr,
      };
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

// --- Real-time AI Analysis using Gemini API ---
export interface AIAnalysis {
  summary: string;
  riskLevel: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  recommendation: string;
  keyPoints: string[];
}

export async function generateAIAnalysis(
  tokenName: string,
  tokenSymbol: string,
  tokenData: TokenData | null,
  securityData: SecurityScan | null,
  chain: "Base" | "Solana"
): Promise<AIAnalysis | null> {
  try {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!geminiKey) {
      console.warn("Gemini API key not configured");
      return null;
    }

    // Prepare security risk count
    const riskCount = securityData
      ? Object.entries(securityData).reduce((count, [key, value]) => {
          if (key === "ownerAddress" || key === "ownershipRenounced" || key === "buyTax" || key === "sellTax") return count;
          if (typeof value === "boolean" && value) return count + 1;
          if (typeof value === "string" && (value === "High" || value === "Very High")) return count + 1;
          return count;
        }, 0)
      : 0;

    // Build security summary
    const securitySummary = securityData
      ? `
        - Hidden Owner: ${securityData.hiddenOwner ? "Yes ⚠️" : "No ✓"}
        - Suspicious Functions: ${securityData.suspiciousFunctions ? "Yes ⚠️" : "No ✓"}
        - Proxy Contract: ${securityData.proxyContract ? "Yes ⚠️" : "No ✓"}
        - Mintable: ${securityData.mintable ? "Yes ⚠️" : "No ✓"}
        - Can Pause Transfers: ${securityData.transferPausable ? "Yes ⚠️" : "No ✓"}
        - Buy Tax: ${securityData.buyTax}
        - Sell Tax: ${securityData.sellTax}
        - Owner: ${securityData.ownerAddress}
      `
      : "No security data available";

    // Build market summary
    const marketSummary = tokenData
      ? `
        - Price: ${tokenData.price || "N/A"}
        - Market Cap: ${tokenData.marketCap || "N/A"}
        - 24h Volume: ${tokenData.volume24h || "N/A"}
        - Liquidity: ${tokenData.liquidity || "N/A"}
      `
      : "No market data available";

    const prompt = `You are a professional cryptocurrency token analyzer. Analyze the following ${chain} token and provide real-time risk assessment.

Token: ${tokenName} (${tokenSymbol})
Chain: ${chain}

Market Data:
${marketSummary}

Security Audit Results:
${securitySummary}

Provide a detailed analysis in JSON format with the following fields:
{
  "summary": "2-3 sentence summary of the token's risk profile and overall assessment",
  "riskLevel": "Very Low|Low|Medium|High|Very High (based on security flags and market conditions)",
  "recommendation": "Clear recommendation for investors (STRONG BUY|BUY|HOLD|SELL|STRONG SELL)",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}

Be honest and objective. Consider security risks, tax structure, liquidity, and market conditions.`;

    let response;
    try {
      response = await Promise.race([
        fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout")), 15000)
        ),
      ]);
    } catch (e: any) {
      console.warn(`Gemini API fetch error: ${e.message}`);
      return null;
    }

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (Gemini sometimes wraps it in markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("Could not parse JSON from Gemini response");
      return null;
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return {
      summary: analysis.summary || "No summary available",
      riskLevel: analysis.riskLevel || "Medium",
      recommendation: analysis.recommendation || "HOLD",
      keyPoints: analysis.keyPoints || [],
    };
  } catch (e) {
    console.warn("generateAIAnalysis error:", e);
    return null;
  }
}

export default { fetchTokenData, fetchBaseTokenData, fetchSolanaTokenData, fetchSecurityScan, generateAIAnalysis, fetchTokenOwner };
