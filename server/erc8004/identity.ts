import { createPublicClient, http, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import { IDENTITY_REGISTRY_ABI } from "./abis/IdentityRegistry.js";
import { getContracts } from "./contracts.js";

function getConfig() {
  const useTestnet = process.env.VITE_ERC8004_TESTNET !== "false";
  const contracts = getContracts(useTestnet);
  const client = createPublicClient({
    chain: useTestnet ? baseSepolia : base,
    transport: http(contracts.rpcUrl),
  });
  return { useTestnet, contracts, client };
}

async function readIdentity(functionName: string, args: any[]) {
  const { contracts, client } = getConfig();
  return (client as any).readContract({
    address: contracts.identityRegistry,
    abi: IDENTITY_REGISTRY_ABI,
    functionName,
    args,
  });
}

/**
 * Get agent info from the Identity Registry by agentId
 */
export async function getAgentInfo(agentId: bigint) {
  try {
    const [tokenURI, owner] = await Promise.all([
      readIdentity("tokenURI", [agentId]),
      readIdentity("ownerOf", [agentId]),
    ]);

    const { useTestnet, contracts } = getConfig();
    return {
      agentId: agentId.toString(),
      tokenURI: tokenURI as string,
      owner: owner as string,
      registryAddress: contracts.identityRegistry,
      chain: useTestnet ? "base-sepolia" : "base",
      explorerUrl: useTestnet
        ? `https://sepolia.basescan.org/token/${contracts.identityRegistry}?a=${agentId}`
        : `https://basescan.org/token/${contracts.identityRegistry}?a=${agentId}`,
      scanUrl: `https://www.8004scan.io/agents/base/${agentId}`,
    };
  } catch (error) {
    console.error("Error fetching agent info:", error);
    return null;
  }
}

/**
 * Get agent metadata by key
 */
export async function getAgentMetadata(agentId: bigint, key: string) {
  try {
    return await readIdentity("getMetadata", [agentId, key]);
  } catch {
    return null;
  }
}

/**
 * Check how many agents an address owns
 */
export async function getAgentBalance(ownerAddress: Address) {
  try {
    const balance = await readIdentity("balanceOf", [ownerAddress]);
    return Number(balance);
  } catch {
    return 0;
  }
}

/**
 * Get the registration file JSON from the agent's tokenURI
 */
export async function fetchRegistrationFile(agentId: bigint) {
  const info = await getAgentInfo(agentId);
  if (!info?.tokenURI) return null;

  try {
    let url = info.tokenURI;

    // Handle IPFS URIs
    if (url.startsWith("ipfs://")) {
      url = url.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    // Handle data URIs
    if (url.startsWith("data:")) {
      const [, base64Data] = url.split(",");
      return JSON.parse(atob(base64Data));
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
