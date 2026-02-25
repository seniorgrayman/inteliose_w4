import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../../_lib/cors.js";
import { getRecentTasks } from "../../../server/a2a/executor.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({ tasks: getRecentTasks(limit) });
}
