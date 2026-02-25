import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });

async function main() {
  const abi = [
    { inputs: [{ name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  ] as const;

  const registry = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;

  try {
    const owner = await (client as any).readContract({ address: registry, abi, functionName: "ownerOf", args: [19333n] });
    console.log("Owner of agent #19333:", owner);
  } catch (e: any) {
    console.log("ownerOf error:", e.message?.slice(0, 200));
  }

  try {
    const uri = await (client as any).readContract({ address: registry, abi, functionName: "tokenURI", args: [19333n] });
    console.log("Token URI (first 100 chars):", (uri as string).slice(0, 100));
  } catch (e: any) {
    console.log("tokenURI error:", e.message?.slice(0, 200));
  }

  // Also check the tx receipt to confirm
  const receipt = await client.getTransactionReceipt({ hash: "0x3cbada867406e8e1fa97563b08070bfb21fafb60f426c9efd59b88d62541ff82" });
  console.log("\nTx status:", receipt.status);
  console.log("Contract:", receipt.to);
  console.log("From:", receipt.from);
}

main().catch(console.error);
