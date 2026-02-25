import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "./_lib/cors.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  res.json({ status: "ok", service: "inteliose-server", timestamp: new Date().toISOString() });
}
