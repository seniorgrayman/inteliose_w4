import fs from "fs";
import path from "path";

// Load .env file manually (no dotenv dependency)
const envPath = path.join(import.meta.dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

import express from "express";
import cors from "cors";
import a2aRoutes from "./routes/a2a.js";
import erc8004Routes from "./routes/erc8004.js";
import farcasterRoutes from "./routes/farcaster.js";
import { buildAgentCard } from "./a2a/agent-card.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  if (req.path !== "/health") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "inteliose-server", timestamp: new Date().toISOString() });
});

// ERC-8004 Registration File (served at root for direct access)
app.get("/erc8004-registration.json", (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const baseUrl = `${protocol}://${host}`;

  const agentId = process.env.VITE_INTELIOSE_AGENT_ID || "0";

  res.json({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: "Inteliose Intelligence Agent",
    description:
      "Web4 AI intelligence agent for cryptocurrency token analysis. Provides health verdicts, risk baselines, failure mode detection, and revival plans for tokens on Base and Solana.",
    image: `${baseUrl}/inteliose-agent.png`,
    active: true,
    updatedAt: Math.floor(Date.now() / 1000),
    services: [
      {
        name: "A2A",
        endpoint: `${baseUrl}/.well-known/agent-card.json`,
        version: "1.0",
        a2aSkills: ["token-health-check", "risk-baseline"],
      },
      {
        name: "web",
        endpoint: "https://inteliose.com",
      },
    ],
    registrations:
      agentId !== "0"
        ? [
            {
              agentId: parseInt(agentId),
              agentRegistry: `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`,
            },
          ]
        : [],
    supportedTrust: ["reputation"],
  });
});

// A2A routes (includes /.well-known/agent-card.json and /a2a)
app.use(a2aRoutes);

// ERC-8004 routes (under /intel/erc8004/*)
app.use(erc8004Routes);

// Farcaster routes
app.use(farcasterRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  Inteliose Server v1.0.0                                ║
║  Port: ${PORT}                                            ║
║                                                          ║
║  Endpoints:                                              ║
║  ├─ GET  /health                    Health check         ║
║  ├─ GET  /.well-known/agent-card.json  A2A Discovery     ║
║  ├─ POST /a2a                       A2A JSON-RPC         ║
║  ├─ GET  /intel/a2a/stats           A2A Stats            ║
║  ├─ GET  /intel/a2a/tasks           A2A Activity Feed    ║
║  ├─ GET  /intel/erc8004/agent       Agent Identity       ║
║  ├─ GET  /intel/erc8004/reputation  Reputation Score     ║
║  ├─ GET  /erc8004-registration.json Registration File    ║
║  ├─ POST /farcaster/webhook        Farcaster Webhook     ║
║  ├─ GET  /farcaster/frame          Farcaster Frame       ║
║  ├─ POST /farcaster/frame-action   Frame Action          ║
║  └─ GET  /farcaster/status         Bot Status            ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
