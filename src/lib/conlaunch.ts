export type ConLaunchToken = {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  image?: string | null;
  vault_percentage?: number;
  deployed_ago?: number;
  address?: string;
  agent?: string;
  launchedAt?: string;
  source?: string;
};

// Clawnch API - Memecoin launches on Base via Clanker
const BASE = "/api";

async function getJson(path: string) {
  try {
    const url = `${BASE}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Clawnch API error: ${res.status}`);
    return res.json();
  } catch (e: any) {
    console.warn("Clawnch API error:", e.message);
    throw e;
  }
}

/**
 * Calculate approximate minutes since launch
 * @param launchedAt ISO timestamp string
 * @returns Minutes since launch
 */
function getMinutesSinceLaunch(launchedAt?: string): number | undefined {
  if (!launchedAt) return undefined;
  try {
    const launchTime = new Date(launchedAt).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - launchTime) / (1000 * 60));
    return minutes < 0 ? undefined : minutes;
  } catch {
    return undefined;
  }
}

/**
 * Fetch latest launched tokens from Clawnch
 * @param limit Number of tokens to fetch (1-100)
 * @param offset Pagination offset
 * @returns Array of ConLaunchToken
 */
export async function listTokens(limit = 8, offset = 0): Promise<ConLaunchToken[]> {
  try {
    const data = await getJson(`/tokens?limit=${Math.min(limit, 100)}&offset=${offset}`);
    const tokens = data?.tokens ?? [];
    
    if (!Array.isArray(tokens) || tokens.length === 0) {
      console.warn("No tokens found in Clawnch API response");
      return [];
    }
    
    return tokens.map((token: any) => ({
      id: token.address ?? String(Math.random()),
      name: token.name ?? "Unknown Token",
      symbol: token.symbol ?? "???",
      description: token.description ?? undefined,
      image: token.image ?? null,
      vault_percentage: undefined, // Clawnch doesn't have vault data
      deployed_ago: getMinutesSinceLaunch(token.launchedAt),
      address: token.address ?? undefined,
      agent: token.agent ?? undefined,
      launchedAt: token.launchedAt ?? undefined,
      source: token.source ?? undefined, // 'moltbook', 'moltx', or '4claw'
    }));
  } catch (e) {
    console.warn("Clawnch listTokens failed, returning empty array");
    return [];
  }
}

/**
 * Fetch detailed analytics for a specific token
 * @param address Token contract address on Base
 * @returns Token analytics including price, volume, market cap
 */
export async function getTokenAnalytics(address: string): Promise<any | null> {
  try {
    const data = await getJson(`/analytics/token/${address}`);
    return data ?? null;
  } catch (e) {
    console.warn("Clawnch getTokenAnalytics failed for", address);
    return null;
  }
}

/**
 * Fetch a single token from Clawnch by contract address
 * @param address Token contract address on Base
 * @returns ConLaunchToken or null
 */
export async function getToken(address: string): Promise<ConLaunchToken | null> {
  try {
    // Use tokens endpoint with address filter
    const data = await getJson(`/tokens?address=${address}`);
    const tokens = data?.tokens ?? [];
    
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return null;
    }
    
    const token = tokens[0];
    return {
      id: token.address ?? address,
      name: token.name ?? "Unknown Token",
      symbol: token.symbol ?? "???",
      description: token.description ?? undefined,
      image: token.image ?? null,
      vault_percentage: undefined,
      deployed_ago: getMinutesSinceLaunch(token.launchedAt),
      address: token.address ?? address,
      agent: token.agent ?? undefined,
      launchedAt: token.launchedAt ?? undefined,
      source: token.source ?? undefined,
    };
  } catch (e) {
    console.warn("Clawnch getToken failed for", address);
    return null;
  }
}

export default { listTokens, getToken, getTokenAnalytics };
