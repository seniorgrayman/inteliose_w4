#!/usr/bin/env node

// Test script to verify AI analysis and owner fetching
const GEMINI_KEY = "AIzaSyBZpeX5o2Se5QWCclGOQAQhK0_yuSRYPP4";
const TOKEN_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // USDC on Base

console.log("🧪 Testing Token Analysis System\n");
console.log(`Token Address: ${TOKEN_ADDRESS}`);
console.log(`Chain: Base\n`);

// Step 1: Fetch token data from DexScreener
console.log("📊 Step 1: Fetching token data from DexScreener...");
const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`);
const dexData = await dexRes.json();
const tokenData = dexData.pairs?.[0];

if (!tokenData) {
  console.error("❌ Failed to fetch token data");
  process.exit(1);
}

console.log(`✅ Token: ${tokenData.baseToken.name} (${tokenData.baseToken.symbol})`);
console.log(`   Price: $${tokenData.priceUsd}`);
console.log(`   Market Cap: $${(tokenData.marketCap / 1e9).toFixed(2)}B`);
console.log(`   Volume 24h: $${(tokenData.volume?.h24 / 1e6).toFixed(2)}M`);
console.log(`   Liquidity: $${(tokenData.liquidity?.usd / 1e6).toFixed(2)}M\n`);

// Step 2: Fetch owner address
console.log("🔑 Step 2: Fetching owner address via RPC...");
const rpcRes = await fetch("https://mainnet.base.org", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{
      to: TOKEN_ADDRESS,
      data: "0x8da5cb5b", // owner() function
    }, "latest"],
  }),
});
const rpcData = await rpcRes.json();
const ownerAddress = rpcData.result ? "0x" + rpcData.result.slice(-40) : "Unknown";
console.log(`✅ Owner Address: ${ownerAddress}\n`);

// Step 3: Test Gemini API
console.log("🤖 Step 3: Testing Gemini AI Analysis...");
const marketSummary = `
- Price: $${tokenData.priceUsd}
- Market Cap: $${(tokenData.marketCap / 1e9).toFixed(2)}B
- 24h Volume: $${(tokenData.volume?.h24 / 1e6).toFixed(2)}M
- Liquidity: $${(tokenData.liquidity?.usd / 1e6).toFixed(2)}M
`;

const securitySummary = `
- Owner: ${ownerAddress}
- Buy Tax: 0%
- Sell Tax: 0%
`;

const prompt = `You are a professional cryptocurrency token analyzer. Analyze the following Base token.

Token: ${tokenData.baseToken.name} (${tokenData.baseToken.symbol})
Chain: Base

Market Data:
${marketSummary}

Security Data:
${securitySummary}

Provide a detailed JSON analysis with these fields:
{
  "summary": "2-3 sentence summary",
  "riskLevel": "Very Low|Low|Medium|High|Very High",
  "recommendation": "STRONG BUY|BUY|HOLD|SELL|STRONG SELL",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

try {
  const startTime = Date.now();
  const geminiRes = await Promise.race([
    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt,
          }],
        }],
      }),
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 15000)
    ),
  ]);

  const geminiData = await geminiRes.json();
  const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    console.error("❌ Could not parse JSON from Gemini response");
    console.log("Response:", responseText.substring(0, 200));
    process.exit(1);
  }

  const analysis = JSON.parse(jsonMatch[0]);
  const elapsed = Date.now() - startTime;

  console.log(`✅ AI Analysis received (${elapsed}ms)`);
  console.log(`   Risk Level: ${analysis.riskLevel}`);
  console.log(`   Recommendation: ${analysis.recommendation}`);
  console.log(`   Summary: ${analysis.summary.substring(0, 100)}...`);
  console.log(`   Key Points: ${analysis.keyPoints?.length || 0} points\n`);

  console.log("✅ All tests passed!\n");
  console.log("📋 Full Analysis:");
  console.log(JSON.stringify(analysis, null, 2));

} catch (e) {
  console.error(`❌ Gemini API error: ${e.message}`);
  process.exit(1);
}
