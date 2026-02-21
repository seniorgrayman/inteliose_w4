# DAO INTELLIS: Quick Reference Guide

**For rapid integration and API lookup**

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/intel/summary` | GET | Get token intelligence (Solana) | 15s |
| `/api/intel/base/summary` | GET | Get token intelligence (Base) | 15s |
| `/api/intel/diagnose` | POST | Get AI verdict | 30s |

---

## Environment Variables Required

```bash
# Must Have
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash

# At Least One
QUICKNODE_API_KEY=https://...
HELIUS_API_KEY=https://...
ALCHEMY_API=https://...
```

---

## Quick Integration Steps

### 1. Fetch Token Intelligence

```bash
GET /api/intel/summary?mint=TOKEN_MINT&devWallet=DEV_ADDRESS
```

Returns `IntelSummary` with:
- `mintFacts`: decimals, authorities, supply
- `market`: price, liquidity, volume, txns
- `holders`: holder count, dev holdings
- `socials`: website, twitter, discord, etc.

### 2. Call AI Verdict

```bash
POST /api/intel/diagnose
{
  "model": { /* project config */ },
  "snapshot": { /* risk context */ },
  "intel": { /* from step 1 */ }
}
```

Returns `AiDiagnosis` with:
- `health`: GREEN/YELLOW/RED
- `rationale`: 1-3 sentence explanation
- `revivePlan`: actions and warnings
- `signals`: metrics (panic sell, buy/sell imbalance, price trend)

---

## Data Flow

```
mint → /api/intel/summary → IntelSummary
                              ↓
                    → /api/intel/diagnose → AiDiagnosis
```

---

## External APIs Used (Priority Order)

### Solana Market Data
1. **QuickNode DexPaprika** (Addon 912): `GET /addon/912/networks/solana/tokens/{mint}/pools`
2. **QuickNode Odos**: JSON-RPC `odos_tokenPrices`
3. **Helius Token Prices**: `https://api.helius.xyz/v0/token-prices`
4. **Helius DAS**: JSON-RPC `getAsset`
5. **Alchemy RPC**: Standard Solana methods

### Token Metadata
1. **Metaplex**: On-chain metadata → URI → JSON
2. **DexScreener**: `https://api.dexscreener.com/latest/dex/tokens/{mint}`

### AI
- **Google Gemini**: `https://generativelanguage.googleapis.com/v1beta/models/{modelId}:generateContent`

### Base Chain (Optional)
- **Zerion**: `https://api.zerion.io/v1/fungibles/base:{token}`
- **RPC Direct**: ERC-20 function calls

---

## Key Response Fields

### IntelSummary.mintFacts
```typescript
{
  decimals: number | null;
  supplyUi: number | null;              // Total supply (UI units)
  supplyUiString: string | null;
  mintAuthority: string | null;         // null = RENOUNCED
  freezeAuthority: string | null;
}
```

### IntelSummary.market
```typescript
{
  priceUsd: number | null;
  liquidityUsd: number | null;
  volumeH24: number | null;
  volumeH1: number | null;
  volumeM5: number | null;
  txns: {
    h24: { buys: number | null; sells: number | null };
    h1: { buys: number | null; sells: number | null };
    m5: { buys: number | null; sells: number | null };
  };
  priceChange: { h24: %, h1: %, m5: % };
  fdv: number | null;                   // Fully Diluted Valuation
  marketCap: number | null;
  dexId: string | null;                 // raydium, orca, etc.
}
```

### AiDiagnosis.health Values

| Value | Meaning | Color |
|-------|---------|-------|
| `GREEN` | Healthy tokenomics | ✅ |
| `YELLOW` | Minor concerns | ⚠️ |
| `RED` | Significant risks | ❌ |

### AiDiagnosis.riskBaseline Values
- `Low`: Minimal risk
- `Moderate`: Standard startup risks
- `Elevated`: Notable concerns
- `Critical`: Major red flags

---

## Common Query Patterns

### Analyze a single token
```typescript
const mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const intel = await fetch(`/api/intel/summary?mint=${mint}`).then(r => r.json());
const verdict = await fetch(`/api/intel/diagnose`, {
  method: "POST",
  body: JSON.stringify({
    model: { tokenAddress: mint, /* ... */ },
    snapshot: { chain: "Solana", /* ... */ },
    intel
  })
}).then(r => r.json());
```

### Check dev wallet holdings
```typescript
const devWallet = "4Nd1mBQtrCmKCfg9aQZ42rUkzoaSKVmcvxfqcvxEpdac";
const intel = await fetch(`/api/intel/summary?mint=${mint}&devWallet=${devWallet}`)
  .then(r => r.json());
// intel.devHoldingsPct = % of supply
```

### Detect panic selling
```typescript
if (verdict.signals.panicSell) {
  // Detected abnormal selling pressure
}
if (verdict.signals.sellBuyImbalance > 0.2) {
  // Sells exceed buys by 20%+
}
```

---

## RPC Methods Used

### Solana Standard
```
getParsedAccountInfo(mint)      → Token facts (decimals, authorities)
getTokenSupply(mint)             → Total supply
getProgramAccounts(...)          → Holder count
getParsedTokenAccountsByOwner()  → Wallet holdings
getLatestBlockhash()             → Connection test
```

### QuickNode Add-ons
```
GET /addon/912/networks/solana/tokens/{mint}
GET /addon/912/networks/solana/tokens/{mint}/pools
GET /addon/912/networks/solana/pools/{poolId}
POST method: odos_tokenPrices
```

---

## Error Handling

### Intelligence Endpoint Failures
```json
{ "error": "missing_mint" }                 // 400
{ "error": "invalid_mint" }                 // 400
{ "error": "fetch_failed", "detail": "..." }// 500
```

### AI Verdict Failures
```json
{ "error": "missing_config" }               // 500 (no Gemini key)
{ "error": "ai_unavailable", "detail": "..." }// 503 (Gemini error)
```

### Graceful Degradation
- Missing QuickNode? → Try Helius
- Missing Helius? → Try Alchemy
- All RPC failed? → Return null/unavailable
- AI failed? → Return null, use telemetry-only fallback

---

## Performance Tips

1. **Cache aggressively**
   - Intel: 15 seconds
   - Verdicts: 30 seconds
   - Market data: 15 seconds

2. **Deduplicate in-flight requests**
   - If same request already running, reuse that promise
   - Prevents thundering herd

3. **Use timeouts**
   - QuickNode: 2-2.5 seconds
   - Helius: 900ms
   - DexScreener: 1-2 seconds

4. **Parallelize**
   - Fetch RPC data, market data, socials in parallel
   - Don't wait for one to fail before trying next

5. **Lazy load socials**
   - Metadata fetches can be slow
   - Consider fetching socials separately/later

---

## Testing Checklist

- [ ] Fetch intel for USDC (stable token)
- [ ] Fetch intel for SOL (wrapped token)
- [ ] Fetch intel with invalid mint (should fail gracefully)
- [ ] Get AI verdict for healthy token (should be GREEN)
- [ ] Get AI verdict for risky token (should be YELLOW/RED)
- [ ] Test caching (same request within 15s returns instantly)
- [ ] Test fallback (disconnect primary RPC, should use secondary)
- [ ] Test with dev wallet (should calculate holdings %)
- [ ] Test rapid sequential requests (should deduplicate)

---

## Typical Response Times

| Operation | Time |
|-----------|------|
| Intelligence (QuickNode) | 800-1200ms |
| Intelligence (Helius fallback) | 1200-1800ms |
| AI Verdict (cached) | <10ms |
| AI Verdict (fresh) | 2-5 seconds |
| Complete flow (both fresh) | 3-6 seconds |

---

## API Response Size

- **IntelSummary**: ~2-5 KB
- **AiDiagnosis**: ~1-2 KB
- **Market data blob**: ~1-3 KB

Total bandwidth per full analysis: ~5-10 KB

---

## Gemini Model Options

```
gemini-2.5-flash    ← Recommended (fast, good quality)
gemini-1.5-flash    ← Alternative (slightly older)
gemini-1.5-pro      ← Slower but higher quality
gemini-2.0-flash    ← If available (experimental)
```

Auto-fallback to first available if preferred model not found.

---

## Solana vs Base Chain

| Feature | Solana | Base |
|---------|--------|------|
| Price Source | QuickNode/DexPaprika | Zerion/DexScreener |
| Liquidity | DexPaprika | DexScreener |
| Metadata | On-chain | ERC-20 calls + Zerion |
| Holders | Token accounts count | Limited (indexer only) |
| Endpoint | `/api/intel/summary` | `/api/intel/base/summary` |

---

## Query Param Reference

### `/api/intel/summary` (Solana)
- `mint` (required): Token mint address
- `devWallet` (optional): Developer wallet for holdings
- `marketingWallet` (optional): Marketing wallet for holdings

### `/api/intel/base/summary` (Base)
- `token` (required): ERC-20 token address
- `devWallet` (optional): Developer wallet
- `marketingWallet` (optional): Marketing wallet

---

## Common Mistakes to Avoid

1. ❌ Not caching results → Rate limits
   ✅ Cache for at least 15-30 seconds

2. ❌ Sequential API calls → Slow
   ✅ Parallelize with Promise.all()

3. ❌ No timeout on fetch → Hangs forever
   ✅ Set 2-5 second timeouts

4. ❌ Single RPC provider → Outages
   ✅ Always have 2-3 fallbacks

5. ❌ Not deduplicating in-flight → Waste
   ✅ Track pending requests, reuse promises

6. ❌ Trusting AI output blindly → Errors
   ✅ Validate JSON structure, handle edge cases

7. ❌ Passing massive objects to AI → Token waste
   ✅ Only send relevant telemetry

---

## Support Contacts & Links

- **Gemini API Issues**: https://ai.google.dev/
- **QuickNode Support**: support@quicknode.com
- **Helius Support**: https://www.helius.xyz/
- **Solana RPC Methods**: https://docs.solanalabs.com/api

---

**Last Updated:** Feb 21, 2026  
**Version:** 1.0
