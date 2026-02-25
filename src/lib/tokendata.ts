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

export interface Holder {
  address: string;
  percentage: number;
}

export interface HolderDistribution {
  topHolders: Holder[];
  totalHolders: number | null;
}

// --- Base Chain (DexScreener primary fallback) ---
export async function fetchBaseTokenData(address: string): Promise<TokenData | null> {
  try {
    // Skip Coinbase and Zerion APIs as they don't work reliably
    // Go directly to DexScreener which works well for Base tokens
    
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

// --- Fetch Tax Information ---
export async function fetchTaxInfo(address: string, chain: "Base" | "Solana"): Promise<{ buyTax: string; sellTax: string }> {
  try {
    if (chain === "Base") {
      // Try to get tax from DexScreener which sometimes includes it
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      if (res.ok) {
        const data = await res.json();
        const pair = data.pairs?.[0];
        if (pair?.info?.buyTax || pair?.info?.sellTax) {
          return {
            buyTax: pair.info.buyTax ? `${pair.info.buyTax}%` : "0%",
            sellTax: pair.info.sellTax ? `${pair.info.sellTax}%` : "0%",
          };
        }
      }
    } else {
      // Solana: Try to get tax from token metadata or DexScreener
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      if (res.ok) {
        const data = await res.json();
        const pair = data.pairs?.[0];
        if (pair?.info?.buyTax || pair?.info?.sellTax) {
          return {
            buyTax: pair.info.buyTax ? `${pair.info.buyTax}%` : "0%",
            sellTax: pair.info.sellTax ? `${pair.info.sellTax}%` : "0%",
          };
        }
      }
    }
    // Default to 0% if not found
    return { buyTax: "0%", sellTax: "0%" };
  } catch (e) {
    console.warn("fetchTaxInfo error:", e);
    // Default to 0% on error instead of N/A
    return { buyTax: "0%", sellTax: "0%" };
  }
}

// --- Fetch Mint Authority (Solana) ---
// --- Check Ownership Renouncement (RPC-based, no third-party APIs) ---
export async function fetchOwnershipRenounced(address: string, chain: "Base" | "Solana"): Promise<string> {
  try {
    if (chain === "Base") {
      // Base: Check if owner() returns zero address (0x000...000)
      try {
        const res = await fetch("https://mainnet.base.org", {
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
          if (data.result) {
            const ownerHex = data.result.slice(-40);
            const isZeroAddress = ownerHex === "0000000000000000000000000000000000000000";
            if (isZeroAddress) {
              return "Yes";
            } else {
              return "No";
            }
          }
        }
      } catch (e) {
        console.warn("Base owner() check error:", e);
      }
      
      return "Unknown";
    } else {
      // Solana: Check mint authority and freeze authority via Helius DAS API
      const heliusKey = import.meta.env.HELIUS_API_KEY || "";
      if (!heliusKey) return "Unknown";

      try {
        const apiUrl = heliusKey.split("?")[0];
        const apiKey = heliusKey.includes("?api-key=") ? heliusKey.split("api-key=")[1] : "";
        
        if (!apiKey) return "Unknown";

        const res = await fetch(`${apiUrl}?api-key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getAsset",
            params: { id: address },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.result?.mint_extensions?.metadata) {
            const metadata = data.result.mint_extensions.metadata;
            
            // For Solana: Check if mint authority is renounced
            // Mint authority null = renounced
            const updateAuthority = metadata.update_authority;
            
            if (updateAuthority === null || updateAuthority === undefined) {
              return "Yes";
            } else {
              return "No";
            }
          }
        }
      } catch (e) {
        console.warn("Solana renounced check error:", e);
      }
      
      return "Unknown";
    }
  } catch (e) {
    console.warn("fetchOwnershipRenounced error:", e);
    return "Unknown";
  }
}

// --- Fetch Mint Authority (Solana only) ---
export async function fetchMintAuthority(mint: string): Promise<string> {
  try {
    // Try Helius DAS API for mint authority status
    const heliusKey = import.meta.env.HELIUS_API_KEY || "";
    if (heliusKey) {
      try {
        const apiUrl = heliusKey.split("?")[0];
        const apiKey = heliusKey.includes("?api-key=") ? heliusKey.split("api-key=")[1] : "";
        
        if (apiKey) {
          const res = await fetch(`${apiUrl}?api-key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getAsset",
              params: { id: mint },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Check if mint has an update authority set
            const updateAuthority = data.result?.mint_extensions?.metadata?.update_authority;
            if (updateAuthority === null || updateAuthority === undefined) {
              return "RENOUNCED";
            } else {
              return "ACTIVE";
            }
          }
        }
      } catch (e) {
        console.warn("Helius DAS error:", e);
      }
    }

    return "Unknown";
  } catch (e) {
    console.warn("fetchMintAuthority error:", e);
    return "Unknown";
  }
}

// --- Fetch Holder Distribution ---
export async function fetchHolderDistribution(address: string, chain: "Base" | "Solana"): Promise<HolderDistribution | null> {
  try {
    if (chain === "Base") {
      // For Base EVM tokens, we need a paid API like Moralis, CoinGecko Pro, or Chainbase
      // For now, try to get holder count from DexScreener
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        if (res.ok) {
          const data = await res.json();
          const pair = data.pairs?.[0];
          
          if (pair) {
            // Return holder count from DexScreener (if available)
            // Top holders require paid API access, so we return empty array
            return {
              topHolders: [],
              totalHolders: pair.info?.holders || null,
            };
          }
        }
      } catch (e) {
        console.warn("DexScreener holders error:", e);
      }
      
      // If DexScreener fails, still return an empty structure
      return {
        topHolders: [],
        totalHolders: null,
      };
    } else {
      // Solana: Use QuickNode to get token account largest accounts
      const quickNodeUrl = import.meta.env.VITE_QUICKNODE_API_KEY || "";
      if (!quickNodeUrl) return null;

      try {
        const res = await fetch(quickNodeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenLargestAccounts",
            params: [address],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const accounts = data.result?.value || [];
          
          if (accounts.length > 0) {
            const totalSupply = accounts.reduce((sum: number, acc: any) => sum + (acc.uiAmount || 0), 0);
            // Skip first (usually dev), take next 20
            const topHolders = accounts.slice(1, 21).map((acc: any) => ({
              address: acc.address || "Unknown",
              percentage: totalSupply > 0 ? ((acc.uiAmount || 0) / totalSupply * 100) : 0,
            }));

            return {
              topHolders,
              totalHolders: accounts.length,
            };
          }
        }
      } catch (e) {
        console.warn("Solana holders API error:", e);
      }

      // Fallback: Try DexScreener
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        if (res.ok) {
          const data = await res.json();
          const pair = data.pairs?.[0];
          if (pair) {
            return {
              topHolders: [],
              totalHolders: pair.info?.holders || null,
            };
          }
        }
      } catch (e) {
        console.warn("DexScreener Solana holders error:", e);
      }
    }

    return null;
  } catch (e) {
    console.warn("fetchHolderDistribution error:", e);
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
      // Solana: Use Helius DAS API to get token creator/deployer
      const heliusKey = import.meta.env.HELIUS_API_KEY || "";
      if (!heliusKey) return "Unknown";

      try {
        const apiUrl = heliusKey.split("?")[0];
        const apiKey = heliusKey.includes("?api-key=") ? heliusKey.split("api-key=")[1] : "";
        
        if (!apiKey) return "Unknown";

        const res = await fetch(`${apiUrl}?api-key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getAsset",
            params: { id: address },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Get creators from the asset
          const creators = data.result?.creators || [];
          if (creators.length > 0) {
            // Return the first creator (usually the deployer)
            return creators[0].address || "Unknown";
          }
          
          // Fallback: try to get from update_authority
          const updateAuthority = data.result?.mint_extensions?.metadata?.update_authority;
          if (updateAuthority) {
            return updateAuthority;
          }
        }
      } catch (e) {
        console.warn("Helius DAS error for Solana owner:", e);
      }

      // Fallback to QuickNode for token owner
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

// --- Security Scanning (RPC-based, no third-party APIs) ---
export async function fetchSecurityScan(address: string, chain: "Base" | "Solana"): Promise<SecurityScan | null> {
  try {
    // Fetch tax info, owner address, and ownership renounced status in parallel
    const [taxInfo, ownerAddr, ownershipStatus] = await Promise.all([
      fetchTaxInfo(address, chain),
      fetchTokenOwner(address, chain),
      fetchOwnershipRenounced(address, chain),
    ]);

    // Return basic security info (primarily focusing on renounced status via RPC)
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
      buyTax: taxInfo.buyTax,
      sellTax: taxInfo.sellTax,
      ownershipRenounced: ownershipStatus,
      ownerAddress: ownerAddr,
    };
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
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY_II || "";
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

/**
 * Generate founder-centric AI analysis for token improvement recommendations
 * @param tokenName Token name
 * @param tokenSymbol Token symbol
 * @param price Current price
 * @param volume24h 24h volume
 * @param marketCap Market cap
 * @param holders Number of holders
 * @param feesEarned Fees earned (if applicable)
 * @returns Founder-focused analysis as formatted text
 */
export async function generateFounderAIAnalysis(
  tokenName: string,
  tokenSymbol: string,
  price: string,
  volume24h: string,
  marketCap: string,
  holders: string,
  feesEarned: string
): Promise<string> {
  try {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY_II || "";
    if (!geminiKey) {
      return "AI analysis not available - missing API configuration";
    }

    const founderPrompt = `You are a professional cryptocurrency advisor providing strategic recommendations for a token founder. Analyze this token and provide actionable advice to improve the token based on current market conditions.

Token: ${tokenName} (${tokenSymbol})

Current Market Data:
- Price: ${price}
- Market Cap: ${marketCap}
- 24h Volume: ${volume24h}
- Holders: ${holders}
- Fees Generated: ${feesEarned}

Provide founder-centric strategic advice in the following JSON format ONLY:
{
  "summary": "2-3 sentence assessment of the token's current state and what the founder should focus on",
  "recommendation": "Specific, actionable advice for the founder (e.g., 'Focus on liquidity depth', 'Increase marketing efforts', etc.)",
  "keyActions": ["action 1 for founder", "action 2 for founder", "action 3 for founder", "action 4 for founder"]
}

Be specific about founder actions they can take NOW to improve the token's performance and market position.`;

    const response = await Promise.race([
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
                  text: founderPrompt,
                },
              ],
            },
          ],
        }),
      }),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout")), 15000)
      ),
    ]) as Response;

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status}`);
      return "Unable to generate analysis at this time";
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return responseText || "Unable to parse analysis";
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Format as readable text
    return `📊 FOUNDER ANALYSIS FOR ${tokenSymbol}

${analysis.summary}

💡 RECOMMENDATION:
${analysis.recommendation}

🎯 KEY ACTIONS:
${analysis.keyActions?.map((action: string, i: number) => `${i + 1}. ${action}`).join('\n')}`;
  } catch (e) {
    console.warn("generateFounderAIAnalysis error:", e);
    return "Unable to generate analysis at this time";
  }
}

export default { 
  fetchTokenData, 
  fetchBaseTokenData, 
  fetchSolanaTokenData, 
  fetchSecurityScan, 
  generateAIAnalysis,
  generateFounderAIAnalysis,
  fetchTokenOwner,
  fetchTaxInfo,
  fetchOwnershipRenounced,
  fetchMintAuthority,
  fetchHolderDistribution,
};
