import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "./_lib/cors.js";
import { handleA2ARequest } from "../server/a2a/executor.js";
import type { JsonRpcRequest } from "../server/a2a/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const request = req.body as JsonRpcRequest;

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
}
