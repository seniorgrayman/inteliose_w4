import { Router } from "express";
import { buildAgentCard } from "../a2a/agent-card.js";
import { handleA2ARequest, getA2AStats, getRecentTasks } from "../a2a/executor.js";
import type { JsonRpcRequest } from "../a2a/types.js";

const router = Router();

/**
 * GET /.well-known/agent-card.json
 * A2A Discovery endpoint — serves the Agent Card
 */
router.get("/.well-known/agent-card.json", (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const baseUrl = `${protocol}://${host}`;

  const card = buildAgentCard(baseUrl);
  res.json(card);
});

/**
 * POST /a2a
 * A2A JSON-RPC 2.0 endpoint — handles all agent-to-agent communication
 */
router.post("/a2a", async (req, res) => {
  const request = req.body as JsonRpcRequest;

  // Validate JSON-RPC format
  if (!request || request.jsonrpc !== "2.0" || !request.method) {
    res.status(400).json({
      jsonrpc: "2.0",
      id: request?.id || null,
      error: { code: -32600, message: "Invalid JSON-RPC 2.0 request" },
    });
    return;
  }

  const response = await handleA2ARequest(request);
  res.json(response);
});

/**
 * GET /intel/a2a/stats
 * Dashboard endpoint — A2A activity stats
 */
router.get("/intel/a2a/stats", (_req, res) => {
  const stats = getA2AStats();
  res.json(stats);
});

/**
 * GET /intel/a2a/tasks
 * Dashboard endpoint — recent A2A tasks for activity feed
 */
router.get("/intel/a2a/tasks", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const tasks = getRecentTasks(limit);
  res.json({ tasks });
});

export default router;
