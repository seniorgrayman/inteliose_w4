/**
 * Query complexity detection and burn pricing.
 * Ported from montrafi burn-pricing (additive multiplier model).
 */

export type ComplexityLevel = "simple" | "medium" | "complex" | "very_complex";

const USD_COST_TIERS: Record<ComplexityLevel, number> = {
  simple: 1,
  medium: 3,
  complex: 10,
  very_complex: 32,
};

const VERY_COMPLEX_INDICATORS = [
  "backtest", "monte carlo", "portfolio", "correlation",
  "regression", "optimization", "strategy",
];

const COMPLEX_INDICATORS = [
  "analyze", "compare", "trend", "forecast",
  "prediction", "signal", "indicator",
];

export function analyzeComplexity(query: string): ComplexityLevel {
  const q = query.toLowerCase();
  if (VERY_COMPLEX_INDICATORS.some((i) => q.includes(i))) return "very_complex";
  if (COMPLEX_INDICATORS.some((i) => q.includes(i))) return "complex";
  if (query.length > 200) return "medium";
  return "simple";
}

export function detectResourceRequirements(query: string) {
  const q = query.toLowerCase();
  return {
    requiresRealTimeData: /real.?time|live|current|now|today/.test(q),
    requiresHistoricalData: /historical|past|history|last|previous|year|month|week/.test(q),
    requiresMultipleMarkets: /compare|vs|versus|and|both|multiple/.test(q),
  };
}

/**
 * USD-based pricing with exponential complexity scaling.
 * Tiers:  simple=1x, medium=3x, complex=10x, very_complex=32x
 * Resources: real-time +50%, historical +30%, multi-market +40% (additive)
 */
export function calculateUsdCost(query: string, baseUsd: number): {
  usdCost: number;
  complexity: ComplexityLevel;
  multipliers: string[];
} {
  const complexity = analyzeComplexity(query);
  const resources = detectResourceRequirements(query);

  const tierMultiplier = USD_COST_TIERS[complexity];

  let resourceMultiplier = 1;
  const multipliers: string[] = [];
  if (resources.requiresRealTimeData) {
    resourceMultiplier += 0.5;
    multipliers.push("real_time");
  }
  if (resources.requiresHistoricalData) {
    resourceMultiplier += 0.3;
    multipliers.push("historical");
  }
  if (resources.requiresMultipleMarkets) {
    resourceMultiplier += 0.4;
    multipliers.push("multiple_markets");
  }

  const usdCost = parseFloat((baseUsd * tierMultiplier * resourceMultiplier).toFixed(2));

  return { usdCost, complexity, multipliers };
}
