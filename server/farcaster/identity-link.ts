import { neynarClient, getBotFid } from "./neynar-client.js";

/**
 * Fetch the bot's Farcaster profile via Neynar
 */
export async function getFarcasterProfile() {
  const botFid = getBotFid();
  if (!botFid) return null;

  try {
    const result = await neynarClient().fetchBulkUsers({ fids: [botFid] });
    const user = (result as any)?.users?.[0];
    if (!user) return null;

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      bio: user.profile?.bio?.text || "",
      followerCount: user.follower_count || 0,
      followingCount: user.following_count || 0,
    };
  } catch (err) {
    console.warn("Failed to fetch Farcaster profile:", err);
    return null;
  }
}

/**
 * Check if the Farcaster bio contains the ERC-8004 agent ID or agent card URL
 */
export async function getIdentityLinkStatus(): Promise<{
  linked: boolean;
  details: string;
}> {
  const profile = await getFarcasterProfile();
  if (!profile) {
    return { linked: false, details: "Could not fetch Farcaster profile" };
  }

  const bio = profile.bio.toLowerCase();
  const agentId = process.env.VITE_INTELIOSE_AGENT_ID || "19333";

  const hasAgentId =
    bio.includes(`erc-8004`) ||
    bio.includes(`agent #${agentId}`) ||
    bio.includes(`#${agentId}`);

  const hasAgentCard =
    bio.includes("daointel.io") ||
    bio.includes("agent-card.json");

  return {
    linked: hasAgentId || hasAgentCard,
    details: hasAgentId
      ? `ERC-8004 Agent #${agentId} found in bio`
      : hasAgentCard
      ? "Agent card URL found in bio"
      : "No ERC-8004 reference in Farcaster bio",
  };
}
