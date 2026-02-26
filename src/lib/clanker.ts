/**
 * Clanker.world API client
 * Fetches token data from Clanker through our backend proxy
 */

export interface ClankerToken {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  logo_uri?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  price_usd?: number;
  market_cap_usd?: number;
  volume_24h_usd?: number;
  liquidity_usd?: number;
  contract_address: string;
  chain: "base";
  created_at: string;
  deployer?: string;
  total_supply?: string;
  holder_count?: number;
  buy_tax?: number;
  sell_tax?: number;
}

export interface ClankerTokensResponse {
  tokens: ClankerToken[];
  page: number;
  limit: number;
  total?: number;
  timestamp: string;
}

const BACKEND_BASE = "/api";

/**
 * Fetch recent Clanker tokens from the Clanker API (via backend proxy)
 */
export async function fetchClankerTokens(
  limit: number = 20,
  page: number = 1
): Promise<ClankerToken[]> {
  try {
    const url = new URL(`${BACKEND_BASE}/intel/clanker/tokens`, window.location.origin);
    url.searchParams.set("limit", Math.min(limit, 50).toString());
    url.searchParams.set("page", Math.max(1, page).toString());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Clanker API returned ${response.status}: ${response.statusText}`);
      // Try to parse error response
      try {
        const errorData = await response.json();
        console.warn("Error details:", errorData);
      } catch {
        // If response isn't JSON, just log the status
      }
      return [];
    }

    const data: ClankerTokensResponse = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error("Error fetching Clanker tokens:", error);
    // Return empty array so UI shows empty state instead of crashing
    return [];
  }
}

/**
 * Format token price for display
 */
export function formatPrice(price: number | undefined): string {
  if (!price) return "$0";
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

/**
 * Format market cap or volume for display
 */
export function formatLargeNumber(num: number | undefined): string {
  if (!num) return "N/A";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format time since creation
 */
export function formatTimeSince(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return "unknown";
  }
}
