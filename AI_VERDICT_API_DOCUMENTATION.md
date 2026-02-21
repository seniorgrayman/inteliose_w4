# DAO INTELLIS: AI Verdict & Analysis Integration Documentation

**Purpose:** Complete technical documentation for integrating AI-powered token analysis and verdict generation into a new application. This covers all endpoints, APIs, data flows, and external service integrations used in the DAO INTELLIS platform.

**Last Updated:** February 2026  
**Scope:** Solana & Base chain support

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Endpoints](#core-endpoints)
3. [External APIs & Add-ons](#external-apis--add-ons)
4. [Data Types & Schemas](#data-types--schemas)
5. [AI Verdict Generation Flow](#ai-verdict-generation-flow)
6. [RPC Provider Setup](#rpc-provider-setup)
7. [Implementation Examples](#implementation-examples)
8. [Error Handling & Fallbacks](#error-handling--fallbacks)
9. [Caching Strategy](#caching-strategy)
10. [Environment Configuration](#environment-configuration)

---

## Architecture Overview

The AI Verdict system consists of three main layers:

```
┌─────────────────────────────────────────────┐
│  AI Verdict Layer (Gemini API)              │
│  - Health Assessment (GREEN/YELLOW/RED)     │
│  - Risk Analysis                            │
│  - Revival Plans                            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Intelligence Collection Layer              │
│  - Token Metadata                           │
│  - Market Data (Price, Volume, Liquidity)   │
│  - Holder Information                       │
│  - Social Links                             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Data Provider Layer                        │
│  - QuickNode (Primary)                      │
│  - Helius (Fallback)                        │
│  - Alchemy (Fallback)                       │
│  - DexScreener (Social/Metrics)             │
│  - Zerion (EVM/Base)                        │
└─────────────────────────────────────────────┘
```

---

## Core Endpoints

### 1. AI Verdict Endpoint

**Endpoint:** `/api/intel/diagnose`  
**Method:** `POST`  
**Requires:** AI model configuration + token intelligence data

#### Request Body

```typescript
{
  model: {
    tokenAddress: string;           // Token mint (Solana) or address (Base)
    isPrelaunch: boolean;           // Is token in pre-launch phase
    stage: "pre-launch" | "live" | "post-launch" | "revival" | null;
    launchPlatform: "pumpfun" | "bags" | "raydium" | "moonshot" | "launchmytoken" | null;
    launchType: "meme" | "liquidity" | "ido" | null;
    category: "ai" | "meme" | "defi" | "gamify" | "nft" | "socialfi" | "dao" | "utility" | null;
    intent: "fast-flip" | "medium" | "long" | null;
    devWallet: string;              // Developer wallet address for optics analysis
    marketingWallet: string;        // Marketing wallet address
  };
  snapshot: {
    chain: "Solana";               // Currently Solana primary
    riskBaseline: "Low" | "Moderate" | "Elevated" | "Critical";
    primaryFailureModes: string[]; // Identified risk vectors
    nextPrompt: string;            // User intent context
  };
  intel: IntelSummary | null;      // See Data Types section
}
```

#### Response Body

```typescript
{
  health: "GREEN" | "YELLOW" | "RED";
  riskBaseline: "Low" | "Moderate" | "Elevated" | "Critical";
  primaryFailureModes: string[];     // 3-5 key risk factors
  rationale: string;                 // 1-3 sentence explanation
  cause: string;                     // Strongest signals description
  revivePlan: {
    actions: string[];               // 1-5 concrete actionable items
    avoid: string[];                 // 0-3 things NOT to do
  };
  signals: {
    panicSell: boolean;              // Panic selling detected?
    sellBuyImbalance: number | null; // Positive = sells dominate
    priceTrend: "up" | "down" | "flat" | "unknown";
  };
  model: string;                     // Actual Gemini model used
  computedAt: string;                // ISO 8601 timestamp
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/intel/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "model": {
      "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "isPrelaunch": false,
      "stage": "live",
      "launchPlatform": "raydium",
      "category": "defi",
      "intent": "long",
      "devWallet": "...",
      "marketingWallet": "..."
    },
    "snapshot": {
      "chain": "Solana",
      "riskBaseline": "Moderate",
      "primaryFailureModes": ["Low liquidity", "Dev concentration"],
      "nextPrompt": "Analyze token fundamentals"
    },
    "intel": { /* see full intel object below */ }
  }'
```

**Caching:** 30 seconds per unique request body  
**Status Codes:** 200 (success), 400 (bad request), 503 (AI unavailable)

---

### 2. Token Intelligence (Solana) Endpoint

**Endpoint:** `/api/intel/summary`  
**Method:** `GET`  
**Query Parameters:**
- `mint` (required): Token mint address
- `devWallet` (optional): Developer wallet for holdings analysis
- `marketingWallet` (optional): Marketing wallet for holdings analysis

#### Response: IntelSummary Type

```typescript
{
  mint: string;
  rpc: string;                    // Which RPC was used
  socials?: {
    website: string | null;
    docs: string | null;
    twitter: string | null;
    telegram: string | null;
    discord: string | null;
  } | null;
  
  mintFacts: {
    decimals: number | null;
    supplyUi: number | null;      // Total supply (UI units)
    supplyUiString: string | null;
    mintAuthority: string | null;  // null = RENOUNCED, string = ACTIVE
    freezeAuthority: string | null;
  };
  
  market: {
    tokenSymbol: string | null;
    tokenName: string | null;
    priceUsd: number | null;
    liquidityUsd: number | null;
    volumeM5: number | null;
    volumeM15: number | null;
    volumeH1: number | null;
    volumeH6: number | null;
    volumeH24: number | null;
    
    txns: {                        // Transaction counts
      m5: { buys: number | null; sells: number | null };
      h1: { buys: number | null; sells: number | null };
      h6: { buys: number | null; sells: number | null };
      h24: { buys: number | null; sells: number | null };
    };
    
    priceChange: {                 // % change over time windows
      m5: number | null;
      h1: number | null;
      h6: number | null;
      h24: number | null;
    };
    
    fdv: number | null;            // Fully Diluted Valuation
    marketCap: number | null;
    marketCapHistory?: {           // Historical market cap tracking
      points: Array<{
        label: "24h" | "15h" | "8h" | "2h" | "1h" | "20s";
        agoSeconds: number;
        at: string | null;          // ISO timestamp
        marketCap: number | null;
      }>;
      updatedAt: string;
      source: "firestore" | "local";
    } | null;
    
    dexUrl: string | null;
    dexId: string | null;          // Which DEX (raydium, orca, etc)
    pairAddress: string | null;
    pairCreatedAt: number | null;  // Unix timestamp (ms)
  } | null;
  
  holders: {
    holderCount: number | null;
    holderCountSource: "tokenAccounts" | "dexscreener" | "unavailable";
  };
  
  devHoldingsUi: number | null;        // Dev wallet holdings
  devHoldingsPct: number | null;       // Dev holdings as % of supply
  marketingHoldingsUi: number | null;  // Marketing wallet holdings
  
  fetchedAt: string;                   // ISO timestamp
}
```

#### Example Request

```bash
curl "http://localhost:3000/api/intel/summary?mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&devWallet=<dev_address>&marketingWallet=<marketing_address>"
```

**Caching:** 15 seconds per unique mint + wallet combination  
**Status Codes:** 200 (success), 400 (missing mint), 500 (RPC error)

---

### 3. Base Chain Intelligence Endpoint

**Endpoint:** `/api/intel/base/summary`  
**Method:** `GET`  
**Query Parameters:**
- `token` (required): ERC-20 token address on Base
- `devWallet` (optional): Developer wallet for holdings
- `marketingWallet` (optional): Marketing wallet for holdings

#### Response Schema

Similar to Solana IntelSummary but with EVM-specific data:
- Uses Zerion API for market data
- RPC calls for on-chain facts (name, symbol, decimals, total supply)
- DexScreener for market metrics and socials

#### Key Differences from Solana

```typescript
// Base-specific data retrieval:
- Name/Symbol/Decimals: ERC20 function calls via RPC
- Total Supply: totalSupply() view function
- Price: Zerion API + DexScreener
- Liquidity/Volume: DexScreener only (no QuickNode DexPaprika for Base)
- Holders: Limited availability (best-effort from indexers)
```

---

## External APIs & Add-ons

### QuickNode Solana (Primary Provider)

**Base URL:** Configured in environment as `QUICKNODE_API_KEY`

#### 1. DexPaprika Add-on (Addon 912)

**Purpose:** Market metrics (price, liquidity, volume, transactions, FDV/MCap)

**Endpoints:**

```
GET /addon/912/networks/solana/tokens/{mint}
GET /addon/912/networks/solana/tokens/{mint}/pools?page=0&limit=1&sort=desc&order_by=volume_usd
GET /addon/912/networks/solana/pools/{poolId}?inversed=false
GET /addon/912/networks/solana/pools/{poolId}?inversed=true
```

**Response Example (Token):**
```json
{
  "name": "Wrapped SOL",
  "symbol": "WSOL",
  "decimals": 9,
  "total_supply": "12345678900",
  "added_at": "2024-01-15T10:00:00Z",
  "last_updated": "2024-02-21T15:30:00Z"
}
```

**Response Example (Pool):**
```json
{
  "id": "pool_abc123",
  "dex_id": "raydium",
  "created_at": "2024-01-15T10:00:00Z",
  "tokens": [
    { "id": "mint1", "symbol": "SOL", "fdv": 50000000 },
    { "id": "mint2", "symbol": "TOKEN", "fdv": 1000000 }
  ],
  "last_price_usd": 150.25,
  "token_reserves": [
    { "reserve_usd": 1000000 },
    { "reserve_usd": 1000000 }
  ],
  "5m": { 
    "volume_usd": 50000, 
    "buys": 125, 
    "sells": 98,
    "last_price_usd_change": 0.5
  },
  "1h": { "volume_usd": 500000, "buys": 1200, "sells": 980, ... },
  "6h": { "volume_usd": 3000000, "buys": 7200, "sells": 5980, ... },
  "24h": { "volume_usd": 15000000, "buys": 28800, "sells": 23920, ... }
}
```

**Timeout:** 2000ms per request  
**Fallback:** Helius or Alchemy if QuickNode fails

#### 2. Odos Pricing Add-on

**Purpose:** Token price lookups (alternative to DexPaprika when needed)

**Method:** JSON-RPC POST  
**Body:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "odos_tokenPrices",
  "params": [{ "tokenAddrs": ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"] }]
}
```

**Response:**
```json
{
  "result": {
    "tokenPrices": {
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
        "price": 150.25
      }
    }
  }
}
```

**Timeout:** 650ms  
**Status:** Optional (not all QuickNode plans include this)

---

### Helius (Fallback Provider)

**Base URL:** `https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}`

#### 1. Token Prices API

**Endpoint:** `https://api.helius.xyz/v0/token-prices?api-key={API_KEY}`

**Method:** POST or GET  
**Body (POST):**
```json
{
  "mintAddresses": ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]
}
```

**Response:**
```json
{
  "data": {
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
      "price": 150.25,
      "priceUsd": 150.25,
      "usdPrice": 150.25
    }
  }
}
```

**Timeout:** 900ms

#### 2. Digital Asset Standard (DAS) API

**Purpose:** Asset metadata, socials, and on-chain price info

**Method:** JSON-RPC POST  
**Endpoint:** `https://mainnet.helius-rpc.com/?api-key={API_KEY}`

**Method Call:** `getAsset`

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getAsset",
  "params": {
    "id": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  }
}
```

**Response Excerpt:**
```json
{
  "result": {
    "id": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "token_info": {
      "symbol": "USDC",
      "decimals": 6,
      "price_info": {
        "price_per_token": 1.0,
        "total_price": 12345678900.0,
        "currency": "USD"
      }
    }
  }
}
```

**Timeout:** 900ms

---

### Alchemy (Secondary Fallback - Solana)

**Base URL:** `https://solana-mainnet.g.alchemy.com/v2/{API_KEY}`

**Supported Methods:**
- `getAccountInfo` - Token account data
- `getTokenSupply` - Total supply
- `getProgramAccounts` - Holder counting
- `getParsedAccountInfo` - Parsed token metadata

**Usage Pattern:** Same as standard Solana RPC  
**Timeout:** 900ms

---

### DexScreener API

**Base URL:** `https://api.dexscreener.com`

#### Endpoints

```
GET /latest/dex/tokens/{mint}         # Get token pairs
GET /latest/dex/tokens/{mint}         # Includes socials + holder estimates
```

**Response Example:**
```json
{
  "pairs": [
    {
      "chainId": "solana",
      "dexId": "raydium",
      "url": "https://dexscreener.com/solana/...",
      "pairAddress": "pool_address",
      "pairCreatedAt": 1700000000000,
      "priceUsd": "150.25",
      "liquidity": { "usd": 1000000 },
      "fdv": 50000000,
      "marketCap": 50000000,
      "volume": {
        "m5": 50000,
        "h1": 500000,
        "h6": 3000000,
        "h24": 15000000
      },
      "priceChange": {
        "m5": 1.25,
        "h1": 3.50,
        "h6": -2.10,
        "h24": 10.00
      },
      "txns": {
        "m5": { "buys": 125, "sells": 98 },
        "h1": { "buys": 1200, "sells": 980 }
      },
      "info": {
        "socials": [
          { "type": "twitter", "url": "https://twitter.com/..." },
          { "type": "telegram", "url": "https://t.me/..." },
          { "type": "discord", "url": "https://discord.gg/..." }
        ],
        "websites": [
          { "label": "Website", "url": "https://example.com" },
          { "label": "Docs", "url": "https://docs.example.com" }
        ]
      },
      "holders": 1250  // Best-effort only
    }
  ]
}
```

**Caching:** 60 seconds  
**No Auth Required**

---

### Zerion API (Base Chain)

**Base URL:** `https://api.zerion.io`

**Authentication:** Basic Auth with API Key  
```
Authorization: Basic {base64(api_key:)}
```

#### Endpoints

```
GET /v1/fungibles/base:{token_address}
GET /v1/fungibles/{token_address}
```

**Response:**
```json
{
  "data": {
    "attributes": {
      "name": "Token Name",
      "symbol": "TOKEN",
      "decimals": 18,
      "price": 1.50,
      "market_data": {
        "price": 1.50,
        "price_usd": 1.50,
        "market_cap": 1500000,
        "market_cap_rank": 250
      },
      "fungible_info": {
        "name": "Token Name",
        "symbol": "TOKEN",
        "decimals": 18
      }
    }
  }
}
```

**Timeout:** 900ms  
**Fallback:** RPC direct calls for on-chain facts

---

### Solana RPC Methods (Standard)

Used for on-chain data retrieval:

#### getParsedAccountInfo
**Purpose:** Get token mint facts (decimals, authorities, supply)  
**Timeout:** 900ms  
**Response includes:** Mint authority (null = renounced), freeze authority, decimals

#### getProgramAccounts
**Purpose:** Count token holders/accounts  
**Parameters:**
```json
{
  "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "filters": [
    { "dataSize": 165 },
    { "memcmp": { "offset": 0, "bytes": "mint_pubkey_base58" } }
  ],
  "dataSlice": { "offset": 0, "length": 0 }
}
```
**Returns:** Count of token accounts (proxy for holders)

#### getParsedTokenAccountsByOwner
**Purpose:** Get specific wallet holdings  
**Returns:** Sum of token balance for owner

#### getTokenSupply
**Purpose:** Get accurate total supply  
**Returns:** UI amount (human-readable), UI amount string, decimals

---

### Metaplex Metadata (On-Chain)

**Program ID:** `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`

**Purpose:** Retrieve token metadata URI, decode to get socials/website/docs

**Data Retrieval:**
1. Use `PublicKey.findProgramAddressSync()` to find metadata PDA
2. Fetch account info
3. Decode buffer to extract URI
4. Fetch URI (usually IPFS)
5. Parse JSON for socials (extensions field)

**Metadata JSON Structure:**
```json
{
  "name": "Token Name",
  "symbol": "TOKEN",
  "description": "...",
  "image": "https://...",
  "external_url": "https://example.com",
  "attributes": [{ "trait_type": "...", "value": "..." }],
  "extensions": {
    "website": "https://example.com",
    "docs": "https://docs.example.com",
    "twitter": "https://twitter.com/...",
    "telegram": "https://t.me/...",
    "discord": "https://discord.gg/...",
    "github": "https://github.com/..."
  }
}
```

---

## Data Types & Schemas

### ProfileModel

Represents the founder/project configuration:

```typescript
{
  tokenAddress: string;           // Mint (Solana) or address (Base)
  isPrelaunch: boolean;           // Pre-launch flag
  stage: Stage | null;            // Project lifecycle stage
  launchPlatform: LaunchPlatform | null;  // Where token launched
  launchType: LaunchType | null;  // Type of launch
  category: Category | null;      // Token category
  intent: Intent | null;          // Founder intent (for signal weighting)
  devWallet: string;              // Developer wallet
  marketingWallet: string;        // Marketing wallet
}

type Stage = "pre-launch" | "live" | "post-launch" | "revival";
type LaunchPlatform = "pumpfun" | "bags" | "raydium" | "moonshot" | "launchmytoken";
type LaunchType = "meme" | "liquidity" | "ido";
type Category = "ai" | "meme" | "defi" | "gamify" | "nft" | "socialfi" | "dao" | "utility";
type Intent = "fast-flip" | "medium" | "long";
```

### ProjectSnapshot

Represents risk baseline context:

```typescript
{
  chain: "Solana";                // Currently primary chain
  riskBaseline: RiskLevel;        // Initial risk assessment
  primaryFailureModes: string[]; // Pre-identified risks
  nextPrompt: string;             // User/system context
}

type RiskLevel = "Low" | "Moderate" | "Elevated" | "Critical";
```

### AiDiagnosis

The AI verdict output:

```typescript
{
  health: "GREEN" | "YELLOW" | "RED";
  riskBaseline: RiskLevel;
  primaryFailureModes: string[];    // 3-5 items
  rationale: string;                // 1-3 sentences: "Token X has Y characteristics..."
  cause: string;                    // Strongest signals: "Price change is X%, buys exceed sells by Y%..."
  revivePlan: {
    actions: string[];              // 1-5 actionable items
    avoid: string[];                // 0-3 warnings
  };
  signals: {
    panicSell: boolean;
    sellBuyImbalance: number | null; // Positive = sells > buys
    priceTrend: "up" | "down" | "flat" | "unknown";
  };
  model: string;                    // Gemini model ID used
  computedAt: string;               // ISO 8601 timestamp
}
```

---

## AI Verdict Generation Flow

### Step 1: Collect Intelligence

```
User Input (tokenAddress + context)
    ↓
Call /api/intel/summary (Solana) or /api/intel/base/summary (Base)
    ↓
Aggregate Data:
  - Token metadata (name, symbol, decimals, authorities)
  - Market data (price, liquidity, volume, transactions)
  - Socials (website, docs, twitter, telegram, discord)
  - Holder info (dev holdings %, general holder count)
    ↓
Output: IntelSummary object
```

### Step 2: Construct AI Prompt

```typescript
const payload = {
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `You are INTELIOSE. You analyze token properties and risk signals.

Return STRICT JSON only:
{
  "health": "GREEN"|"YELLOW"|"RED",
  "riskBaseline": "Low"|"Moderate"|"Elevated"|"Critical",
  "primaryFailureModes": [...],
  "rationale": "...",
  "cause": "...",
  "revivePlan": { "actions": [...], "avoid": [...] },
  "signals": { "panicSell": boolean, "sellBuyImbalance": null|number, "priceTrend": "..." },
  "model": "...",
  "computedAt": "..."
}

Rules:
- Use ONLY provided telemetry
- If mintAuthority === null, it's RENOUNCED
- Liquidity ratio = Liquidity / MarketCap
- Be factual: "Price is X%" not "looking bad"
- No doom language or psychoanalysis

Input JSON:
${JSON.stringify({ model, snapshot, intel })}
`
        }
      ]
    }
  ],
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json"
  }
};
```

### Step 3: Call Gemini API

```typescript
const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`;

const response = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});

const json = await response.json();
const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
const parsed = JSON.parse(text);
```

### Step 4: Fallback Model Selection

```
If response is 404 (model not found):
  1. List available models via ListModels API
  2. Prefer models with "flash" in name (faster)
  3. Fallback to first available "gemini-*" model
  4. Retry request
```

### Step 5: Cache & Return

```
Cache result for 30 seconds
Return AiDiagnosis to client
```

---

## RPC Provider Setup

### Solana RPC Hierarchy

```
1. QuickNode (Primary)
   ├─ DexPaprika (addon 912) - Market data
   ├─ Odos pricing - Price lookups
   └─ Standard RPC - Token metadata
       
2. Helius (Fallback 1)
   ├─ Token prices API
   ├─ DAS getAsset
   └─ Standard RPC
   
3. Alchemy (Fallback 2)
   └─ Standard RPC
```

### Configuration

```bash
# .env.local
QUICKNODE_API_KEY=https://side-practical-water.solana-mainnet.quiknode.pro/5fb3c34bd11b0c1974503402eba3a20110704534/
HELIUS_API_KEY=https://mainnet.helius-rpc.com/?api-key=214c8321-7892-483d-bfe4-e5fb69d288b0
ALCHEMY_API=https://solana-mainnet.g.alchemy.com/v2/gKNMUGrc2-9O-KaBXs-67

# Base Chain (if needed)
BASE_RPC_URL=https://mainnet.base.org
# or
COINBASE_BASE_RPC_URL=https://mainnet.base.org
# or
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### Connection Establishment

```typescript
async function getSolanaConnectionWithFallback(options?: { timeoutMs?: number }) {
  const providers = [
    { name: "quicknode", url: HARDCODED_QUICKNODE_RPC_URL },
    { name: "helius", url: HARDCODED_HELIUS_RPC_URL },
    { name: "alchemy", url: HARDCODED_ALCHEMY_RPC_URL }
  ].filter(p => p.url);

  for (const { name, url } of providers) {
    try {
      const connection = new Connection(url, "confirmed");
      // Test connection
      await connection.getLatestBlockhash();
      return { rpc: name, connection };
    } catch (e) {
      // Try next provider
    }
  }
  
  throw new Error("All RPC providers failed");
}
```

---

## Implementation Examples

### Example 1: Complete AI Verdict Flow (Solana)

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

async function getFullAiVerdictForSolanaToken(mint: string, context: {
  devWallet?: string;
  marketingWallet?: string;
  intent?: "fast-flip" | "medium" | "long";
}) {
  // Step 1: Get token intelligence
  const intelResponse = await fetch(
    `/api/intel/summary?mint=${mint}` +
    (context.devWallet ? `&devWallet=${context.devWallet}` : "") +
    (context.marketingWallet ? `&marketingWallet=${context.marketingWallet}` : "")
  );
  const intel = await intelResponse.json();

  // Step 2: Prepare verdict request
  const verdictRequest = {
    model: {
      tokenAddress: mint,
      isPrelaunch: false,
      stage: "live",
      launchPlatform: null,
      launchType: null,
      category: "defi",
      intent: context.intent ?? "medium",
      devWallet: context.devWallet ?? "",
      marketingWallet: context.marketingWallet ?? ""
    },
    snapshot: {
      chain: "Solana",
      riskBaseline: "Moderate",
      primaryFailureModes: [
        intel?.market?.liquidityUsd < 50000 ? "Low liquidity" : null,
        (intel?.devHoldingsPct ?? 0) > 30 ? "High dev concentration" : null,
        (intel?.market?.txns?.h24?.buys ?? 0) < 100 ? "Low activity" : null
      ].filter(Boolean),
      nextPrompt: "Analyze fundamentals"
    },
    intel
  };

  // Step 3: Get AI verdict
  const verdictResponse = await fetch("/api/intel/diagnose", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(verdictRequest)
  });
  const verdict = await verdictResponse.json();

  return { intel, verdict };
}

// Usage
const { intel, verdict } = await getFullAiVerdictForSolanaToken(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  { intent: "long" }
);

console.log("Health:", verdict.health);
console.log("Rationale:", verdict.rationale);
console.log("Revival Plan:", verdict.revivePlan);
```

### Example 2: Using Direct RPC for Market Data

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

async function getMarketDataViaQuickNodeAddons(
  mint: string,
  quicknodeUrl: string
) {
  // Token metadata
  const tokenResp = await fetch(
    new URL(
      `/addon/912/networks/solana/tokens/${mint}`,
      quicknodeUrl
    ),
    { cache: "no-store" }
  );
  const tokenData = await tokenResp.json();

  // Get best pool by volume
  const poolsResp = await fetch(
    new URL(
      `/addon/912/networks/solana/tokens/${mint}/pools?page=0&limit=1&sort=desc&order_by=volume_usd`,
      quicknodeUrl
    ),
    { cache: "no-store" }
  );
  const poolsData = await poolsResp.json();
  const bestPoolId = poolsData?.pools?.[0]?.id;

  if (!bestPoolId) return null;

  // Get pool details
  const poolResp = await fetch(
    new URL(
      `/addon/912/networks/solana/pools/${bestPoolId}?inversed=false`,
      quicknodeUrl
    ),
    { cache: "no-store" }
  );
  const poolData = await poolResp.json();

  return {
    symbol: tokenData?.symbol,
    name: tokenData?.name,
    price: poolData?.last_price_usd,
    volume24h: poolData?.["24h"]?.volume_usd,
    liquidity: poolData?.token_reserves?.reduce((sum, r) => sum + r.reserve_usd, 0),
    txns24h: {
      buys: poolData?.["24h"]?.buys,
      sells: poolData?.["24h"]?.sells
    }
  };
}
```

### Example 3: Getting Holder Analytics

```typescript
import { Connection, PublicKey, TOKEN_PROGRAM_ID } from "@solana/web3.js";

async function getTokenHolderStats(
  connection: Connection,
  mint: string,
  devWallet?: string
) {
  const mintPk = new PublicKey(mint);
  const devPk = devWallet ? new PublicKey(devWallet) : null;

  // Count total token accounts (proxy for holders)
  const accounts = await connection.getProgramAccounts(
    new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    {
      filters: [
        { dataSize: 165 },
        { memcmp: { offset: 0, bytes: mint } }
      ],
      dataSlice: { offset: 0, length: 0 }
    }
  );

  const holderCount = accounts.length;

  // Get dev holdings if provided
  let devHoldings = null;
  if (devPk) {
    const devAccounts = await connection.getParsedTokenAccountsByOwner(
      devPk,
      { mint: mintPk },
      "confirmed"
    );
    devHoldings = devAccounts.value.reduce((sum, acc) => {
      const balance = acc.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      return sum + balance;
    }, 0);
  }

  // Get total supply for percentage
  const supply = await connection.getTokenSupply(mintPk);
  const devPct = devHoldings && supply.value.uiAmount 
    ? (devHoldings / supply.value.uiAmount) * 100 
    : null;

  return { holderCount, devHoldings, devPct, totalSupply: supply.value.uiAmount };
}
```

### Example 4: Social Links Extraction

```typescript
async function extractTokenSocials(mint: string) {
  // Try Metaplex metadata first
  const metaplexData = await getMetaplexMetadata(mint);
  if (metaplexData?.socials) return metaplexData.socials;

  // Fallback to DexScreener
  const dexResp = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${mint}`
  );
  const dexData = await dexResp.json();
  
  if (!dexData?.pairs?.length) return null;

  const pair = dexData.pairs[0];
  const socials = {
    website: pair?.info?.websites?.[0]?.url ?? null,
    docs: pair?.info?.websites?.find(w => w.label?.includes("Doc"))?.url ?? null,
    twitter: pair?.info?.socials?.find(s => s.type === "twitter")?.url ?? null,
    telegram: pair?.info?.socials?.find(s => s.type === "telegram")?.url ?? null,
    discord: pair?.info?.socials?.find(s => s.type === "discord")?.url ?? null
  };

  return socials;
}
```

---

## Error Handling & Fallbacks

### RPC Provider Fallback Chain

```typescript
async function callWithFallback(
  operation: (rpc: string) => Promise<any>,
  providers: string[]
) {
  for (const rpc of providers) {
    try {
      const result = await operation(rpc);
      return result;
    } catch (error) {
      console.warn(`RPC ${rpc} failed:`, error.message);
      // Continue to next
    }
  }
  throw new Error("All RPC providers exhausted");
}

// Usage
const result = await callWithFallback(
  (rpc) => getMarketDataViaQuickNodeAddons(mint, rpc),
  [
    QUICKNODE_RPC,
    HELIUS_RPC,
    ALCHEMY_RPC
  ]
);
```

### API-Level Error Codes

```typescript
// In /api/intel/diagnose
export async function POST(req: Request) {
  try {
    const verdict = await geminiDiagnose(body);
    return Response.json(verdict, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    
    if (msg.includes("missing_gemini_key")) {
      return Response.json(
        { error: "missing_config", detail: "Gemini API key not set" },
        { status: 500 }
      );
    }
    
    if (msg.includes("gemini_failed")) {
      return Response.json(
        { error: "ai_unavailable", detail: msg },
        { status: 503 }
      );
    }
    
    return Response.json(
      { error: "unknown", detail: msg },
      { status: 500 }
    );
  }
}
```

### Market Data Fallbacks

```typescript
async function getMarketBestEffort(mint: string): Promise<MarketBestEffort> {
  // 1. Try QuickNode DexPaprika
  try {
    const m = await tryQuickNodeDexPaprikaMarket(mint);
    if (m) return m;
  } catch { /* fallthrough */ }

  // 2. Try QuickNode Odos pricing
  try {
    const price = await tryQuickNodeOdosPriceUsd(mint);
    if (price) return { priceUsd: price, /* ... */ };
  } catch { /* fallthrough */ }

  // 3. Try Helius token prices
  try {
    const price = await tryHeliusTokenPricesV0Usd(mint);
    if (price) return { priceUsd: price, /* ... */ };
  } catch { /* fallthrough */ }

  // 4. Try Helius DAS
  try {
    const price = await tryHeliusDasPriceUsd(mint);
    if (price) return { priceUsd: price, /* ... */ };
  } catch { /* fallthrough */ }

  // 5. Try Alchemy
  try {
    const price = await tryAlchemyPriceUsd(mint);
    if (price) return { priceUsd: price, /* ... */ };
  } catch { /* fallthrough */ }

  // 6. Return unavailable
  return {
    source: "unavailable",
    priceUsd: null,
    /* ... all null fields ... */
  };
}
```

---

## Caching Strategy

### Cache Layers

| Layer | Duration | Key | Scope |
|-------|----------|-----|-------|
| AI Verdict | 30s | Request body hash | Per unique AI request |
| Token Intel | 15s | mint + devWallet + marketingWallet | Per token + wallet combo |
| Market Data | 15s | mint | Per token |
| DexScreener Pairs | 60s | mint | Per token |
| DexScreener Socials | 60s | mint | Per token |
| DexScreener Holders | 60s | mint | Per token |

### Implementation

```typescript
// Example: Intel summary caching
const responseCache = new Map<string, { at: number; body: any }>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mint = searchParams.get("mint");
  const devWallet = searchParams.get("devWallet");
  const marketingWallet = searchParams.get("marketingWallet");

  const cacheKey = [mint, devWallet, marketingWallet].join("|");
  const cached = responseCache.get(cacheKey);

  // Return if fresh (within 15s)
  if (cached && Date.now() - cached.at < 15_000) {
    return Response.json(cached.body, { status: 200 });
  }

  // Fetch fresh data
  const body = await fetchIntelData(mint, devWallet, marketingWallet);
  responseCache.set(cacheKey, { at: Date.now(), body });

  return Response.json(body, { status: 200 });
}
```

### In-Flight Request Deduplication

```typescript
const inFlightRequests = new Map<string, Promise<any>>();

async function fetchWithDedup(
  key: string,
  fetcher: () => Promise<any>
): Promise<any> {
  // If already in flight, return that promise
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  // Otherwise, start fetch and track it
  const promise = fetcher().finally(() => inFlightRequests.delete(key));
  inFlightRequests.set(key, promise);

  return promise;
}

// Usage
const verdict = await fetchWithDedup(
  JSON.stringify(requestBody),
  () => geminiDiagnose(requestBody)
);
```

---

## Environment Configuration

### Required Variables

```bash
# Gemini API
GEMINI_API_KEY=AIzaSyBZpeX5o2Se5QWCclGOQAQhK0_yuSRYPP4
GEMINI_MODEL=gemini-2.5-flash

# Solana RPC Providers
QUICKNODE_API_KEY=https://side-practical-water.solana-mainnet.quiknode.pro/5fb3c34bd11b0c1974503402eba3a20110704534/
HELIUS_API_KEY=https://mainnet.helius-rpc.com/?api-key=214c8321-7892-483d-bfe4-e5fb69d288b0
ALCHEMY_API=https://solana-mainnet.g.alchemy.com/v2/gKNMUGrc2-9O-KaBXs-67

# Base Chain RPC (optional)
BASE_RPC_URL=https://mainnet.base.org
COINBASE_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/{KEY}

# Data APIs
ZERION_API_KEY_BASE=zk_228728cfef0d4f51ae695752e0e94bf0
BUBBLEMAPS_API_KEY=YOUR_BUBBLEMAPS_DATA_API_KEY
BUBBLEMAPS_API_BASE=https://api.bubblemaps.io

# Wallet Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=5261912a5c184ed019675c830f491d1a

# Optional: Bubble Maps
NEXT_PUBLIC_BUBBLEMAP_PARTNER_ID=demo
```

### Optional Variables

```bash
# Alternative naming conventions (checked in order)
NEXT_PUBLIC_BASE_RPC_URL=...
COINBASE_BASE_RPC_URL=...
```

---

## Summary: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input                               │
│           (Token Address + Context)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  /api/intel/summary    │
            │   (Get Intelligence)   │
            └────┬─────────────┬─────┘
                 │             │
    ┌────────────▼─┐    ┌──────▼──────────┐
    │   Solana     │    │   Base Chain    │
    │   (Primary)  │    │   (Alternative) │
    └───────┬──────┘    └─────────────────┘
            │
     ┌──────┼─────────────────────┐
     │      │                     │
  ┌──▼──┐ ┌─▼───────┐ ┌─────────▼────┐
  │ RPC │ │QuickNode│ │  DexScreener │
  │Data │ │Addons   │ │   + Zerion   │
  └─────┘ └─────────┘ └──────────────┘
     │
     ▼
┌────────────────────────┐
│   IntelSummary Data    │
└────┬───────────────────┘
     │
     ▼
┌────────────────────────────────────────┐
│ Construct Gemini AI Prompt             │
│ - Model config + telemetry +           │
│ - Risk assessment instructions         │
└────┬─────────────────────────────────┘
     │
     ▼
┌────────────────────────┐
│  Call Gemini API       │
│  (generateContent)     │
└────┬───────────────────┘
     │
     ├─ Success
     │   ▼
     │ Parse JSON
     │   ▼
     │ Cache (30s)
     │
     ├─ 404 (Model not found)
     │   ▼
     │ List available models
     │   ▼
     │ Retry with fallback
     │
     └─ Error
         ▼
       Return 503
       (AI Unavailable)
     │
     ▼
┌────────────────────────┐
│   Return AiDiagnosis   │
│   (Health verdict)     │
└────────────────────────┘
```

---

## Quick Implementation Checklist

- [ ] Set up Gemini API key and configure model
- [ ] Configure QuickNode RPC with DexPaprika addon
- [ ] Set up Helius and Alchemy as fallback providers
- [ ] Create `/api/intel/summary` endpoint (Solana)
- [ ] Create `/api/intel/base/summary` endpoint (Base)
- [ ] Create `/api/intel/diagnose` endpoint (AI verdict)
- [ ] Implement RPC provider fallback chain
- [ ] Set up caching for intel data (15s)
- [ ] Set up caching for AI verdicts (30s)
- [ ] Implement in-flight request deduplication
- [ ] Add error handling and status code responses
- [ ] Test with sample tokens (USDC, SOL, etc.)
- [ ] Set up DexScreener fallback for market data
- [ ] Configure Zerion for Base chain support
- [ ] Test complete flow end-to-end

---

## Support & References

- **Gemini API:** https://ai.google.dev/api/
- **Solana Web3.js:** https://github.com/solana-labs/solana-web3.js
- **QuickNode Docs:** https://www.quicknode.com/docs
- **Helius API:** https://www.helius.xyz/
- **DexScreener API:** https://docs.dexscreener.com/
- **Zerion API:** https://api.zerion.io/
- **Metaplex Token Metadata:** https://www.metaplex.com/

---

**Document Version:** 1.0  
**Last Updated:** February 21, 2026  
**Maintained By:** DAO INTELLIS Dev Team
