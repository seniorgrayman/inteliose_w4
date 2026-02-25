import { createPublicClient, http, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import { REPUTATION_REGISTRY_ABI } from "./abis/ReputationRegistry.js";
import { getContracts } from "./contracts.js";

function getConfig() {
  const useTestnet = process.env.ERC8004_TESTNET !== "false";
  const contracts = getContracts(useTestnet);
  const client = createPublicClient({
    chain: useTestnet ? baseSepolia : base,
    transport: http(contracts.rpcUrl),
  });
  return { useTestnet, contracts, client };
}

async function readReputation(functionName: string, args: any[]) {
  const { contracts, client } = getConfig();
  return (client as any).readContract({
    address: contracts.reputationRegistry,
    abi: REPUTATION_REGISTRY_ABI,
    functionName,
    args,
  });
}

export interface ReputationSummary {
  agentId: string;
  feedbackCount: number;
  averageScore: number;
  maxScore: number;
  clients: string[];
  registryAddress: string;
  chain: string;
}

/**
 * Get aggregated reputation summary for an agent
 */
export async function getReputationSummary(agentId: bigint): Promise<ReputationSummary> {
  try {
    const clients = await readReputation("getClients", [agentId]) as Address[];

    const result = await readReputation("getSummary", [agentId, clients, "", ""]) as [bigint, bigint, number];
    const [count, summaryValue, summaryValueDecimals] = result;

    const decimals = Number(summaryValueDecimals);
    const rawScore = Number(summaryValue);
    const averageScore = decimals > 0
      ? rawScore / Math.pow(10, decimals)
      : rawScore;

    const { useTestnet, contracts } = getConfig();
    return {
      agentId: agentId.toString(),
      feedbackCount: Number(count),
      averageScore,
      maxScore: 100,
      clients: clients.map((c) => c.toString()),
      registryAddress: contracts.reputationRegistry,
      chain: useTestnet ? "base-sepolia" : "base",
    };
  } catch (error) {
    console.error("Error fetching reputation:", error);
    const { useTestnet, contracts } = getConfig();
    return {
      agentId: agentId.toString(),
      feedbackCount: 0,
      averageScore: 0,
      maxScore: 100,
      clients: [],
      registryAddress: contracts.reputationRegistry,
      chain: useTestnet ? "base-sepolia" : "base",
    };
  }
}

/**
 * Read individual feedback entries for an agent from a specific client
 */
export async function readClientFeedback(agentId: bigint, clientAddress: Address) {
  try {
    const lastIndex = await readReputation("getLastIndex", [agentId, clientAddress]) as bigint;

    const feedbacks = [];
    for (let i = 0n; i <= lastIndex; i++) {
      try {
        const feedback = await readReputation("readFeedback", [agentId, clientAddress, i]) as any[];
        feedbacks.push({
          index: Number(i),
          value: Number(feedback[0]),
          valueDecimals: Number(feedback[1]),
          tag1: feedback[2],
          tag2: feedback[3],
          endpoint: feedback[4],
          feedbackURI: feedback[5],
          feedbackHash: feedback[6],
          timestamp: Number(feedback[7]),
        });
      } catch {
        // Skip revoked or invalid entries
      }
    }

    return feedbacks;
  } catch {
    return [];
  }
}
