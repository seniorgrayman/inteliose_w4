/**
 * Update ERC-8004 Agent URI on-chain
 *
 * Fixes the website URL and adds missing fields for 8004scan indexing.
 * Usage: cd server && npx tsx erc8004/update-uri.ts
 */

import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { IDENTITY_REGISTRY_ABI } from "./abis/IdentityRegistry.js";
import { MAINNET_IDENTITY_REGISTRY, BASE_RPC_URL } from "./contracts.js";
import fs from "fs";
import path from "path";

// Load .env
const ENV_PATH = path.join(import.meta.dirname, ".env");
const envContent = fs.readFileSync(ENV_PATH, "utf-8");

const pkMatch = envContent.match(/VITE_AGENT_PRIVATE_KEY=(0x[a-fA-F0-9]{64})/);
if (!pkMatch) { console.error("No VITE_AGENT_PRIVATE_KEY in .env"); process.exit(1); }
const privateKey = pkMatch[1] as Hex;

const idMatch = envContent.match(/VITE_INTELIOSE_AGENT_ID=(\d+)/);
if (!idMatch) { console.error("No VITE_INTELIOSE_AGENT_ID in .env"); process.exit(1); }
const agentId = BigInt(idMatch[1]);

const account = privateKeyToAccount(privateKey);

console.log(`Updating Agent #${agentId} URI...`);
console.log(`Wallet: ${account.address}\n`);

// Updated registration file with correct URL and registrations field
const registrationFile = {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  name: "Inteliose Intelligence Agent",
  description:
    "Web4 AI intelligence agent for cryptocurrency token analysis. Provides health verdicts, risk baselines, failure mode detection, and revival plans for tokens on Base and Solana. Powered by on-chain data aggregation and Gemini AI.",
  image: "https://www.daointel.io/logo.jpg",
  active: true,
  updatedAt: Math.floor(Date.now() / 1000),
  registrations: [
    {
      agentId: Number(agentId),
      agentRegistry: `eip155:8453:${MAINNET_IDENTITY_REGISTRY}`,
    },
  ],
  services: [
    {
      name: "A2A",
      endpoint: "https://www.daointel.io/.well-known/agent-card.json",
      version: "1.0",
      a2aSkills: ["token-health-check", "risk-baseline"],
    },
    {
      name: "web",
      endpoint: "https://www.daointel.io",
    },
  ],
  supportedTrust: ["reputation"],
};

const jsonString = JSON.stringify(registrationFile);
const base64 = Buffer.from(jsonString).toString("base64");
const agentURI = `data:application/json;base64,${base64}`;

console.log("New registration file prepared");
console.log(`URI length: ${agentURI.length} bytes\n`);

const publicClient = createPublicClient({ chain: base, transport: http(BASE_RPC_URL) });
const walletClient = createWalletClient({ account, chain: base, transport: http(BASE_RPC_URL) });

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Wallet balance: ${(Number(balance) / 1e18).toFixed(6)} ETH`);

  if (balance === 0n) {
    console.log("Wallet has no ETH. Please fund it first.");
    process.exit(1);
  }

  console.log("Sending setAgentURI transaction...\n");

  const hash = await walletClient.writeContract({
    address: MAINNET_IDENTITY_REGISTRY as Address,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: "setAgentURI",
    args: [agentId, agentURI],
  } as any);

  console.log(`Tx sent: ${hash}`);
  console.log(`Explorer: https://basescan.org/tx/${hash}`);
  console.log("Waiting for confirmation...\n");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    console.log("Agent URI updated successfully!");
    console.log(`Website is now: https://www.daointel.io`);
    console.log(`A2A endpoint: https://www.daointel.io/.well-known/agent-card.json`);
  } else {
    console.log("Transaction failed! Check BaseScan for details.");
  }
}

main().catch(console.error);
