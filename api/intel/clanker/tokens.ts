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

    // Construct Clanker API URL
    const url = new URL("https://www.clanker.world/api/tokens");
    url.searchParams.set("limit", Math.min(limit, 50).toString()); // Cap at 50
    url.searchParams.set("page", Math.max(1, page).toString());
    url.searchParams.set("sort", "created"); // Sort by most recently created
    url.searchParams.set("order", "desc");

    // Fetch from Clanker API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "inteliose-app/1.0",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Clanker API error: ${response.status}`);
      res.status(response.status).json({
        error: "Failed to fetch Clanker tokens",
        details: `HTTP ${response.status}`,
      });
      return;
    }

    const data = await response.json();

    // Return the data (Clanker API typically returns { tokens: [...] })
    res.json({
      tokens: data.tokens || data || [],
      page,
      limit,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Clanker API proxy error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      res.status(504).json({ error: "Request timeout" });
    } else {
      res.status(500).json({
        error: "Failed to fetch Clanker tokens",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
