import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../../../_lib/cors.js";
import { getAgentInfo } from "../../../../server/erc8004/identity.js";
import { getReputationSummary } from "../../../../server/erc8004/reputation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  try {
    const agentId = BigInt(req.query.agentId as string);
    const [info, reputation] = await Promise.all([
      getAgentInfo(agentId),
      getReputationSummary(agentId),
    ]);

    if (!info) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    res.json({ ...info, reputation });
  } catch (error: any) {
    res.status(400).json({ error: "Invalid agent ID" });
  }
}
