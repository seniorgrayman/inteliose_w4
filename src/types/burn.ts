export type ComplexityLevel = "simple" | "medium" | "complex" | "very_complex" | "standard";

export interface BurnEstimate {
  burnRequired: boolean;
  tokenAmount?: number;
  complexity?: ComplexityLevel;
  multipliers?: string[];
  usdCost?: number;
  priceUsd?: number | null;
  tokenAddress?: string;
  tokenDecimals?: number;
  tokenSymbol?: string;
  deadAddress?: string;
}

export interface BurnSubmission {
  burnRequired?: boolean;
  burnId?: string;
  tokenAmount?: number;
  tokenAddress?: string;
  tokenDecimals?: number;
  deadAddress?: string;
}

export interface BurnVerification {
  verified: boolean;
  burnId?: string;
  txHash?: string;
  error?: string;
}

export interface BurnRecord {
  id: string;
  wallet_address: string;
  query_text: string;
  token_address: string;
  amount_burned: number;
  complexity: string;
  burn_signature: string;
  status: string;
  ai_model: string;
  chain_id: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface BurnHistoryResponse {
  success: boolean;
  burns: BurnRecord[];
  total: number;
}

export type BurnStatus =
  | "idle"
  | "estimating"
  | "awaiting_confirmation"
  | "signing"
  | "confirming"
  | "verified"
  | "error";
