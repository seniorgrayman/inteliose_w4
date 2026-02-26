/**
 * Farcaster API Client
 * Follows the pattern of src/lib/inteliose-api.ts
 */

const BACKEND_BASE = "/api";

export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
}

export interface FarcasterStatus {
  profile: FarcasterProfile | null;
  interactionCount: number;
  autoCastEnabled: boolean;
  identityLink: {
    linked: boolean;
    details: string;
  };
  botActive: boolean;
}

export interface FarcasterCast {
  hash: string;
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
  parentHash: string | null;
}

export async function fetchFarcasterCasts(limit = 25): Promise<FarcasterCast[]> {
  try {
    const res = await fetch(`${BACKEND_BASE}/farcaster/casts?limit=${limit}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.casts || [];
  } catch {
    return [];
  }
}

export async function fetchFarcasterStatus(): Promise<FarcasterStatus> {
  try {
    const res = await fetch(`${BACKEND_BASE}/farcaster/status`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      profile: null,
      interactionCount: 0,
      autoCastEnabled: false,
      identityLink: { linked: false, details: "Backend not available" },
      botActive: false,
    };
  }
}
