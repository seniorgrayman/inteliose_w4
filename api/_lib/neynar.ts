/**
 * Neynar SDK client for Vercel serverless functions.
 * Mirrors the pattern of api/_lib/firebase.ts.
 */
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const apiKey = process.env.VITE_NEYNAR_API_KEY || "";

export const neynarClient = new NeynarAPIClient({ apiKey });
export const SIGNER_UUID = process.env.VITE_NEYNAR_SIGNER_UUID || "";
export const BOT_FID = parseInt(process.env.VITE_FARCASTER_BOT_FID || "0", 10);
