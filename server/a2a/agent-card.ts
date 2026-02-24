/**
 * Inteliose A2A Agent Card
 * Served at /.well-known/agent-card.json
 * Describes Inteliose's capabilities to other A2A agents
 */

export interface A2ASkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface A2AAgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  protocolVersion: string;
  provider: { organization: string; url?: string };
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: A2ASkill[];
  securitySchemes?: Record<string, any>;
}

export function buildAgentCard(baseUrl: string): A2AAgentCard {
  return {
    name: "Inteliose Intelligence Agent",
    description:
      "Web4 AI intelligence agent for cryptocurrency token analysis on Base and Solana. Provides health verdicts (GREEN/YELLOW/RED), risk baselines, failure mode detection, and revival plans. Powered by on-chain data aggregation and Gemini AI.",
    url: `${baseUrl}/a2a`,
    version: "1.0.0",
    protocolVersion: "1.0",
    provider: {
      organization: "Inteliose",
      url: "https://www.daointel.io",
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    defaultInputModes: ["application/json", "text/plain"],
    defaultOutputModes: ["application/json"],
    skills: [
      {
        id: "token-health-check",
        name: "Token Health Check",
        description:
          "Full DYOR analysis of a token. Returns AI-powered health verdict (GREEN/YELLOW/RED), risk assessment, failure modes, key points, and actionable recommendations. Requires a token address and chain (Base or Solana).",
        tags: ["defi", "token-analysis", "risk", "base", "solana", "dyor", "ai-verdict"],
      },
      {
        id: "risk-baseline",
        name: "Risk Baseline Scan",
        description:
          "Quick security scan of a token. Returns security flags (hidden owner, proxy contract, mintable, blacklist, etc.), buy/sell tax rates, and ownership status. No AI call — fast and lightweight.",
        tags: ["defi", "risk", "security", "quick-check"],
      },
    ],
    securitySchemes: {
      bearer: {
        type: "http",
        scheme: "bearer",
      },
    },
  };
}
