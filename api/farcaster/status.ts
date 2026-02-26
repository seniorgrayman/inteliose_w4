import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../_lib/cors.js";
import { getFarcasterProfile, getIdentityLinkStatus } from "../../server/farcaster/identity-link.js";
import { db } from "../_lib/firebase.js";
import { collection, getCountFromServer } from "firebase/firestore";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [profile, identityLink, interactionCount] = await Promise.all([
      getFarcasterProfile().catch(() => null),
      getIdentityLinkStatus().catch(() => ({ linked: false, details: "Error checking identity link" })),
      getCountFromServer(collection(db, "farcaster_interactions"))
        .then((snap) => snap.data().count)
        .catch(() => 0),
    ]);

    return res.status(200).json({
      profile,
      interactionCount,
      autoCastEnabled: process.env.VITE_FARCASTER_AUTO_CAST === "true",
      identityLink,
      botActive: !!profile,
    });
  } catch (err: any) {
    console.error("Farcaster status error:", err);
    return res.status(500).json({ error: "Failed to fetch Farcaster status" });
  }
}
