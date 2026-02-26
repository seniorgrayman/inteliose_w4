import crypto from "crypto";

/**
 * Format a completed task into a <=320 char cast text
 */
export function formatHealthVerdict(task: any): string {
  const artifact = task.artifacts?.[0];
  const dataPart = artifact?.parts?.find((p: any) => p.type === "data");
  const data = dataPart?.data;

  if (!data?.aiVerdict) {
    return "Analysis complete. View full report at daointel.io";
  }

  const { aiVerdict, tokenData, chain, address } = data;
  const healthEmoji =
    aiVerdict.health === "GREEN" ? "\u{1F7E2}" :
    aiVerdict.health === "YELLOW" ? "\u{1F7E1}" :
    "\u{1F534}";

  const name = tokenData?.symbol || "TOKEN";
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  let text = `${healthEmoji} ${aiVerdict.health} | ${name} on ${chain || "Base"} | Risk: ${aiVerdict.riskLevel}`;

  if (aiVerdict.summary) {
    const remaining = 320 - text.length - 20; // reserve for URL
    const summary = aiVerdict.summary.length > remaining
      ? aiVerdict.summary.slice(0, remaining - 3) + "..."
      : aiVerdict.summary;
    text += ` | ${summary}`;
  }

  text += ` | daointel.io`;

  return text.slice(0, 320);
}

/**
 * Extract token address and chain from cast text
 */
export function extractTokenFromCast(text: string): {
  tokenAddress: string;
  chain: "Base" | "Solana";
} | null {
  // EVM address (0x + 40 hex chars)
  const evmMatch = text.match(/0x[a-fA-F0-9]{40}/);
  if (evmMatch) {
    return { tokenAddress: evmMatch[0], chain: "Base" };
  }

  // Solana address (base58, 32-44 chars)
  const solMatch = text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
  if (solMatch) {
    return { tokenAddress: solMatch[0], chain: "Solana" };
  }

  return null;
}

/**
 * Verify Neynar webhook signature (HMAC-SHA256)
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(digest, "hex"),
    Buffer.from(signature, "hex")
  );
}
