import { NeynarAPIClient } from "@neynar/nodejs-sdk";

let _client: NeynarAPIClient | null = null;

function getClient(): NeynarAPIClient {
  if (!_client) {
    _client = new NeynarAPIClient({ apiKey: process.env.VITE_NEYNAR_API_KEY || "" });
  }
  return _client;
}

export { getClient as neynarClient };

export function getSignerUuid(): string {
  return process.env.VITE_NEYNAR_SIGNER_UUID || "";
}

export function getBotFid(): number {
  return parseInt(process.env.VITE_FARCASTER_BOT_FID || "0", 10);
}

// Keep backward-compatible exports
export const SIGNER_UUID = "" as string; // use getSignerUuid() at call time
export const BOT_FID = 0 as number; // use getBotFid() at call time

/**
 * Post a reply to an existing cast
 */
export async function postReply(parentHash: string, text: string) {
  return getClient().publishCast({
    signerUuid: getSignerUuid(),
    text,
    parent: parentHash,
  });
}

/**
 * Post a top-level cast
 */
export async function postCast(text: string) {
  return getClient().publishCast({
    signerUuid: getSignerUuid(),
    text,
  });
}

/**
 * Search casts by query
 */
export async function searchCasts(query: string, limit = 25) {
  return getClient().searchCasts({ q: query, limit });
}
