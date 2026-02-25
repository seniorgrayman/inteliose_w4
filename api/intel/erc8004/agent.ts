import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../../_lib/cors.js";
import { getAgentInfo, fetchRegistrationFile } from "../../../server/erc8004/identity.js";
import { getContracts } from "../../../server/erc8004/contracts.js";

function getAgentId(): bigint {
  return BigInt(process.env.VITE_INTELIOSE_AGENT_ID || "0");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  const USE_TESTNET = process.env.VITE_ERC8004_TESTNET !== "false";
  const contracts = getContracts(USE_TESTNET);

  if (getAgentId() === 0n) {
    res.json({
      registered: false,
      agentId: null,
      message: "Inteliose agent is not yet registered on ERC-8004. Registration pending.",
      contracts: {
        identityRegistry: contracts.identityRegistry,
        reputationRegistry: contracts.reputationRegistry,
        chain: USE_TESTNET ? "base-sepolia" : "base",
      },
    });
    return;
  }

  try {
    const info = await getAgentInfo(getAgentId());
    const registration = await fetchRegistrationFile(getAgentId());
    res.json({ registered: true, ...info, registration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
