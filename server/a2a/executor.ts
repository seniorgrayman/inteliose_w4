import { TaskStore } from "./task-store.js";
import { executeTokenHealthCheck } from "./skills/token-health-check.js";
import { executeRiskBaseline } from "./skills/risk-baseline.js";
import { autoCastResult } from "../farcaster/auto-publisher.js";
import type {
  JsonRpcRequest,
  JsonRpcResponse,
  Message,
  TokenHealthCheckInput,
  RiskBaselineInput,
} from "./types.js";
import crypto from "crypto";

const taskStore = new TaskStore();

/**
 * Parse skill and input from an A2A message
 */
function parseSkillRequest(message: Message): {
  skillId: string | null;
  input: any;
} {
  // Try to extract from data parts first
  for (const part of message.parts) {
    if (part.type === "data" && part.data) {
      if (part.data.skillId) {
        return { skillId: part.data.skillId, input: part.data.input || part.data };
      }
      if (part.data.tokenAddress) {
        // Auto-detect skill from input shape
        const hasDevWallet = "devWallet" in part.data;
        return {
          skillId: hasDevWallet ? "token-health-check" : "risk-baseline",
          input: part.data,
        };
      }
    }
  }

  // Try to parse from text parts
  for (const part of message.parts) {
    if (part.type === "text") {
      try {
        const parsed = JSON.parse(part.text);
        if (parsed.skillId) {
          return { skillId: parsed.skillId, input: parsed.input || parsed };
        }
        if (parsed.tokenAddress) {
          return { skillId: "token-health-check", input: parsed };
        }
      } catch {
        // Not JSON — try natural language extraction (basic)
        const addressMatch = part.text.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          return {
            skillId: "token-health-check",
            input: { tokenAddress: addressMatch[0], chain: "Base" },
          };
        }
        // Solana address pattern
        const solMatch = part.text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
        if (solMatch) {
          return {
            skillId: "token-health-check",
            input: { tokenAddress: solMatch[0], chain: "Solana" },
          };
        }
      }
    }
  }

  return { skillId: null, input: null };
}

/**
 * Execute a skill and return result parts
 */
async function executeSkill(skillId: string, input: any) {
  switch (skillId) {
    case "token-health-check":
      return executeTokenHealthCheck(input as TokenHealthCheckInput);
    case "risk-baseline":
      return executeRiskBaseline(input as RiskBaselineInput);
    default:
      return { parts: [], error: `Unknown skill: ${skillId}` };
  }
}

/**
 * Handle A2A JSON-RPC 2.0 requests
 */
export async function handleA2ARequest(req: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { method, params, id } = req;

  switch (method) {
    case "SendMessage": {
      const message: Message = params?.message;
      if (!message || !message.parts || message.parts.length === 0) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Invalid message: must contain parts" },
        };
      }

      // Create task
      const task = await taskStore.createTask(params?.contextId);
      await taskStore.addMessage(task.id, message);
      await taskStore.updateStatus(task.id, "working");

      // Parse and execute skill
      const { skillId, input } = parseSkillRequest(message);

      if (!skillId) {
        await taskStore.updateStatus(task.id, "failed", {
          role: "agent",
          parts: [{ type: "text", text: "Could not determine which skill to use. Please provide a tokenAddress and chain." }],
        });
        return {
          jsonrpc: "2.0",
          id,
          result: { task: await taskStore.getTask(task.id) },
        };
      }

      const result = await executeSkill(skillId, input);

      if (result.error) {
        await taskStore.updateStatus(task.id, "failed", {
          role: "agent",
          parts: [{ type: "text", text: result.error }],
        });
      } else {
        // Add artifact
        await taskStore.addArtifact(task.id, {
          artifactId: crypto.randomUUID(),
          name: `${skillId}-result`,
          parts: result.parts,
        });

        // Mark completed with summary message
        const textPart = result.parts.find((p) => p.type === "text");
        await taskStore.updateStatus(task.id, "completed", {
          role: "agent",
          parts: [textPart || { type: "text", text: "Analysis complete." }],
        });

        // Fire-and-forget auto-publish to Farcaster
        autoCastResult(await taskStore.getTask(task.id)).catch(() => {});
      }

      return {
        jsonrpc: "2.0",
        id,
        result: { task: await taskStore.getTask(task.id) },
      };
    }

    case "GetTask": {
      const taskId = params?.taskId;
      if (!taskId) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "taskId is required" },
        };
      }
      const task = await taskStore.getTask(taskId);
      if (!task) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32001, message: "Task not found" },
        };
      }
      return { jsonrpc: "2.0", id, result: { task } };
    }

    case "ListTasks": {
      const limit = params?.limit || 50;
      const offset = params?.offset || 0;
      const tasks = await taskStore.listTasks(limit, offset);
      return { jsonrpc: "2.0", id, result: { tasks } };
    }

    case "CancelTask": {
      const taskId = params?.taskId;
      const task = await taskStore.getTask(taskId);
      if (!task) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32001, message: "Task not found" },
        };
      }
      if (["completed", "failed", "canceled"].includes(task.status.state)) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32002, message: "Task is in a terminal state and cannot be canceled" },
        };
      }
      await taskStore.updateStatus(taskId, "canceled");
      return { jsonrpc: "2.0", id, result: { task: await taskStore.getTask(taskId) } };
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

/**
 * Get task store stats for the dashboard
 */
export async function getA2AStats() {
  return taskStore.getStats();
}

/**
 * Get recent tasks for the activity feed
 */
export async function getRecentTasks(limit = 20) {
  return taskStore.listTasks(limit);
}
