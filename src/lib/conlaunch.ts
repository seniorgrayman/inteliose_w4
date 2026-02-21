export type ConLaunchToken = {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  image?: string | null;
  vault_percentage?: number;
  deployed_ago?: number;
  address?: string;
};

// ConLaunch API - note: may have CORS restrictions or API structure changes
// For now, return empty to gracefully fall back to mock data in components
const BASE = "https://conlaunch.com/api";

async function getJson(path: string) {
  try {
    const url = `${BASE}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`ConLaunch fetch failed: ${res.status}`);
    return res.json();
  } catch (e: any) {
    console.warn("ConLaunch API error:", e.message);
    throw e;
  }
}

export async function listTokens(page = 1, limit = 8): Promise<ConLaunchToken[]> {
  try {
    // Try /tokens endpoint first
    const data = await getJson(`/tokens?page=${page}&limit=${limit}`);
    const items = Array.isArray(data) ? data : data?.data ?? [];
    
    if (!items.length) return [];
    
    return items.map((it: any) => ({
      id: it.id ?? it.slug ?? String(it.address ?? it.name ?? Math.random()),
      name: it.name ?? it.title ?? it.slug ?? "Unknown",
      symbol: it.symbol ?? it.ticker ?? undefined,
      description: it.description ?? it.short_description ?? undefined,
      image: it.image ?? it.logo ?? null,
      vault_percentage: it.vault_pct ?? it.vault_percentage ?? 0,
      deployed_ago: it.deployed_ago ?? it.age_minutes ?? undefined,
      address: it.address ?? it.token_address ?? undefined,
    }));
  } catch (e) {
    console.warn("ConLaunch listTokens unavailable, using fallback");
    return []; // Return empty; component will use mock data
  }
}

export async function getToken(addressOrSlug: string): Promise<ConLaunchToken | null> {
  try {
    const data = await getJson(`/tokens/${addressOrSlug}`);
    const it = data?.data ?? data;
    if (!it) return null;
    return {
      id: it.id ?? it.slug ?? String(it.address ?? it.name ?? Math.random()),
      name: it.name ?? it.title ?? it.slug ?? "Unknown",
      symbol: it.symbol ?? it.ticker ?? undefined,
      description: it.description ?? it.short_description ?? undefined,
      image: it.image ?? it.logo ?? null,
      vault_percentage: it.vault_pct ?? it.vault_percentage ?? 0,
      deployed_ago: it.deployed_ago ?? it.age_minutes ?? undefined,
      address: it.address ?? it.token_address ?? undefined,
    };
  } catch (e) {
    console.warn("ConLaunch getToken unavailable for", addressOrSlug);
    return null;
  }
}

export default { listTokens, getToken };
