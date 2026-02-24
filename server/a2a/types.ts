/**
 * A2A Protocol types (simplified implementation)
 * Based on A2A Protocol Specification v1.0
 */

// --- Task States ---
export type TaskState =
  | "pending"
  | "working"
  | "completed"
  | "failed"
  | "canceled"
  | "input-required";

// --- Parts ---
export interface TextPart {
  type: "text";
  text: string;
}

export interface DataPart {
  type: "data";
  mimeType: string;
  data: Record<string, any>;
}

export type Part = TextPart | DataPart;

// --- Messages ---
export interface Message {
  role: "user" | "agent";
  parts: Part[];
  messageId?: string;
  taskId?: string;
  contextId?: string;
}

// --- Artifacts ---
export interface Artifact {
  artifactId: string;
  name?: string;
  parts: Part[];
}

// --- Tasks ---
export interface TaskStatus {
  state: TaskState;
  message?: Message;
  timestamp: string;
}

export interface Task {
  id: string;
  contextId: string;
  status: TaskStatus;
  messages: Message[];
  artifacts: Artifact[];
  createdAt: string;
  updatedAt: string;
}

// --- JSON-RPC 2.0 ---
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// --- Skill Input/Output ---
export interface TokenHealthCheckInput {
  tokenAddress: string;
  chain: "Base" | "Solana";
  devWallet?: string;
}

export interface RiskBaselineInput {
  tokenAddress: string;
  chain: "Base" | "Solana";
}
