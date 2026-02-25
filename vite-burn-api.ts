/**
 * Vite dev-server plugin that handles /api/burn/* routes directly.
 * Eliminates the need for `vercel dev` during local development.
 * In production, the real Vercel serverless functions handle these routes.
 */
import type { Plugin } from "vite";
import { config as loadDotenv } from "dotenv";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

// Load .env into process.env so the plugin can read VITE_* vars
loadDotenv();

// ─── Firebase ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB6xa1zN7h81YSj3t8apuRwnfL1EstsiUI",
  authDomain: "dao-intellis.firebaseapp.com",
  projectId: "dao-intellis",
  storageBucket: "dao-intellis.firebasestorage.app",
  messagingSenderId: "606242044926",
  appId: "1:606242044926:web:77c4fc8c42b26e8b081eaf",
  measurementId: "G-KF1FRDFH1N",
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Complexity ─────────────────────────────────────────────────────────
type ComplexityLevel = "simple" | "medium" | "complex" | "very_complex";
const USD_TIERS: Record<ComplexityLevel, number> = { simple: 1, medium: 3, complex: 10, very_complex: 32 };
const VC = ["backtest", "monte carlo", "portfolio", "correlation", "regression", "optimization", "strategy"];
const CC = ["analyze", "compare", "trend", "forecast", "prediction", "signal", "indicator"];

function calcCost(query: string, baseUsd: number) {
  const q = query.toLowerCase();
  const complexity: ComplexityLevel = VC.some((i) => q.includes(i)) ? "very_complex" : CC.some((i) => q.includes(i)) ? "complex" : q.length > 200 ? "medium" : "simple";
  let rm = 1;
  const multipliers: string[] = [];
  if (/real.?time|live|current|now|today/.test(q)) { rm += 0.5; multipliers.push("real_time"); }
  if (/historical|past|history|last|previous|year|month|week/.test(q)) { rm += 0.3; multipliers.push("historical"); }
  if (/compare|vs|versus|and|both|multiple/.test(q)) { rm += 0.4; multipliers.push("multiple_markets"); }
  return { usdCost: parseFloat((baseUsd * USD_TIERS[complexity] * rm).toFixed(2)), complexity, multipliers };
}

// ─── Price ──────────────────────────────────────────────────────────────
let priceCache: { usd: number; ts: number; addr: string } | null = null;
async function getPrice(addr: string): Promise<number | null> {
  if (!addr) return null;
  if (priceCache && priceCache.addr === addr && Date.now() - priceCache.ts < 60_000) return priceCache.usd;
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addr}`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    const d = await r.json();
    const pairs = (d.pairs || []).filter((p: any) => p.chainId === "base");
    const sorted = (pairs.length ? pairs : d.pairs || []).sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    if (!sorted.length) return null;
    const p = parseFloat(sorted[0].priceUsd);
    if (isNaN(p) || p <= 0) return null;
    priceCache = { usd: p, ts: Date.now(), addr };
    return p;
  } catch { return null; }
}

// ─── RPC ────────────────────────────────────────────────────────────────
let rpcId = 0;
async function rpcCall(method: string, params: unknown[]): Promise<any> {
  const endpoints = [process.env.VITE_BASE_RPC_URL || "https://mainnet.base.org", "https://base.llamarpc.com", "https://1rpc.io/base"];
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }), signal: AbortSignal.timeout(8000) });
      const j = await r.json() as any;
      if (j.error) throw new Error(j.error.message);
      return j.result;
    } catch {}
  }
  throw new Error("All RPC endpoints failed");
}

// ─── Rate limit ─────────────────────────────────────────────────────────
const rlStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, limit: number) {
  const now = Date.now();
  const e = rlStore.get(key);
  if (!e || now > e.resetAt) { rlStore.set(key, { count: 1, resetAt: now + 60_000 }); return true; }
  if (e.count >= limit) return false;
  e.count++;
  return true;
}

// ─── Helpers ────────────────────────────────────────────────────────────
function readBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c: Buffer) => { data += c; });
    req.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
  });
}

function json(res: any, status: number, body: any) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function cors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ─── Constants ──────────────────────────────────────────────────────────
const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;
const DEAD = "0x000000000000000000000000000000000000dead";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// ─── Plugin ─────────────────────────────────────────────────────────────
export function burnApiPlugin(): Plugin {
  return {
    name: "burn-api",
    configureServer(server) {
      // Handle OPTIONS preflight for all burn routes
      server.middlewares.use("/api/burn", (req: any, res: any, next: any) => {
        cors(res);
        if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
        next();
      });

      // POST /api/burn/estimate
      server.middlewares.use("/api/burn/estimate", async (req: any, res: any, next: any) => {
        if (req.method !== "POST") return next();
        try {
          const body = await readBody(req);
          if (process.env.VITE_BURN_ENABLED !== "true") return json(res, 200, { burnRequired: false });
          const { query } = body;
          if (!query || typeof query !== "string" || !query.trim()) return json(res, 400, { error: "Missing query" });

          const tokenAddress = process.env.VITE_BURN_TOKEN_ADDRESS || "";
          const tokenDecimals = parseInt(process.env.VITE_BURN_TOKEN_DECIMALS || "18", 10);
          const tokenSymbol = process.env.VITE_BURN_TOKEN_SYMBOL || "TOKEN";
          const baseUsd = parseFloat(process.env.VITE_BURN_USD_COST || "0.25");
          const fallback = parseInt(process.env.VITE_BURN_FALLBACK_TOKENS || "200", 10);

          const { usdCost, complexity, multipliers } = calcCost(query, baseUsd);
          const price = tokenAddress ? await getPrice(tokenAddress) : null;
          const tokenAmount = price && price > 0 ? Math.ceil(usdCost / price) : Math.ceil(fallback * (usdCost / baseUsd));

          return json(res, 200, { burnRequired: true, tokenAmount, complexity, multipliers, usdCost, priceUsd: price, tokenAddress, tokenDecimals, tokenSymbol, deadAddress: "0x000000000000000000000000000000000000dEaD" });
        } catch (err: any) {
          console.error("[burn/estimate]", err);
          return json(res, 500, { error: err.message });
        }
      });

      // POST /api/burn/submit
      server.middlewares.use("/api/burn/submit", async (req: any, res: any, next: any) => {
        if (req.method !== "POST") return next();
        try {
          if (process.env.VITE_BURN_ENABLED !== "true") return json(res, 200, { burnRequired: false });
          const body = await readBody(req);
          const { walletAddress, query, tokenAmount, complexity } = body;

          if (!walletAddress || !WALLET_RE.test(walletAddress)) return json(res, 400, { error: "Invalid wallet address" });
          if (!query || typeof query !== "string" || !query.trim()) return json(res, 400, { error: "Missing query" });
          if (!tokenAmount || typeof tokenAmount !== "number" || tokenAmount <= 0) return json(res, 400, { error: "Invalid token amount" });
          if (!["simple", "medium", "complex", "very_complex"].includes(complexity)) return json(res, 400, { error: "Invalid complexity" });

          const tokenAddress = process.env.VITE_BURN_TOKEN_ADDRESS || "";
          if (!tokenAddress) return json(res, 503, { error: "Burn token not configured" });

          const docRef = await addDoc(collection(db, "burn_transactions"), {
            wallet_address: walletAddress.toLowerCase(),
            query_text: query.trim().slice(0, 2000),
            token_address: tokenAddress,
            amount_burned: tokenAmount,
            complexity,
            status: "pending",
            ai_model: "inteliose",
            chain_id: 8453,
            burn_signature: null,
            error_message: null,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });

          return json(res, 200, { burnId: docRef.id, tokenAmount, tokenAddress, tokenDecimals: parseInt(process.env.VITE_BURN_TOKEN_DECIMALS || "18", 10), deadAddress: "0x000000000000000000000000000000000000dEaD" });
        } catch (err: any) {
          console.error("[burn/submit]", err);
          return json(res, 500, { error: err.message });
        }
      });

      // POST /api/burn/process
      server.middlewares.use("/api/burn/process", async (req: any, res: any, next: any) => {
        if (req.method !== "POST") return next();
        try {
          const body = await readBody(req);
          const { burnId, txHash } = body;
          if (!burnId || typeof burnId !== "string") return json(res, 400, { error: "Invalid burnId" });
          if (!txHash || !TX_HASH_RE.test(txHash)) return json(res, 400, { error: "Invalid txHash" });

          const tokenAddress = (process.env.VITE_BURN_TOKEN_ADDRESS || "").toLowerCase();
          if (!tokenAddress) return json(res, 503, { error: "Burn token not configured" });

          const burnRef = doc(db, "burn_transactions", burnId);
          const snap = await getDoc(burnRef);
          if (!snap.exists()) return json(res, 404, { error: "Burn record not found" });
          const record = snap.data();

          if (record.status === "confirmed" || record.status === "processed") return json(res, 200, { verified: true, burnId, txHash: record.burn_signature });
          if (record.status !== "pending" && record.status !== "signed") return json(res, 400, { error: `Cannot process: ${record.status}` });

          // Fetch receipt with retries
          let receipt = null;
          for (let i = 0; i < 3; i++) {
            try { receipt = await rpcCall("eth_getTransactionReceipt", [txHash]); if (receipt) break; } catch {}
            if (i < 2) await new Promise((r) => setTimeout(r, 3000));
          }

          if (!receipt) { await updateDoc(burnRef, { status: "failed", error_message: "Receipt not found", updated_at: serverTimestamp() }); return json(res, 400, { verified: false, error: "Receipt not found" }); }
          if ((receipt as any).status !== "0x1") { await updateDoc(burnRef, { status: "failed", error_message: "Tx reverted", updated_at: serverTimestamp() }); return json(res, 400, { verified: false, error: "Transaction reverted" }); }

          const logs = (receipt as any).logs || [];
          const transferLog = logs.find((log: any) => {
            if (log.topics?.[0] !== TRANSFER_TOPIC) return false;
            if (log.address?.toLowerCase() !== tokenAddress) return false;
            return ("0x" + log.topics[2].slice(-40).toLowerCase()) === DEAD;
          });

          if (!transferLog) { await updateDoc(burnRef, { status: "failed", error_message: "No burn transfer", updated_at: serverTimestamp() }); return json(res, 400, { verified: false, error: "No burn transfer found" }); }

          const from = "0x" + transferLog.topics[1].slice(-40).toLowerCase();
          if (from !== record.wallet_address.toLowerCase()) { await updateDoc(burnRef, { status: "failed", error_message: "Sender mismatch", updated_at: serverTimestamp() }); return json(res, 400, { verified: false, error: "Sender mismatch" }); }

          await updateDoc(burnRef, { status: "confirmed", burn_signature: txHash, updated_at: serverTimestamp() });
          return json(res, 200, { verified: true, burnId, txHash });
        } catch (err: any) {
          console.error("[burn/process]", err);
          return json(res, 500, { error: err.message });
        }
      });
    },
  };
}
