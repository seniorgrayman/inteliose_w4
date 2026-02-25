import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../_lib/cors.js";
import { buildAgentCard } from "../../server/a2a/agent-card.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "www.daointel.io";
  const baseUrl = `${protocol}://${host}`;

  const card = buildAgentCard(baseUrl);
  res.json(card);
}
