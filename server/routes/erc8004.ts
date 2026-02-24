import { Router } from "express";
import { getAgentInfo, fetchRegistrationFile } from "../erc8004/identity.js";
import { getReputationSummary } from "../erc8004/reputation.js";
import { getContracts } from "../erc8004/contracts.js";

const router = Router();

// Read agent ID lazily (env may be loaded after module init)
function getAgentId(): bigint {
  return BigInt(process.env.INTELIOSE_AGENT_ID || "0");
}

/**
 * GET /intel/erc8004/agent
 * Returns Inteliose's ERC-8004 agent identity info
 */
router.get("/intel/erc8004/agent", async (_req, res) => {
  const USE_TESTNET = process.env.ERC8004_TESTNET !== "false";
  const contracts = getContracts(USE_TESTNET);

  if (getAgentId() === 0n) {
    // Not yet registered — return placeholder
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

    res.json({
      registered: true,
      ...info,
      registration,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /intel/erc8004/reputation
 * Returns Inteliose's reputation from the Reputation Registry
 */
router.get("/intel/erc8004/reputation", async (_req, res) => {
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
});

/**
 * GET /intel/erc8004/lookup/:agentId
 * Lookup any agent by ID (useful for verifying other agents)
 */
router.get("/intel/erc8004/lookup/:agentId", async (req, res) => {
  try {
    const agentId = BigInt(req.params.agentId);
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
});

export default router;
