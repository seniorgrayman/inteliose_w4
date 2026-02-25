/**
 * Base RPC helper with fallback endpoints and timeout.
 */
const BASE_RPC_ENDPOINTS = [
  process.env.BASE_RPC_URL || "https://mainnet.base.org",
  "https://base.llamarpc.com",
  "https://1rpc.io/base",
];

let rpcId = 0;

export async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  const id = ++rpcId;
  let lastError: Error | null = null;

  for (const endpoint of BASE_RPC_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
        signal: AbortSignal.timeout(8_000),
      });
      const json = (await res.json()) as { result?: unknown; error?: { message: string } };
      if (json.error) throw new Error(`RPC: ${json.error.message}`);
      return json.result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[rpc] ${endpoint} failed for ${method}: ${lastError.message}`);
    }
  }

  throw lastError || new Error(`All RPC endpoints failed for ${method}`);
}
