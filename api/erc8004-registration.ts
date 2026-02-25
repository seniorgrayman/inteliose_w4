import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "./_lib/cors.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "www.daointel.io";
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
              agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
            },
          ]
        : [],
    supportedTrust: ["reputation"],
  });
}
