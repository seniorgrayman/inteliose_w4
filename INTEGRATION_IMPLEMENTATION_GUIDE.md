# DAO INTELLIS: Implementation Guide for AI Verdict Integration

A step-by-step guide for integrating the AI verdict system into a new application.

---

## Table of Contents

1. [Phase 1: Setup & Configuration](#phase-1-setup--configuration)
2. [Phase 2: Data Collection Endpoints](#phase-2-data-collection-endpoints)
3. [Phase 3: AI Verdict Engine](#phase-3-ai-verdict-engine)
4. [Phase 4: Testing & Validation](#phase-4-testing--validation)
5. [Phase 5: Frontend Integration](#phase-5-frontend-integration)

---

## Phase 1: Setup & Configuration

### Step 1.1: Environment Setup

Create `.env.local`:

```bash
# GEMINI AI (Required)
VITE_GEMINI_API_KEY_II=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# SOLANA RPC PROVIDERS (At least one required)
QUICKNODE_API_KEY=https://your-quicknode-endpoint.solana-mainnet.quiknode.pro/[key]/
HELIUS_API_KEY=https://mainnet.helius-rpc.com/?api-key=[key]
ALCHEMY_API=https://solana-mainnet.g.alchemy.com/v2/[key]

# BASE CHAIN (Optional)
BASE_RPC_URL=https://mainnet.base.org
COINBASE_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/[key]

# DATA PROVIDERS
ZERION_API_KEY_BASE=zk_[your_key]
BUBBLEMAPS_API_KEY=your_bubblemaps_key
BUBBLEMAPS_API_BASE=https://api.bubblemaps.io

# WALLET (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id
NEXT_PUBLIC_BUBBLEMAP_PARTNER_ID=demo
```

### Step 1.2: Create RPC Utilities

Create `lib/solana/rpc-hardcoded.ts`:

```typescript
// Load RPC URLs from environment
export const HARDCODED_QUICKNODE_RPC_URL =
  (process.env.QUICKNODE_API_KEY ?? "").trim() || null;

export const HARDCODED_HELIUS_RPC_URL =
  (process.env.HELIUS_API_KEY ?? "").trim() || null;

export const HARDCODED_HELIUS_API_KEY =
  HARDCODED_HELIUS_RPC_URL
    ? HARDCODED_HELIUS_RPC_URL.match(/api-key=([^&]+)/)?.[1] ?? null
    : null;

export const HARDCODED_ALCHEMY_RPC_URL =
  (process.env.ALCHEMY_API ?? "").trim() || null;

// Validate at startup
if (!HARDCODED_QUICKNODE_RPC_URL && !HARDCODED_HELIUS_RPC_URL && !HARDCODED_ALCHEMY_RPC_URL) {
  console.warn("⚠️ No Solana RPC providers configured. Token analysis will fail.");
}
```

Create `lib/solana/rpc-fallback.ts`:

```typescript
import { Connection } from "@solana/web3.js";
import {
  HARDCODED_QUICKNODE_RPC_URL,
  HARDCODED_HELIUS_RPC_URL,
  HARDCODED_ALCHEMY_RPC_URL,
} from "@/lib/solana/rpc-hardcoded";

export async function getSolanaConnectionWithFallback(options?: {
  timeoutMs?: number;
}): Promise<{ rpc: string; connection: Connection }> {
  const providers = [
    { name: "quicknode", url: HARDCODED_QUICKNODE_RPC_URL },
    { name: "helius", url: HARDCODED_HELIUS_RPC_URL },
    { name: "alchemy", url: HARDCODED_ALCHEMY_RPC_URL },
  ].filter((p) => p.url);

  if (!providers.length) {
    throw new Error("No RPC providers configured");
  }

  for (const { name, url } of providers) {
    try {
      const connection = new Connection(url!, {
        commitment: "confirmed",
        httpAgent: undefined,
      });

      // Test connection
      await Promise.race([
        connection.getLatestBlockhash(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), options?.timeoutMs ?? 5000)
        ),
      ]);

      console.log(`✓ Connected to Solana via ${name}`);
      return { rpc: name, connection };
    } catch (e) {
      console.warn(`✗ ${name} failed:`, (e as Error).message);
    }
  }

  throw new Error("All RPC providers failed");
}
```

---

## Phase 2: Data Collection Endpoints

### Step 2.1: Create Solana Intelligence Endpoint

Create `app/api/intel/summary/route.ts`:

```typescript
import { Connection, PublicKey, ParsedAccountData } from "@solana/web3.js";
import { getSolanaConnectionWithFallback } from "@/lib/solana/rpc-fallback";
import { getMarketBestEffort } from "@/lib/solana/market-fallback";
import type { IntelSummary } from "@/lib/intel/types";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const responseCache = new Map<string, { at: number; body: IntelSummary | null }>();

function toNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

async function getMintFacts(
  connection: Connection,
  mint: PublicKey
): Promise<{
  decimals: number | null;
  supplyUi: number | null;
  supplyUiString: string | null;
  mintAuthority: string | null;
  freezeAuthority: string | null;
}> {
  try {
    const info = await connection.getParsedAccountInfo(mint, "confirmed");
    const data = info.value?.data;
    const parsed = typeof data === "object" && "parsed" in data
      ? (data as ParsedAccountData)
      : null;

    const decimals = parsed?.parsed?.info?.decimals ?? null;
    const mintAuthority = parsed?.parsed?.info?.mintAuthority ?? null;
    const freezeAuthority = parsed?.parsed?.info?.freezeAuthority ?? null;

    const supplyResp = await connection.getTokenSupply(mint, "confirmed");
    const supplyUi = supplyResp.value.uiAmount ?? null;
    const supplyUiString = supplyResp.value.uiAmountString ?? null;

    return { decimals, supplyUi, supplyUiString, mintAuthority, freezeAuthority };
  } catch (e) {
    console.error("getMintFacts error:", e);
    return { decimals: null, supplyUi: null, supplyUiString: null, mintAuthority: null, freezeAuthority: null };
  }
}

async function getOwnerMintBalanceUi(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey
): Promise<number> {
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(
      owner,
      { mint },
      "confirmed"
    );
    return accounts.value.reduce((sum, a) => {
      const ui = (a.account.data as ParsedAccountData).parsed?.info?.tokenAmount?.uiAmount ?? 0;
      return sum + (typeof ui === "number" ? ui : 0);
    }, 0);
  } catch {
    return 0;
  }
}

async function getHolderCountBestEffort(
  connection: Connection,
  mint: PublicKey
): Promise<number | null> {
  try {
    const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      commitment: "confirmed",
      filters: [
        { dataSize: 165 },
        { memcmp: { offset: 0, bytes: mint.toBase58() } },
      ],
      dataSlice: { offset: 0, length: 0 },
    });
    return accounts.length;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mintStr = searchParams.get("mint")?.trim() ?? "";
  const devWallet = searchParams.get("devWallet")?.trim() ?? "";
  const marketingWallet = searchParams.get("marketingWallet")?.trim() ?? "";

  if (!mintStr) {
    return Response.json({ error: "missing_mint" }, { status: 400 });
  }

  try {
    const cacheKey = [mintStr, devWallet, marketingWallet].join("|");
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.at < 15_000) {
      return Response.json(cached.body, { status: 200 });
    }

    const { rpc, connection } = await getSolanaConnectionWithFallback();

    // Parse mint
    let mintPk: PublicKey;
    try {
      mintPk = new PublicKey(mintStr);
    } catch {
      return Response.json({ error: "invalid_mint" }, { status: 400 });
    }

    // Collect data in parallel
    const [mintFacts, market, holderCount] = await Promise.all([
      getMintFacts(connection, mintPk),
      getMarketBestEffort(mintStr),
      getHolderCountBestEffort(connection, mintPk),
    ]);

    // Get dev holdings if provided
    let devHoldingsUi: number | null = null;
    let devHoldingsPct: number | null = null;
    if (devWallet) {
      try {
        devHoldingsUi = await getOwnerMintBalanceUi(connection, new PublicKey(devWallet), mintPk);
        if (devHoldingsUi && mintFacts.supplyUi) {
          devHoldingsPct = (devHoldingsUi / mintFacts.supplyUi) * 100;
        }
      } catch {
        // Ignore if invalid wallet
      }
    }

    // Get marketing holdings if provided
    let marketingHoldingsUi: number | null = null;
    if (marketingWallet) {
      try {
        marketingHoldingsUi = await getOwnerMintBalanceUi(connection, new PublicKey(marketingWallet), mintPk);
      } catch {
        // Ignore if invalid wallet
      }
    }

    const intel: IntelSummary = {
      mint: mintStr,
      rpc,
      socials: null, // TODO: Fetch from metadata or DexScreener
      mintFacts,
      market,
      holders: {
        holderCount,
        holderCountSource: holderCount ? "tokenAccounts" : "unavailable",
      },
      devHoldingsUi,
      devHoldingsPct,
      marketingHoldingsUi,
      fetchedAt: new Date().toISOString(),
    };

    responseCache.set(cacheKey, { at: Date.now(), body: intel });
    return Response.json(intel, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[/api/intel/summary]", msg);
    return Response.json(
      { error: "fetch_failed", detail: msg },
      { status: 500 }
    );
  }
}
```

### Step 2.2: Market Data Collection

Create `lib/solana/market-fallback.ts`:

```typescript
import { HARDCODED_QUICKNODE_RPC_URL, HARDCODED_HELIUS_API_KEY } from "./rpc-hardcoded";

export type MarketBestEffort = {
  tokenSymbol: string | null;
  tokenName: string | null;
  priceUsd: number | null;
  liquidityUsd: number | null;
  volumeM5: number | null;
  volumeM15: number | null;
  volumeH1: number | null;
  volumeH6: number | null;
  volumeH24: number | null;
  txns: {
    m5: { buys: number | null; sells: number | null };
    h1: { buys: number | null; sells: number | null };
    h6: { buys: number | null; sells: number | null };
    h24: { buys: number | null; sells: number | null };
  };
  priceChange: {
    m5: number | null;
    h1: number | null;
    h6: number | null;
    h24: number | null;
  };
  fdv: number | null;
  marketCap: number | null;
  dexUrl: string | null;
  dexId: string | null;
  pairAddress: string | null;
  pairCreatedAt: number | null;
  source: "quicknode-dexpaprika" | "helius-das" | "unavailable";
  updatedAt: string;
};

async function getJson(url: string, timeoutMs: number = 2000) {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) throw new Error(`http_${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function toNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function quicknodeAddonUrl(pathname: string): string | null {
  if (!HARDCODED_QUICKNODE_RPC_URL) return null;
  return new URL(pathname.replace(/^\//, ""), HARDCODED_QUICKNODE_RPC_URL).toString();
}

async function tryQuickNodeDexPaprikaMarket(mint: string): Promise<MarketBestEffort | null> {
  const tokenUrl = quicknodeAddonUrl(`/addon/912/networks/solana/tokens/${mint}`);
  if (!tokenUrl) return null;

  try {
    const t = await getJson(tokenUrl, 1400);
    const poolsUrl = quicknodeAddonUrl(
      `/addon/912/networks/solana/tokens/${mint}/pools?page=0&limit=1&sort=desc&order_by=volume_usd`
    );
    const pjson = await getJson(poolsUrl!, 1600);
    const bestPool = pjson?.pools?.[0] ?? pjson?.data?.[0];
    const poolId = bestPool?.id;

    if (!poolId) {
      return {
        tokenSymbol: t?.symbol ?? null,
        tokenName: t?.name ?? null,
        priceUsd: null,
        liquidityUsd: null,
        volumeM5: null,
        volumeM15: null,
        volumeH1: null,
        volumeH6: null,
        volumeH24: null,
        txns: { m5: { buys: null, sells: null }, h1: { buys: null, sells: null }, h6: { buys: null, sells: null }, h24: { buys: null, sells: null } },
        priceChange: { m5: null, h1: null, h6: null, h24: null },
        fdv: null,
        marketCap: null,
        dexUrl: tokenUrl,
        dexId: null,
        pairAddress: null,
        pairCreatedAt: null,
        source: "quicknode-dexpaprika",
        updatedAt: new Date().toISOString(),
      };
    }

    const pool0 = await getJson(quicknodeAddonUrl(`/addon/912/networks/solana/pools/${poolId}?inversed=false`)!, 2000);
    const tokens = pool0?.tokens ?? [];
    const foundIdx = tokens.findIndex((x: any) => x?.id === mint);
    const inv = foundIdx === 1;
    const pool = inv
      ? await getJson(quicknodeAddonUrl(`/addon/912/networks/solana/pools/${poolId}?inversed=true`)!, 2000)
      : pool0;

    const priceUsd = toNum(pool?.last_price_usd);
    const liquidityUsd = Array.isArray(pool?.token_reserves)
      ? pool.token_reserves
          .map((r: any) => toNum(r?.reserve_usd))
          .filter((n): n is number => typeof n === "number")
          .reduce((a, b) => a + b, 0) || null
      : null;

    return {
      tokenSymbol: t?.symbol ?? null,
      tokenName: t?.name ?? null,
      priceUsd,
      liquidityUsd,
      volumeM5: toNum(pool?.["5m"]?.volume_usd),
      volumeM15: toNum(pool?.["15m"]?.volume_usd),
      volumeH1: toNum(pool?.["1h"]?.volume_usd),
      volumeH6: toNum(pool?.["6h"]?.volume_usd),
      volumeH24: toNum(pool?.["24h"]?.volume_usd),
      txns: {
        m5: { buys: toNum(pool?.["5m"]?.buys), sells: toNum(pool?.["5m"]?.sells) },
        h1: { buys: toNum(pool?.["1h"]?.buys), sells: toNum(pool?.["1h"]?.sells) },
        h6: { buys: toNum(pool?.["6h"]?.buys), sells: toNum(pool?.["6h"]?.sells) },
        h24: { buys: toNum(pool?.["24h"]?.buys), sells: toNum(pool?.["24h"]?.sells) },
      },
      priceChange: {
        m5: pool?.["5m"]?.last_price_usd_change ? ((pool["5m"].last_price_usd_change / priceUsd) * 100) : null,
        h1: pool?.["1h"]?.last_price_usd_change ? ((pool["1h"].last_price_usd_change / priceUsd) * 100) : null,
        h6: pool?.["6h"]?.last_price_usd_change ? ((pool["6h"].last_price_usd_change / priceUsd) * 100) : null,
        h24: pool?.["24h"]?.last_price_usd_change ? ((pool["24h"].last_price_usd_change / priceUsd) * 100) : null,
      },
      fdv: tokens[foundIdx >= 0 ? foundIdx : 0]?.fdv ?? null,
      marketCap: tokens[foundIdx >= 0 ? foundIdx : 0]?.fdv ?? null,
      dexUrl: quicknodeAddonUrl(`/addon/912/networks/solana/pools/${poolId}`),
      dexId: bestPool?.dex_id ?? "quicknode",
      pairAddress: poolId,
      pairCreatedAt: bestPool?.created_at ? new Date(bestPool.created_at).getTime() : null,
      source: "quicknode-dexpaprika",
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("QuickNode DexPaprika failed:", e);
    return null;
  }
}

const marketCache = new Map<string, { at: number; val: MarketBestEffort }>();

export async function getMarketBestEffort(mint: string): Promise<MarketBestEffort> {
  const key = mint.trim();
  const cached = marketCache.get(key);
  if (cached && Date.now() - cached.at < 15_000) {
    return cached.val;
  }

  // Try QuickNode first
  try {
    const m = await tryQuickNodeDexPaprikaMarket(key);
    if (m) {
      marketCache.set(key, { at: Date.now(), val: m });
      return m;
    }
  } catch (e) {
    console.error("Market fetch failed:", e);
  }

  // Return unavailable
  const unavailable: MarketBestEffort = {
    tokenSymbol: null,
    tokenName: null,
    priceUsd: null,
    liquidityUsd: null,
    volumeM5: null,
    volumeM15: null,
    volumeH1: null,
    volumeH6: null,
    volumeH24: null,
    txns: { m5: { buys: null, sells: null }, h1: { buys: null, sells: null }, h6: { buys: null, sells: null }, h24: { buys: null, sells: null } },
    priceChange: { m5: null, h1: null, h6: null, h24: null },
    fdv: null,
    marketCap: null,
    dexUrl: null,
    dexId: null,
    pairAddress: null,
    pairCreatedAt: null,
    source: "unavailable",
    updatedAt: new Date().toISOString(),
  };

  marketCache.set(key, { at: Date.now(), val: unavailable });
  return unavailable;
}
```

---

## Phase 3: AI Verdict Engine

### Step 3.1: Create AI Diagnosis Endpoint

Create `app/api/intel/diagnose/route.ts`:

```typescript
import type { AiDiagnosis, ProfileModel, ProjectSnapshot, IntelSummary } from "@/lib/intel/types";

type ReqBody = {
  model: ProfileModel;
  snapshot: ProjectSnapshot;
  intel: IntelSummary | null;
};

const diagnoseCache = new Map<string, { at: number; body: AiDiagnosis }>();
const diagnoseInFlight = new Map<string, Promise<AiDiagnosis>>();

async function geminiDiagnose(body: ReqBody): Promise<AiDiagnosis> {
  const apiKey = process.env.VITE_GEMINI_API_KEY_II?.trim();
  if (!apiKey) throw new Error("missing_gemini_key");

  const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "You are INTELIOSE. Analyze token properties and risk signals across Solana.\n\n" +
              "Return STRICT JSON only:\n" +
              '{\n  "health": "GREEN"|"YELLOW"|"RED",\n' +
              '  "riskBaseline": "Low"|"Moderate"|"Elevated"|"Critical",\n' +
              '  "primaryFailureModes": ["risk1", "risk2", "risk3"],\n' +
              '  "rationale": "1-3 sentences on token properties",\n' +
              '  "cause": "Strongest signals; no \\"health\\"/\\"BUY\\"/\\"SELL\\"",\n' +
              '  "revivePlan": { "actions": ["action1", "action2"], "avoid": ["warning1"] },\n' +
              '  "signals": { "panicSell": false, "sellBuyImbalance": null, "priceTrend": "unknown" }\n' +
              "}\n\n" +
              "Rules:\n" +
              "- Be factual and neutral; no sensational language\n" +
              "- mintAuthority === null means RENOUNCED\n" +
              "- Use provided telemetry only\n\n" +
              "Input:\n" +
              JSON.stringify(body),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      modelId
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? "gemini_failed");

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini_empty");

  const parsed = JSON.parse(text);

  return {
    ...parsed,
    model: modelId,
    computedAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as ReqBody;

  try {
    const key = JSON.stringify(body);
    const cached = diagnoseCache.get(key);
    if (cached && Date.now() - cached.at < 30_000) {
      return Response.json(cached.body, { status: 200 });
    }

    const existing = diagnoseInFlight.get(key);
    if (existing) {
      const result = await existing;
      return Response.json(result, { status: 200 });
    }

    const promise = geminiDiagnose(body)
      .then((result) => {
        diagnoseCache.set(key, { at: Date.now(), body: result });
        return result;
      })
      .finally(() => diagnoseInFlight.delete(key));

    diagnoseInFlight.set(key, promise);
    const result = await promise;

    return Response.json(result, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[/api/intel/diagnose]", msg);

    if (msg.includes("missing_gemini_key")) {
      return Response.json(
        { error: "missing_config", detail: "Gemini API not configured" },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "ai_unavailable", detail: msg },
      { status: 503 }
    );
  }
}
```

### Step 3.2: Define TypeScript Types

Create `lib/intel/types.ts`:

```typescript
export type ProfileModel = {
  tokenAddress: string;
  isPrelaunch: boolean;
  stage: "pre-launch" | "live" | "post-launch" | "revival" | null;
  launchPlatform: string | null;
  launchType: string | null;
  category: string | null;
  intent: "fast-flip" | "medium" | "long" | null;
  devWallet: string;
  marketingWallet: string;
};

export type ProjectSnapshot = {
  chain: "Solana" | "Base";
  riskBaseline: "Low" | "Moderate" | "Elevated" | "Critical";
  primaryFailureModes: string[];
  nextPrompt: string;
};

export type IntelSummary = {
  mint: string;
  rpc: string;
  socials?: any;
  mintFacts: {
    decimals: number | null;
    supplyUi: number | null;
    supplyUiString: string | null;
    mintAuthority: string | null;
    freezeAuthority: string | null;
  };
  market: any;
  holders: {
    holderCount: number | null;
    holderCountSource: string;
  };
  devHoldingsUi: number | null;
  devHoldingsPct: number | null;
  marketingHoldingsUi: number | null;
  fetchedAt: string;
};

export type AiDiagnosis = {
  health: "GREEN" | "YELLOW" | "RED";
  riskBaseline: "Low" | "Moderate" | "Elevated" | "Critical";
  primaryFailureModes: string[];
  rationale: string;
  cause: string;
  revivePlan: {
    actions: string[];
    avoid: string[];
  };
  signals: {
    panicSell: boolean;
    sellBuyImbalance: number | null;
    priceTrend: "up" | "down" | "flat" | "unknown";
  };
  model: string;
  computedAt: string;
};
```

---

## Phase 4: Testing & Validation

### Step 4.1: Test Intelligence Endpoint

```bash
# Test Solana token analysis
curl "http://localhost:3000/api/intel/summary?mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

# With dev wallet
curl "http://localhost:3000/api/intel/summary?mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&devWallet=YOUR_ADDRESS"
```

Expected response:
```json
{
  "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "rpc": "quicknode",
  "mintFacts": {
    "decimals": 6,
    "supplyUi": 4000000000,
    "mintAuthority": null,
    "freezeAuthority": null
  },
  "market": {
    "priceUsd": 1.0,
    "liquidityUsd": 50000000,
    "volumeH24": 200000000,
    "txns": { "h24": { "buys": 5000, "sells": 4800 } }
  }
}
```

### Step 4.2: Test AI Verdict Endpoint

```bash
curl -X POST http://localhost:3000/api/intel/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "model": {
      "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "isPrelaunch": false,
      "stage": "live",
      "intent": "long",
      "devWallet": "",
      "marketingWallet": ""
    },
    "snapshot": {
      "chain": "Solana",
      "riskBaseline": "Low",
      "primaryFailureModes": [],
      "nextPrompt": "Analyze token"
    },
    "intel": { /* full intel object */ }
  }'
```

Expected response:
```json
{
  "health": "GREEN",
  "riskBaseline": "Low",
  "primaryFailureModes": ["Low trading activity"],
  "rationale": "Token has renounced mint authority and stable price.",
  "cause": "Strong tokenomics with minimal supply risk.",
  "revivePlan": {
    "actions": ["Increase liquidity", "Boost marketing"],
    "avoid": []
  },
  "signals": {
    "panicSell": false,
    "sellBuyImbalance": -0.05,
    "priceTrend": "flat"
  },
  "model": "gemini-2.5-flash",
  "computedAt": "2026-02-21T10:30:00Z"
}
```

---

## Phase 5: Frontend Integration

### Step 5.1: React Hook for AI Verdict

```typescript
// hooks/useAiVerdect.ts
import { useState, useEffect } from "react";
import type { AiDiagnosis, IntelSummary } from "@/lib/intel/types";

export function useAiVerdictWithIntel(mint: string, devWallet?: string) {
  const [intel, setIntel] = useState<IntelSummary | null>(null);
  const [verdict, setVerdict] = useState<AiDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mint) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get intel
        const intelRes = await fetch(
          `/api/intel/summary?mint=${mint}` +
          (devWallet ? `&devWallet=${devWallet}` : "")
        );
        if (!intelRes.ok) throw new Error("Failed to fetch intel");
        const intelData = await intelRes.json();
        setIntel(intelData);

        // Step 2: Get verdict
        const verdictRes = await fetch("/api/intel/diagnose", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: {
              tokenAddress: mint,
              isPrelaunch: false,
              stage: "live",
              launchPlatform: null,
              launchType: null,
              category: null,
              intent: "medium",
              devWallet: devWallet ?? "",
              marketingWallet: "",
            },
            snapshot: {
              chain: "Solana",
              riskBaseline: "Moderate",
              primaryFailureModes: [],
              nextPrompt: "Analyze token",
            },
            intel: intelData,
          }),
        });

        if (!verdictRes.ok) throw new Error("Failed to fetch verdict");
        const verdictData = await verdictRes.json();
        setVerdict(verdictData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [mint, devWallet]);

  return { intel, verdict, loading, error };
}
```

### Step 5.2: Display Verdict Component

```typescript
// components/VerdictDisplay.tsx
"use client";

import { useAiVerdictWithIntel } from "@/hooks/useAiVerdect";

export default function VerdictDisplay({ mint }: { mint: string }) {
  const { intel, verdict, loading, error } = useAiVerdictWithIntel(mint);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (loading) return <div>Analyzing token...</div>;
  if (!verdict) return <div>No verdict available</div>;

  const healthColor = {
    GREEN: "bg-green-100 text-green-800",
    YELLOW: "bg-yellow-100 text-yellow-800",
    RED: "bg-red-100 text-red-800",
  }[verdict.health];

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded ${healthColor}`}>
        <h2 className="font-bold text-lg">Health: {verdict.health}</h2>
        <p className="mt-2">{verdict.rationale}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-2">Risk: {verdict.riskBaseline}</h3>
        <ul className="list-disc ml-5">
          {verdict.primaryFailureModes.map((mode, i) => (
            <li key={i}>{mode}</li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-bold mb-2">What to do</h3>
        <ul className="list-disc ml-5">
          {verdict.revivePlan.actions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      </div>

      {intel && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-bold mb-2">Metrics</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              Price: ${intel.market?.priceUsd?.toFixed(4) ?? "—"}
            </div>
            <div>
              Liquidity: ${intel.market?.liquidityUsd?.toFixed(0) ?? "—"}
            </div>
            <div>
              Volume 24h: ${intel.market?.volumeH24?.toFixed(0) ?? "—"}
            </div>
            <div>
              Holders: {intel.holders?.holderCount ?? "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] RPC endpoints tested and working
- [ ] Gemini API key valid and model available
- [ ] Intelligence endpoint returns complete data
- [ ] AI verdict endpoint produces valid JSON
- [ ] Caching working (30s for verdicts, 15s for intel)
- [ ] Error handling tested
- [ ] Fallback providers tested
- [ ] Frontend components display verdicts correctly
- [ ] Load testing completed
- [ ] Monitoring/logging setup

---

**Ready to deploy!**
