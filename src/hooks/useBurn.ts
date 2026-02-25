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
        // Phase 1: Estimate
        setBurnStatus("estimating");
        setBurnError(null);
        const est = await estimateBurn(query);

        if (!est.burnRequired) {
          setBurnStatus("idle");
          return true;
        }

        setEstimate(est);

        // Check balance
        if (est.tokenAddress && est.tokenDecimals != null) {
          try {
            const bal = await checkTokenBalance(
              provider,
              est.tokenAddress,
              walletAddress,
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

        // Phase 3: Submit to create pending record
        setBurnStatus("signing");
        const submission = await submitBurn(
          walletAddress,
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
