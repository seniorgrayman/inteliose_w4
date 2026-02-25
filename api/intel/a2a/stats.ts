import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../../_lib/cors.js";
import { getA2AStats } from "../../../server/a2a/executor.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;
  res.json(await getA2AStats());
}
