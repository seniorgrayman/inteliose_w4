import { postCast } from "./neynar-client.js";
import { formatHealthVerdict } from "./utils.js";
import { db } from "../firestore.js";
import { collection, doc, setDoc } from "firebase/firestore";

/**
 * Auto-publish a completed task result as a Farcaster cast
 */
export async function autoCastResult(task: any): Promise<void> {
  if (process.env.VITE_FARCASTER_AUTO_CAST !== "true") return;
  if (task?.status?.state !== "completed") return;

  const text = formatHealthVerdict(task);
  if (!text || text === "Analysis complete. View full report at daointel.io") return;

  const result = await postCast(text);
  const castHash = (result as any)?.cast?.hash || null;

  // Log to Firestore
  const castRef = doc(collection(db, "farcaster_casts"));
  await setDoc(castRef, {
    taskId: task.id,
    castHash,
    content: text,
    timestamp: new Date().toISOString(),
  });
}
