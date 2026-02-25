/**
 * Inteliose Backend API Client
 * Connects to the local backend server for A2A and ERC-8004 data
 */

const BACKEND_BASE = "/api"; // Vercel serverless functions at /api/*

// --- ERC-8004 ---

export interface AgentIdentity {
  registered: boolean;
  agentId: string | null;
  tokenURI?: string;
  owner?: string;
  registryAddress?: string;
  chain?: string;
  explorerUrl?: string;
  scanUrl?: string;
  registration?: any;
  message?: string;
  contracts?: {
    identityRegistry: string;
    reputationRegistry: string;
    chain: string;
  };
}

export interface AgentReputation {
  registered: boolean;
  agentId: string | null;
  feedbackCount: number;
  averageScore: number;
  maxScore: number;
  clients: string[];
  registryAddress?: string;
  chain?: string;
  message?: string;
}

export async function fetchAgentIdentity(): Promise<AgentIdentity> {
  try {
    const res = await fetch(`${BACKEND_BASE}/intel/erc8004/agent`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      registered: false,
      agentId: null,
      message: "Backend server not running. Start with: cd server && npm run dev",
    };
  }
}

export async function fetchAgentReputation(): Promise<AgentReputation> {
  try {
    const res = await fetch(`${BACKEND_BASE}/intel/erc8004/reputation`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      registered: false,
      agentId: null,
      feedbackCount: 0,
      averageScore: 0,
      maxScore: 100,
      clients: [],
      message: "Backend server not running.",
    };
  }
}

// --- A2A ---

export interface A2AStats {
  total: number;
  pending: number;
  working: number;
  completed: number;
  failed: number;
}

export interface A2ATask {
  id: string;
  contextId: string;
  status: {
    state: string;
    message?: {
      role: string;
      parts: Array<{ type: string; text?: string; data?: any }>;
    };
    timestamp: string;
  };
  messages: Array<{
    role: string;
    parts: Array<{ type: string; text?: string; data?: any }>;
  }>;
  artifacts: Array<{
    artifactId: string;
    name?: string;
    parts: Array<{ type: string; text?: string; data?: any }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export async function fetchA2AStats(): Promise<A2AStats> {
  try {
    const res = await fetch(`${BACKEND_BASE}/intel/a2a/stats`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { total: 0, pending: 0, working: 0, completed: 0, failed: 0 };
  }
}

export async function fetchA2ATasks(limit = 20): Promise<A2ATask[]> {
  try {
    const res = await fetch(`${BACKEND_BASE}/intel/a2a/tasks?limit=${limit}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.tasks || [];
  } catch {
    return [];
  }
}

// --- Agent Card ---

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  protocolVersion: string;
  provider: { organization: string; url?: string };
  capabilities: { streaming: boolean; pushNotifications: boolean };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
  }>;
  securitySchemes?: Record<string, any>;
}

export async function fetchAgentCard(): Promise<AgentCard | null> {
  try {
    const res = await fetch(`${BACKEND_BASE}/well-known/agent-card`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}
