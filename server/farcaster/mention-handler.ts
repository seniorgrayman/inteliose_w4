import { postReply } from "./neynar-client.js";
import { extractTokenFromCast, formatHealthVerdict } from "./utils.js";
import { executeTokenHealthCheck } from "../a2a/skills/token-health-check.js";
import { db } from "../firestore.js";
import { collection, doc, setDoc } from "firebase/firestore";

/**
 * Handle a Farcaster mention of the bot
 */
export async function handleMention(
  castHash: string,
  authorFid: number,
  text: string
): Promise<void> {
  const extracted = extractTokenFromCast(text);

  if (!extracted) {
    await postReply(
      castHash,
      "Send me a token address and I'll analyze it!\n\nExample: @inteliose 0x4ed4...abc (Base) or a Solana address.\n\nI'll return a health verdict: GREEN, YELLOW, or RED."
    );
    return;
  }

  const { tokenAddress, chain } = extracted;

  const result = await executeTokenHealthCheck({ tokenAddress, chain });

  if (result.error) {
    await postReply(castHash, `Could not analyze token: ${result.error}`);
    return;
  }

  // Build a fake task-like object for formatHealthVerdict
  const taskLike = {
    artifacts: [{ parts: result.parts }],
  };

  const verdictText = formatHealthVerdict(taskLike);
  const reply = await postReply(castHash, verdictText);

  // Save interaction to Firestore
  const interactionRef = doc(collection(db, "farcaster_interactions"));
  await setDoc(interactionRef, {
    castHash,
    authorFid,
    tokenAddress,
    chain,
    verdict: verdictText,
    replyCastHash: (reply as any)?.cast?.hash || null,
    timestamp: new Date().toISOString(),
  });
}
