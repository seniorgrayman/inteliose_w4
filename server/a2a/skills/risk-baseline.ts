import type { Part, RiskBaselineInput } from "../types.js";

/**
 * Risk Baseline Skill
 * Quick security scan — no AI call, fast and lightweight
 */
export async function executeRiskBaseline(
  input: RiskBaselineInput
): Promise<{ parts: Part[]; error?: string }> {
  const { tokenAddress, chain } = input;

  if (!tokenAddress) {
    return { parts: [], error: "tokenAddress is required" };
  }

  if (!["Base", "Solana"].includes(chain)) {
    return { parts: [], error: "chain must be 'Base' or 'Solana'" };
  }

  try {
    // Fetch from DexScreener for basic data
    const dexRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { signal: AbortSignal.timeout(8000) }
    );

    let tokenInfo: any = null;
    if (dexRes.ok) {
      const dexData = await dexRes.json();
      if (dexData.pairs && dexData.pairs.length > 0) {
        const pair = dexData.pairs[0];
        tokenInfo = {
          name: pair.baseToken?.name || "Unknown",
          symbol: pair.baseToken?.symbol || "???",
          price: pair.priceUsd,
          volume24h: pair.volume?.h24,
          liquidity: pair.liquidity?.usd,
          marketCap: pair.marketCap,
          pairCreatedAt: pair.pairCreatedAt,
        };
      }
    }

    if (!tokenInfo) {
      return { parts: [], error: "Token not found on DexScreener" };
    }

    // Compute risk signals from available data
    const riskFlags: string[] = [];
    let riskScore = 0;

    // Liquidity check
    if (!tokenInfo.liquidity || tokenInfo.liquidity < 10000) {
      riskFlags.push("Very low liquidity (< $10K)");
      riskScore += 30;
    } else if (tokenInfo.liquidity < 50000) {
      riskFlags.push("Low liquidity (< $50K)");
      riskScore += 15;
    }

    // Volume check
    if (!tokenInfo.volume24h || tokenInfo.volume24h < 1000) {
      riskFlags.push("Very low 24h volume (< $1K)");
      riskScore += 25;
    } else if (tokenInfo.volume24h < 10000) {
      riskFlags.push("Low 24h volume (< $10K)");
      riskScore += 10;
    }

    // Age check
    if (tokenInfo.pairCreatedAt) {
      const ageMs = Date.now() - tokenInfo.pairCreatedAt;
      const ageHours = ageMs / (1000 * 60 * 60);
      if (ageHours < 24) {
        riskFlags.push("Token pair is less than 24 hours old");
        riskScore += 20;
      } else if (ageHours < 72) {
        riskFlags.push("Token pair is less than 3 days old");
        riskScore += 10;
      }
    }

    // Market cap sanity
    if (tokenInfo.marketCap && tokenInfo.liquidity) {
      const mcToLiq = tokenInfo.marketCap / tokenInfo.liquidity;
      if (mcToLiq > 50) {
        riskFlags.push("Market cap to liquidity ratio is very high (> 50x)");
        riskScore += 20;
      }
    }

    // Determine risk baseline
    let riskBaseline: "Low" | "Moderate" | "Elevated" | "Critical";
    if (riskScore >= 60) riskBaseline = "Critical";
    else if (riskScore >= 40) riskBaseline = "Elevated";
    else if (riskScore >= 20) riskBaseline = "Moderate";
    else riskBaseline = "Low";

    const result = {
      tokenAddress,
      chain,
      tokenInfo: {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        price: tokenInfo.price ? `$${parseFloat(tokenInfo.price).toFixed(8)}` : null,
        liquidity: tokenInfo.liquidity ? `$${(tokenInfo.liquidity / 1e6).toFixed(2)}M` : null,
        volume24h: tokenInfo.volume24h ? `$${(tokenInfo.volume24h / 1e6).toFixed(2)}M` : null,
        marketCap: tokenInfo.marketCap ? `$${(tokenInfo.marketCap / 1e6).toFixed(2)}M` : null,
      },
      riskBaseline,
      riskScore,
      riskFlags,
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
          text: `Risk: ${riskBaseline} (score: ${riskScore}/100) | ${riskFlags.length} flags: ${riskFlags.join("; ")}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      parts: [],
      error: `Risk baseline scan failed: ${error.message}`,
    };
  }
}
