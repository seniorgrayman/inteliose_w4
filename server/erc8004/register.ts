/**
 * ERC-8004 Agent Registration Script
 *
 * Usage:
 *   1. Fund the agent wallet with a small amount of ETH on Base (~0.0005 ETH)
 *   2. Run: cd server && npx tsx erc8004/register.ts
 */

import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { IDENTITY_REGISTRY_ABI } from "./abis/IdentityRegistry.js";
import { MAINNET_IDENTITY_REGISTRY, BASE_RPC_URL } from "./contracts.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ─── Generate or load wallet ───
const ENV_PATH = path.join(import.meta.dirname, ".env");

let privateKey: Hex;

if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, "utf-8");
  const match = envContent.match(/AGENT_PRIVATE_KEY=(0x[a-fA-F0-9]{64})/);
  if (match) {
    privateKey = match[1] as Hex;
    console.log("Loaded existing agent wallet from .env");
  } else {
    privateKey = `0x${crypto.randomBytes(32).toString("hex")}` as Hex;
    fs.appendFileSync(ENV_PATH, `\nAGENT_PRIVATE_KEY=${privateKey}\n`);
    console.log("Generated new wallet and saved to server/.env");
  }
} else {
  privateKey = `0x${crypto.randomBytes(32).toString("hex")}` as Hex;
  fs.writeFileSync(ENV_PATH, `AGENT_PRIVATE_KEY=${privateKey}\n`);
  console.log("Generated new wallet and created server/.env");
}

const account = privateKeyToAccount(privateKey);

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Inteliose ERC-8004 Registration                            ║
╠══════════════════════════════════════════════════════════════╣
║  Network:  Base Mainnet                                      ║
║  Registry: ${MAINNET_IDENTITY_REGISTRY}   ║
║  Agent Wallet: ${account.address}   ║
╚══════════════════════════════════════════════════════════════╝
`);

// ─── Build the registration file ───
// Using a data URI so it's fully on-chain (no IPFS dependency)
const registrationFile = {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  name: "Inteliose Intelligence Agent",
  description:
    "Web4 AI intelligence agent for cryptocurrency token analysis. Provides health verdicts, risk baselines, failure mode detection, and revival plans for tokens on Base and Solana. Powered by on-chain data aggregation and Gemini AI.",
  active: true,
  updatedAt: Math.floor(Date.now() / 1000),
  services: [
    {
      name: "A2A",
      endpoint: "https://inteliose.com/.well-known/agent-card.json",
      version: "1.0",
      a2aSkills: ["token-health-check", "risk-baseline"],
    },
    {
      name: "web",
      endpoint: "https://inteliose.com",
    },
  ],
  supportedTrust: ["reputation"],
};

// Encode as data URI (fully on-chain, no external dependency)
const jsonString = JSON.stringify(registrationFile);
const base64 = Buffer.from(jsonString).toString("base64");
const agentURI = `data:application/json;base64,${base64}`;

console.log("Registration file prepared (data URI, fully on-chain)");
console.log(`Agent URI length: ${agentURI.length} bytes\n`);

// ─── Check balance ───
const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(BASE_RPC_URL),
});

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  const ethBalance = Number(balance) / 1e18;

  console.log(`Wallet balance: ${ethBalance.toFixed(6)} ETH`);

  if (balance === 0n) {
    console.log(`
┌────────────────────────────────────────────────────────────────┐
│  WALLET NEEDS FUNDING                                          │
│                                                                │
│  Send a small amount of ETH on Base to:                        │
│  ${account.address}                          │
│                                                                │
│  Recommended: 0.0005 ETH (~$1) is more than enough.            │
│                                                                │
│  After funding, run this script again:                         │
│  cd server && npx tsx erc8004/register.ts                      │
└────────────────────────────────────────────────────────────────┘
`);
    process.exit(0);
  }

  // ─── Estimate gas ───
  console.log("Estimating gas...");

  try {
    const gasEstimate = await publicClient.estimateContractGas({
      address: MAINNET_IDENTITY_REGISTRY as Address,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "register",
      args: [agentURI],
      account: account.address,
    } as any);

    const gasPrice = await publicClient.getGasPrice();
    const estimatedCost = Number(gasEstimate * gasPrice) / 1e18;

    console.log(`Estimated gas: ${gasEstimate.toString()} units`);
    console.log(`Estimated cost: ${estimatedCost.toFixed(6)} ETH\n`);

    if (balance < gasEstimate * gasPrice) {
      console.log("Insufficient balance for gas. Please add more ETH.");
      process.exit(1);
    }
  } catch (e: any) {
    console.log(`Gas estimation note: ${e.message?.slice(0, 100)}`);
    console.log("Proceeding with registration anyway...\n");
  }

  // ─── Send registration transaction ───
  console.log("Sending registration transaction...");

  try {
    const hash = await walletClient.writeContract({
      address: MAINNET_IDENTITY_REGISTRY as Address,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "register",
      args: [agentURI],
    } as any);

    console.log(`Transaction sent: ${hash}`);
    console.log(`Explorer: https://basescan.org/tx/${hash}`);
    console.log("\nWaiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      // Parse the Registered event to get the agentId
      const registeredLog = receipt.logs.find(
        (log) => log.address.toLowerCase() === MAINNET_IDENTITY_REGISTRY.toLowerCase()
      );

      let agentId = "unknown";
      if (registeredLog && (registeredLog as any).topics?.[3]) {
        // ERC-721 Transfer event: topics[3] = tokenId (agentId)
        agentId = BigInt((registeredLog as any).topics[3]).toString();
      } else if (registeredLog && (registeredLog as any).topics?.[1]) {
        agentId = BigInt((registeredLog as any).topics[1]).toString();
      }

      console.log(`
╔══════════════════════════════════════════════════════════════╗
║  REGISTRATION SUCCESSFUL!                                    ║
╠══════════════════════════════════════════════════════════════╣
║  Agent ID:  ${agentId.padEnd(47)}║
║  Tx Hash:   ${hash.slice(0, 46)}...  ║
║  Block:     ${receipt.blockNumber.toString().padEnd(47)}║
║                                                              ║
║  View on 8004scan: https://www.8004scan.io/agents/base/${agentId.padEnd(6)}║
║  View on BaseScan: https://basescan.org/tx/${hash.slice(0, 16)}...   ║
║                                                              ║
║  NEXT STEP:                                                  ║
║  Add this to your server/.env:                               ║
║  INTELIOSE_AGENT_ID=${agentId.padEnd(39)}║
║  ERC8004_TESTNET=false                                       ║
╚══════════════════════════════════════════════════════════════╝
`);

      // Auto-save agent ID to .env
      const envContent = fs.readFileSync(ENV_PATH, "utf-8");
      if (!envContent.includes("INTELIOSE_AGENT_ID")) {
        fs.appendFileSync(ENV_PATH, `INTELIOSE_AGENT_ID=${agentId}\n`);
        fs.appendFileSync(ENV_PATH, `ERC8004_TESTNET=false\n`);
        console.log("Agent ID saved to server/.env automatically.");
      }
    } else {
      console.log("Transaction failed! Check BaseScan for details.");
      console.log(`https://basescan.org/tx/${hash}`);
    }
  } catch (error: any) {
    console.error("Registration failed:", error.message || error);
    if (error.message?.includes("insufficient funds")) {
      console.log(`\nPlease fund the wallet: ${account.address}`);
    }
  }
}

main().catch(console.error);
