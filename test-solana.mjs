import "dotenv/config.js";

// Simulate Solana token test
const solanaToken = "EPjFWaJY3uy4rwJVxW8DkjVTQTKU2rLBJ4RPCiMcDsk"; // USDC on Solana

console.log("🧪 Testing Solana Token Analysis");
console.log(`Token Address: ${solanaToken}`);
console.log(`Chain: Solana\n`);

// Test QuickNode endpoint
const quickNodeUrl = process.env.VITE_QUICKNODE_API_KEY;
if (!quickNodeUrl) {
  console.error("❌ QuickNode API key not found");
  process.exit(1);
}

console.log("📊 Step 1: Fetching token supply...");

try {
  const res = await fetch(quickNodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenSupply",
      params: [solanaToken],
    }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log("✅ Token Supply fetched");
    console.log(`   Decimals: ${data.result?.value?.decimals}`);
    console.log(`   Amount: ${data.result?.value?.amount}`);
    console.log(`   UI Amount: ${data.result?.value?.uiAmount}`);
  } else {
    console.error("❌ Failed to fetch token supply");
  }
} catch (e) {
  console.error("❌ Error:", e.message);
}

console.log("\n📊 Step 2: Fetching token holders...");

try {
  const res = await fetch(quickNodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenLargestAccounts",
      params: [solanaToken],
    }),
  });

  if (res.ok) {
    const data = await res.json();
    const holders = data.result?.value || [];
    console.log(`✅ Token Holders fetched: ${holders.length} accounts`);
    if (holders.length > 0) {
      console.log(`   Top holder: ${holders[0].amount}`);
    }
  } else {
    console.error("❌ Failed to fetch token holders");
  }
} catch (e) {
  console.error("❌ Error:", e.message);
}

console.log("\n✅ Solana tests completed!");
