import { searchCasts } from "./neynar-client.js";

const POSITIVE_WORDS = [
  "bullish", "moon", "gem", "pump", "buy", "ape", "based", "alpha",
  "strong", "hold", "hodl", "love", "great", "amazing", "rocket",
  "fire", "legit", "solid", "undervalued", "opportunity",
];

const NEGATIVE_WORDS = [
  "bearish", "scam", "rug", "dump", "sell", "avoid", "fake", "dead",
  "fraud", "ponzi", "honeypot", "exit", "rugpull", "sketch", "sus",
  "overvalued", "red flag", "warning", "risky", "crash",
];

export interface SocialSignal {
  mentionCount: number;
  sentimentScore: number; // -1 to 1
  trendDirection: "up" | "down" | "neutral";
  sampleCasts: Array<{ text: string; author: string; timestamp: string }>;
}

/**
 * Get Farcaster social sentiment for a token
 */
export async function getFarcasterSentiment(
  tokenName: string,
  tokenAddress: string
): Promise<SocialSignal> {
  // Search by token name (more likely to have results than address)
  const result = await searchCasts(tokenName, 25);

  const casts = (result as any)?.result?.casts || [];

  if (casts.length === 0) {
    return {
      mentionCount: 0,
      sentimentScore: 0,
      trendDirection: "neutral",
      sampleCasts: [],
    };
  }

  // Filter to last 24h
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentCasts = casts.filter(
    (c: any) => new Date(c.timestamp).getTime() > oneDayAgo
  );

  // Sentiment scoring
  let positiveCount = 0;
  let negativeCount = 0;

  for (const cast of recentCasts) {
    const text = (cast.text || "").toLowerCase();
    for (const word of POSITIVE_WORDS) {
      if (text.includes(word)) positiveCount++;
    }
    for (const word of NEGATIVE_WORDS) {
      if (text.includes(word)) negativeCount++;
    }
  }

  const total = positiveCount + negativeCount;
  const sentimentScore = total === 0 ? 0 :
    (positiveCount - negativeCount) / total;

  const trendDirection: "up" | "down" | "neutral" =
    sentimentScore > 0.2 ? "up" :
    sentimentScore < -0.2 ? "down" :
    "neutral";

  const sampleCasts = recentCasts.slice(0, 5).map((c: any) => ({
    text: (c.text || "").slice(0, 200),
    author: c.author?.username || `fid:${c.author?.fid}`,
    timestamp: c.timestamp,
  }));

  return {
    mentionCount: recentCasts.length,
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    trendDirection,
    sampleCasts,
  };
}
