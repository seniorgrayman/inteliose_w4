import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "../../_lib/cors.js";

/**
 * Proxy endpoint for Clanker.world API
 * Fetches recently created Clanker tokens from the Clanker API
 * This bypasses CORS issues by proxying through our backend
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Get query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;

    // Construct Clanker API URL - try multiple endpoints
    let response;
    const timeout = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Try the base endpoint first (no pagination)
    try {
      const url = new URL("https://www.clanker.world/api/tokens");
      // Don't send parameters that might cause 400 - just fetch all and filter
      
      response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "inteliose-app/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Return the data (Clanker API typically returns array or { data: [...] })
      const tokens = Array.isArray(data) ? data : (data.tokens || data.data || []);
      
      // Apply pagination on the client side
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTokens = tokens.slice(start, end);

      res.json({
        tokens: paginatedTokens,
        page,
        limit,
        total: tokens.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Clanker API error:", error);

      if (error instanceof Error && error.name === "AbortError") {
        res.status(504).json({
          error: "Request timeout",
          tokens: [],
          page,
          limit,
        });
      } else {
        res.status(502).json({
          error: "Failed to fetch Clanker tokens",
          details: error instanceof Error ? error.message : "Unknown error",
          tokens: [],
          page,
          limit,
        });
      }
    }
  } catch (error) {
    console.error("Clanker API proxy error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
      tokens: [],
    });
  }
}
