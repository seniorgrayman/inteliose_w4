/**
 * Hook that orchestrates the full burn-to-query flow.
 * Adapted for Inteliose — no WalletContext dependency.
 * Accepts wallet info as params from the parent component.
 */
import { useState, useRef, useCallback } from "react";
import type { EVMProvider } from "@/types/wallet";
import type { BurnEstimate, BurnStatus } from "@/types/burn";
import {
  isBurnEnabled,
  estimateBurn,
  submitBurn,
  processBurn,
  executeBurnTransaction,
  checkTokenBalance,
} from "@/services/burnService";

interface UseBurnParams {
  walletAddress: string | null;
  getProvider: () => EVMProvider | null;
  openWalletModal: () => void;
}

export function useBurn({ walletAddress, getProvider, openWalletModal }: UseBurnParams) {
  const [estimate, setEstimate] = useState<BurnEstimate | null>(null);
  const [burnStatus, setBurnStatus] = useState<BurnStatus>("idle");
  const [burnError, setBurnError] = useState<string | null>(null);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirmBurn = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const cancelBurn = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setShowBurnModal(false);
    setBurnStatus("idle");
    setEstimate(null);
    setBurnError(null);
  }, []);

  const requestBurn = useCallback(
    async (query: string): Promise<boolean> => {
      if (!isBurnEnabled()) return true;

      if (!walletAddress) {
        openWalletModal();
        return false;
      }

      const provider = getProvider();
      if (!provider) {
        setBurnError("EVM wallet provider not available. Please connect with Phantom or MetaMask.");
        return false;
      }

      try {
        // Get the EVM address from the provider (handles Phantom Solana → EVM bridge)
        let evmAddress: string;
        try {
          const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
          if (!accounts.length) throw new Error("No EVM account");
          evmAddress = accounts[0];
        } catch {
          setBurnError("Please connect your wallet to Base (EVM) network.");
          return false;
        }

        // Switch to Base chain (chainId 8453 = 0x2105)
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          });
        } catch (switchErr: any) {
          // 4902 = chain not added, try to add it
          if (switchErr?.code === 4902) {
            try {
              await provider.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: "0x2105",
                  chainName: "Base",
                  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://mainnet.base.org"],
                  blockExplorerUrls: ["https://basescan.org"],
                }],
              });
            } catch {
              // continue anyway — balance check may still work
            }
          }
          // other errors (user rejected, etc.) — continue, balance check will fail gracefully
        }

        // Phase 1: Estimate
        setBurnStatus("estimating");
        setBurnError(null);
        const est = await estimateBurn(query);

        if (!est.burnRequired) {
          setBurnStatus("idle");
          return true;
        }

        setEstimate(est);

        // Check balance using the EVM address on Base
        if (est.tokenAddress && est.tokenDecimals != null) {
          try {
            const bal = await checkTokenBalance(
              provider,
              est.tokenAddress,
              evmAddress,
              est.tokenDecimals
            );
            setTokenBalance(bal);
          } catch {
            setTokenBalance(null);
          }
        }

        // Phase 2: Show modal and wait for confirmation
        setBurnStatus("awaiting_confirmation");
        setShowBurnModal(true);

        const confirmed = await new Promise<boolean>((resolve) => {
          resolveRef.current = resolve;
        });

        if (!confirmed) return false;

        // Phase 3: Submit to create pending record using EVM address
        setBurnStatus("signing");
        const submission = await submitBurn(
          evmAddress,
          query,
          est.tokenAmount!,
          est.complexity!
        );

        if (!submission.burnId) {
          throw new Error("Failed to create burn record");
        }

        // Phase 4: Execute the burn transaction via wallet
        const txHash = await executeBurnTransaction(
          provider,
          est.tokenAddress!,
          est.deadAddress!,
          est.tokenAmount!,
          est.tokenDecimals!
        );

        // Phase 5: Verify on-chain
        setBurnStatus("confirming");
        const verification = await processBurn(submission.burnId, txHash);

        if (!verification.verified) {
          throw new Error(verification.error || "Burn verification failed");
        }

        setBurnStatus("verified");
        setShowBurnModal(false);
        setEstimate(null);

        await new Promise((r) => setTimeout(r, 300));
        setBurnStatus("idle");

        return true;
      } catch (err: any) {
        console.error("[useBurn] Error:", err);
        const msg = err?.message || "Burn failed";
        if (err?.code === 4001 || msg.includes("rejected") || msg.includes("denied")) {
          cancelBurn();
          return false;
        }
        setBurnStatus("error");
        setBurnError(msg);
        return false;
      }
    },
    [walletAddress, getProvider, openWalletModal, cancelBurn]
  );

  return {
    requestBurn,
    estimate,
    burnStatus,
    burnError,
    showBurnModal,
    tokenBalance,
    confirmBurn,
    cancelBurn,
  };
}
