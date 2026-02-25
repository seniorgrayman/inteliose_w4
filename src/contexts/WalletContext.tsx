import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";

export type WalletType = "phantom" | "metamask";
export type NetworkStatus = "connected" | "wrong_network" | "disconnected";

// Base Mainnet
const BASE_CHAIN_ID = 8453;
const BASE_CHAIN_HEX = "0x2105";

// ─── Provider helpers ────────────────────────────────────────────────────────

interface EVMProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, cb: (...args: any[]) => void) => void;
  removeListener: (event: string, cb: (...args: any[]) => void) => void;
  isPhantom?: boolean;
  isMetaMask?: boolean;
}

const getPhantomEVMProvider = (): EVMProvider | null => {
  if (typeof window === "undefined") return null;
  const p = (window as any).phantom?.ethereum;
  return p?.isPhantom ? p : null;
};

const getMetaMaskProvider = (): EVMProvider | null => {
  if (typeof window === "undefined") return null;
  const p = (window as any).ethereum;
  // Avoid grabbing Phantom's injected window.ethereum
  return p?.isMetaMask && !p?.isPhantom ? p : null;
};

export const getEVMProviderForType = (type: WalletType | null): EVMProvider | null => {
  if (type === "phantom") return getPhantomEVMProvider();
  if (type === "metamask") return getMetaMaskProvider();
  return null;
};

const formatAddress = (addr: string) =>
  addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

// ─── Context ─────────────────────────────────────────────────────────────────

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;       // truncated for display
  fullWalletAddress: string;   // full 0x address
  walletType: WalletType | null;
  networkStatus: NetworkStatus;
  isConnecting: boolean;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  switchToBase: () => Promise<void>;
  openConnectModal: () => void;
  isModalOpen: boolean;
  closeModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = "inteliose_wallet";

// ─── Provider ────────────────────────────────────────────────────────────────

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [fullWalletAddress, setFullWalletAddress] = useState("");
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("disconnected");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialReconnectDone, setInitialReconnectDone] = useState(false);

  const fullAddressRef = useRef(fullWalletAddress);
  useEffect(() => { fullAddressRef.current = fullWalletAddress; }, [fullWalletAddress]);

  const hasHandledDisconnect = useRef(false);

  // ── Helpers ──

  const openConnectModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const setConnectedState = useCallback((type: WalletType, full: string) => {
    const short = formatAddress(full);
    setWalletType(type);
    setWalletAddress(short);
    setFullWalletAddress(full);
    setIsConnected(true);
    setNetworkStatus("connected");
    hasHandledDisconnect.current = false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, address: short, fullAddress: full }));
    // Keep legacy keys for pages that read localStorage directly (ManageProject)
    localStorage.setItem("walletAddress", full);
    localStorage.setItem("walletType", type);
  }, []);

  const clearWallet = useCallback((message?: string) => {
    if (hasHandledDisconnect.current) return;
    hasHandledDisconnect.current = true;

    console.log("[Wallet] Disconnecting:", message || "manual");
    setIsConnected(false);
    setWalletAddress("");
    setFullWalletAddress("");
    setWalletType(null);
    setNetworkStatus("disconnected");

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
  }, []);

  // ── Ensure Base chain ──

  const ensureBaseChain = useCallback(async (provider: EVMProvider): Promise<boolean> => {
    try {
      const hex = await provider.request({ method: "eth_chainId" });
      const current = parseInt(hex, 16);
      if (current === BASE_CHAIN_ID) {
        setNetworkStatus("connected");
        return true;
      }
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_HEX }] });
        setNetworkStatus("connected");
        return true;
      } catch (err: any) {
        if (err.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: BASE_CHAIN_HEX,
              chainName: "Base",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            }],
          });
          setNetworkStatus("connected");
          return true;
        }
        setNetworkStatus("wrong_network");
        return false;
      }
    } catch {
      setNetworkStatus("wrong_network");
      return false;
    }
  }, []);

  const switchToBase = useCallback(async () => {
    const provider = getEVMProviderForType(walletType);
    if (provider) await ensureBaseChain(provider);
  }, [walletType, ensureBaseChain]);

  // ── Connect ──

  const connect = useCallback(async (type: WalletType) => {
    setIsConnecting(true);
    hasHandledDisconnect.current = false;

    try {
      const provider = type === "phantom" ? getPhantomEVMProvider() : getMetaMaskProvider();

      if (!provider) {
        window.open(
          type === "phantom" ? "https://phantom.app/" : "https://metamask.io/download/",
          "_blank"
        );
        return;
      }

      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      if (!accounts.length) return;

      const addr = accounts[0];
      await ensureBaseChain(provider);
      setConnectedState(type, addr);
      setIsModalOpen(false);
      console.log(`[Wallet] ${type} connected:`, addr);
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes("rejected")) {
        console.log("[Wallet] User rejected connection");
      } else {
        console.error("[Wallet] Connect error:", err);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [ensureBaseChain, setConnectedState]);

  // ── Disconnect ──

  const disconnect = useCallback(() => {
    clearWallet("User disconnected");
  }, [clearWallet]);

  // ── Eager reconnect on mount ──

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Try migrating from legacy keys
      const legacyAddr = localStorage.getItem("walletAddress");
      const legacyType = localStorage.getItem("walletType") as WalletType | null;
      if (!legacyAddr || !legacyType) {
        setInitialReconnectDone(true);
        return;
      }
      // Migrate
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: legacyType, address: formatAddress(legacyAddr), fullAddress: legacyAddr }));
    }

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const { type, address, fullAddress } = saved;

    // Set state immediately so UI shows connected
    setWalletType(type);
    setWalletAddress(address);
    setFullWalletAddress(fullAddress || address);
    setIsConnected(true);
    setNetworkStatus("connected");

    // Verify the wallet is still accessible
    const verify = async () => {
      await new Promise(r => setTimeout(r, 500)); // Give extensions time to inject

      const provider = getEVMProviderForType(type);
      if (!provider) {
        // Extension not available — keep state from localStorage, user might just need to unlock
        console.log("[Wallet] Provider not available yet, keeping saved state");
        setInitialReconnectDone(true);
        return;
      }

      try {
        const accounts: string[] = await provider.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          // Wallet locked or disconnected — clear
          clearWallet("Wallet connection lost");
          setInitialReconnectDone(true);
          return;
        }

        const currentAddr = accounts[0].toLowerCase();
        const savedAddr = (fullAddress || address).toLowerCase();

        if (currentAddr !== savedAddr) {
          // User switched accounts while away — update to new address
          console.log("[Wallet] Account changed, updating to:", accounts[0]);
          setConnectedState(type, accounts[0]);
        }

        await ensureBaseChain(provider);
        console.log(`[Wallet] ${type} eagerly reconnected:`, accounts[0]);
      } catch (err) {
        console.warn("[Wallet] Eager reconnect failed:", err);
        // Keep saved state — wallet might just be locked
      }

      setInitialReconnectDone(true);
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Event listeners: account switch, chain change, disconnect ──

  useEffect(() => {
    if (!isConnected || !fullWalletAddress || !walletType) return;

    const provider = getEVMProviderForType(walletType);
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        clearWallet("Wallet disconnected");
        return;
      }
      const newAddr = accounts[0].toLowerCase();
      const currentAddr = fullAddressRef.current.toLowerCase();
      if (newAddr !== currentAddr) {
        // Account switched — update state (don't disconnect)
        console.log("[Wallet] Account switched to:", accounts[0]);
        setConnectedState(walletType!, accounts[0]);
      }
    };

    const handleChainChanged = (chainHex: string) => {
      const newChain = parseInt(chainHex, 16);
      setNetworkStatus(newChain === BASE_CHAIN_ID ? "connected" : "wrong_network");
    };

    const handleDisconnect = () => {
      clearWallet("Wallet disconnected");
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);
    console.log("[Wallet] Event listeners attached");

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, [isConnected, walletType, fullWalletAddress, clearWallet, setConnectedState]);

  // ── Polling backup (every 3s) ──

  useEffect(() => {
    if (!initialReconnectDone || !isConnected || !fullWalletAddress || !walletType) return;

    const poll = async () => {
      const provider = getEVMProviderForType(walletType);
      if (!provider) return;

      try {
        const accounts: string[] = await provider.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          clearWallet("Wallet disconnected");
          return;
        }
        const current = accounts[0].toLowerCase();
        const saved = fullAddressRef.current.toLowerCase();
        if (current !== saved) {
          console.log("[Wallet] Polling detected account switch:", accounts[0]);
          setConnectedState(walletType!, accounts[0]);
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [initialReconnectDone, isConnected, walletType, fullWalletAddress, clearWallet, setConnectedState]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        fullWalletAddress,
        walletType,
        networkStatus,
        isConnecting,
        connect,
        disconnect,
        switchToBase,
        openConnectModal,
        isModalOpen,
        closeModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};
