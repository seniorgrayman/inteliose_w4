export type Stage = "pre-launch" | "live" | "post-launch" | "revival";
export type Intent = "fast-flip" | "medium" | "long";
export type LaunchPlatform = "pumpfun" | "bags" | "raydium" | "moonshot" | "launchmytoken";
export type Category = "ai" | "meme" | "defi" | "gamify" | "nft" | "socialfi" | "dao" | "utility";
export type LaunchType = "meme" | "liquidity" | "ido";

export interface ProfileModel {
  tokenAddress: string;
  isPrelaunch: boolean;
  stage: Stage | null;
  launchPlatform: LaunchPlatform | null;
  launchType: LaunchType | null;
  category: Category | null;
  intent: Intent | null;
  devWallet: string;
  marketingWallet: string;
}

export interface SnapshotData {
  chain: string;
  riskBaseline: "Low" | "Moderate" | "Elevated" | "Critical";
  primaryFailureModes: string[];
  nextPrompt: string;
}

export interface AiDiagnosis {
  summary: string;
  riskFactors: string[];
  recommendations: string[];
  timestamp: number;
}

export interface Project {
  id: string;
  userId: string;
  profile: ProfileModel;
  snapshot?: SnapshotData;
  aiDiagnosis?: AiDiagnosis;
  createdAt: number;
  updatedAt: number;
}
