/**
 * ERC-8004 Contract Addresses
 * Same deterministic addresses across all chains (vanity prefix 0x8004)
 */

// Base Mainnet (primary chain for Inteliose)
export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = "https://mainnet.base.org";

// Base Sepolia Testnet (for development)
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";

// Mainnet contract addresses (same on all chains)
export const MAINNET_IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;
export const MAINNET_REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as const;

// Testnet contract addresses (same on all testnets)
export const TESTNET_IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;
export const TESTNET_REPUTATION_REGISTRY = "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const;

// Use testnet by default for development, switch to mainnet for production
export function getContracts(useTestnet = true) {
  return {
    identityRegistry: useTestnet ? TESTNET_IDENTITY_REGISTRY : MAINNET_IDENTITY_REGISTRY,
    reputationRegistry: useTestnet ? TESTNET_REPUTATION_REGISTRY : MAINNET_REPUTATION_REGISTRY,
    rpcUrl: useTestnet ? BASE_SEPOLIA_RPC_URL : BASE_RPC_URL,
    chainId: useTestnet ? BASE_SEPOLIA_CHAIN_ID : BASE_CHAIN_ID,
  };
}
