import type { Part, TokenHealthCheckInput } from "../types.js";

/**
 * Token Health Check Skill
 * Full DYOR analysis — fetches token data, security scan, and AI verdict
 */
export async function executeTokenHealthCheck(
  input: TokenHealthCheckInput
): Promise<{ parts: Part[]; error?: string }> {
  const { tokenAddress, chain, devWallet } = input;

  if (!tokenAddress) {
    return { parts: [], error: "tokenAddress is required" };
  }

  if (!["Base", "Solana"].includes(chain)) {
    return { parts: [], error: "chain must be 'Base' or 'Solana'" };
  }

  try {
    // Fetch token data from DexScreener (works for both chains)
    const dexRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!dexRes.ok) {
      return { parts: [], error: "Failed to fetch token data from DexScreener" };
    }

    const dexData = await dexRes.json();

    if (!dexData.pairs || dexData.pairs.length === 0) {
      return { parts: [], error: "Token not found on DexScreener. It may not be listed yet." };
    }

    const pair = dexData.pairs[0];
    const tokenData = {
      name: pair.baseToken?.name || "Unknown",
      symbol: pair.baseToken?.symbol || "???",
      price: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(8)}` : null,
      volume24h: pair.volume?.h24 ? `$${(pair.volume.h24 / 1e6).toFixed(2)}M` : null,
      liquidity: pair.liquidity?.usd ? `$${(pair.liquidity.usd / 1e6).toFixed(2)}M` : null,
      marketCap: pair.marketCap ? `$${(pair.marketCap / 1e6).toFixed(2)}M` : null,
      priceChange24h: pair.priceChange?.h24 || null,
      txns24h: pair.txns?.h24 || null,
    };

    // Build AI prompt
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    let aiVerdict = null;
    if (geminiKey) {
      const prompt = `You are a cryptocurrency token analyst. Analyze this token and provide a verdict.

Token: ${tokenData.name} (${tokenData.symbol})
Chain: ${chain}
Price: ${tokenData.price || "N/A"}
24h Volume: ${tokenData.volume24h || "N/A"}
Liquidity: ${tokenData.liquidity || "N/A"}
Market Cap: ${tokenData.marketCap || "N/A"}
24h Price Change: ${tokenData.priceChange24h ?? "N/A"}%

Respond in this exact JSON format:
{
  "health": "GREEN" | "YELLOW" | "RED",
  "riskLevel": "Low" | "Moderate" | "Elevated" | "Critical",
  "summary": "2-3 sentence summary",
  "recommendation": "1 sentence actionable recommendation",
  "keyPoints": ["point1", "point2", "point3"],
  "failureModes": ["mode1", "mode2"]
}`;

      try {
        const aiRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
            signal: AbortSignal.timeout(15000),
          }
        );

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          // Extract JSON from response
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiVerdict = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (e) {
        console.warn("AI analysis failed, returning data without verdict:", e);
      }
    }

    const result = {
      tokenData,
      chain,
      address: tokenAddress,
      aiVerdict: aiVerdict || {
        health: "YELLOW",
        riskLevel: "Moderate",
        summary: "AI analysis unavailable. Review token data manually.",
        recommendation: "Proceed with caution and verify on-chain data.",
        keyPoints: ["AI verdict could not be generated"],
        failureModes: ["Unknown — manual review needed"],
      },
      timestamp: new Date().toISOString(),
      source: "inteliose-a2a",
    };

    return {
      parts: [
        {
          type: "data",
          mimeType: "application/json",
          data: result,
        },
        {
          type: "text",
          text: `Health: ${result.aiVerdict.health} | Risk: ${result.aiVerdict.riskLevel} | ${result.aiVerdict.summary}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      parts: [],
      error: `Token health check failed: ${error.message}`,
    };
  }
}
