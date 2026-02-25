import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../../_lib/cors.js";
import { getReputationSummary } from "../../../server/erc8004/reputation.js";

function getAgentId(): bigint {
  return BigInt(process.env.VITE_INTELIOSE_AGENT_ID || "0");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (getAgentId() === 0n) {
    res.json({
      registered: false,
      agentId: null,
      feedbackCount: 0,
      averageScore: 0,
      maxScore: 100,
      clients: [],
      message: "Not yet registered. Reputation tracking will begin after ERC-8004 registration.",
    });
    return;
  }

  try {
    const reputation = await getReputationSummary(getAgentId());
    res.json({ registered: true, ...reputation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
