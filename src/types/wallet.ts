export type WalletType = "phantom" | "metamask";

export interface EVMProvider {
  isPhantom?: boolean;
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  selectedAddress?: string | null;
  isConnected?: boolean;
}

declare global {
  interface Window {
    phantom?: {
      solana?: any;
      ethereum?: EVMProvider;
    };
    ethereum?: EVMProvider;
  }
}
