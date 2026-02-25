/**
 * Burn service — API calls + ERC-20 ABI encoding for token burns on Base.
 * No ethers/viem dependency; raw EIP-1193 + manual ABI encoding.
 */
import type { EVMProvider } from "@/types/wallet";
import type { BurnEstimate, BurnSubmission, BurnVerification } from "@/types/burn";

const API_BASE = "/api/burn";

// ─── ABI Encoding (vanilla — no libraries) ────────────────────────────

function encodeTransfer(to: string, amount: bigint): string {
  const selector = "0xa9059cbb";
  const toParam = to.toLowerCase().replace("0x", "").padStart(64, "0");
  const amountParam = amount.toString(16).padStart(64, "0");
  return selector + toParam + amountParam;
}

function encodeBalanceOf(owner: string): string {
  const selector = "0x70a08231";
  const ownerParam = owner.toLowerCase().replace("0x", "").padStart(64, "0");
  return selector + ownerParam;
}

function toRawAmount(amount: number, decimals: number): bigint {
  const parts = amount.toString().split(".");
  const whole = parts[0];
  const frac = (parts[1] || "").slice(0, decimals).padEnd(decimals, "0");
  return BigInt(whole + frac);
}

// ─── API Calls ─────────────────────────────────────────────────────────

export async function estimateBurn(query: string): Promise<BurnEstimate> {
  const resp = await fetch(`${API_BASE}/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!resp.ok) throw new Error(`Estimate failed: ${resp.status}`);
  return resp.json();
}

export async function submitBurn(
  walletAddress: string,
  query: string,
  tokenAmount: number,
  complexity: string
): Promise<BurnSubmission> {
  const resp = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, query, tokenAmount, complexity }),
  });
  if (!resp.ok) throw new Error(`Submit failed: ${resp.status}`);
  return resp.json();
}

export async function processBurn(
  burnId: string,
  txHash: string
): Promise<BurnVerification> {
  const resp = await fetch(`${API_BASE}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ burnId, txHash }),
  });
  if (!resp.ok) throw new Error(`Process failed: ${resp.status}`);
  return resp.json();
}

// ─── On-Chain Operations ───────────────────────────────────────────────

export async function checkTokenBalance(
  provider: EVMProvider,
  tokenAddress: string,
  walletAddress: string,
  decimals: number
): Promise<number> {
  const data = encodeBalanceOf(walletAddress);
  const result = (await provider.request({
    method: "eth_call",
    params: [{ to: tokenAddress, data }, "latest"],
  })) as string;

  const raw = BigInt(result || "0x0");
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 4);
  return parseFloat(`${whole}.${fracStr}`);
}

export async function executeBurnTransaction(
  provider: EVMProvider,
  tokenAddress: string,
  deadAddress: string,
  amount: number,
  decimals: number
): Promise<string> {
  const rawAmount = toRawAmount(amount, decimals);
  const data = encodeTransfer(deadAddress, rawAmount);

  const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
  if (!accounts.length) throw new Error("No connected account");

  const txHash = (await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: accounts[0],
        to: tokenAddress,
        data,
      },
    ],
  })) as string;

  return txHash;
}

// ─── Feature Flag ─────────────────────────────────────────────────────

export function isBurnEnabled(): boolean {
  return import.meta.env.VITE_BURN_ENABLED === "true";
}
