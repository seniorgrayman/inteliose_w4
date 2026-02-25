/**
 * Burn confirmation modal — restyled for Inteliose's glassmorphism design.
 * Shows cost, complexity, balance, and handles confirm/cancel.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Flame, AlertTriangle, Loader2, Zap, X } from "lucide-react";
import type { BurnEstimate, BurnStatus } from "@/types/burn";

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  simple: { label: "Simple", color: "text-emerald-600" },
  standard: { label: "Standard", color: "text-primary" },
  medium: { label: "Medium", color: "text-amber-600" },
  complex: { label: "Complex", color: "text-orange-600" },
  very_complex: { label: "Very Complex", color: "text-red-600" },
};

const MULTIPLIER_LABELS: Record<string, string> = {
  real_time: "Real-time data",
  historical: "Historical data",
  multiple_markets: "Multi-market",
};

interface Props {
  open: boolean;
  estimate: BurnEstimate | null;
  tokenBalance: number | null;
  burnStatus: BurnStatus;
  burnError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BurnConfirmModal({
  open,
  estimate,
  tokenBalance,
  burnStatus,
  burnError,
  onConfirm,
  onCancel,
}: Props) {
  if (!estimate) return null;

  const cpl = COMPLEXITY_LABELS[estimate.complexity || "standard"] || COMPLEXITY_LABELS.standard;
  const symbol = estimate.tokenSymbol || "TOKEN";
  const amount = estimate.tokenAmount || 0;
  const usdCost = estimate.usdCost;
  const balanceKnown = tokenBalance != null;
  const hasBalance = balanceKnown && tokenBalance >= amount;
  const isProcessing = burnStatus === "signing" || burnStatus === "confirming";
  const isError = burnStatus === "error";
  const canBurn = hasBalance && !isProcessing;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[hsl(0_0%_100%/0.6)] backdrop-blur-2xl"
            onClick={() => { if (!isProcessing) onCancel(); }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md relative">
              {/* Ambient glows */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-orange-500/[0.04] blur-[100px] pointer-events-none" />

              {/* Main Card */}
              <div className="relative rounded-[28px] bg-gradient-to-b from-card/95 to-card/85 backdrop-blur-3xl border border-[hsl(var(--border)/0.4)] shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_30px_80px_-20px_hsl(0_0%_0%/0.12),0_2px_8px_-2px_hsl(0_0%_0%/0.06)] overflow-hidden">
                {/* Bevel highlights */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.9)] to-transparent rounded-t-[28px] pointer-events-none z-20" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_0%/0.06)] to-transparent rounded-b-[28px] pointer-events-none z-20" />
                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 0.5px, transparent 0)", backgroundSize: "24px 24px" }} />

                {/* Header */}
                <div className="relative z-10 px-8 pt-8 pb-4">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="inline-flex items-center gap-2 bg-orange-500/[0.06] border border-orange-500/15 rounded-full px-3.5 py-1.5 mb-4"
                      >
                        <Flame size={11} className="text-orange-500" />
                        <span className="text-[10px] text-orange-600 font-display font-bold tracking-[0.12em] uppercase">Token Burn</span>
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-display font-medium text-foreground tracking-tighter leading-tight"
                      >
                        Burn to<br />
                        <span className="text-primary">Analyze</span>
                      </motion.h2>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { if (!isProcessing) onCancel(); }}
                      className="w-9 h-9 rounded-xl bg-gradient-to-b from-secondary/60 to-secondary/30 border border-[hsl(var(--border)/0.5)] flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset]"
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                </div>

                {/* Body */}
                <div className="relative z-10 px-8 pb-4 space-y-3">
                  {/* Burn Amount */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center justify-between py-3 px-4 rounded-2xl bg-gradient-to-b from-secondary/50 to-secondary/25 border border-[hsl(var(--border)/0.4)]"
                  >
                    <span className="text-sm text-muted-foreground font-display">Burn Amount</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-primary font-mono font-bold text-xl">{amount.toLocaleString()}</span>
                      <span className="text-primary/60 font-mono text-sm">{symbol}</span>
                    </div>
                  </motion.div>

                  {/* USD Cost */}
                  {usdCost != null && usdCost > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-between py-2.5 px-4"
                    >
                      <span className="text-sm text-muted-foreground font-display">USD Cost</span>
                      <span className="font-mono text-sm font-semibold text-foreground">~${usdCost.toFixed(2)}</span>
                    </motion.div>
                  )}

                  {/* Complexity */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center justify-between py-2.5 px-4"
                  >
                    <span className="text-sm text-muted-foreground font-display">Complexity</span>
                    <span className={`font-mono text-sm font-semibold ${cpl.color}`}>{cpl.label}</span>
                  </motion.div>

                  {/* Multipliers */}
                  {estimate.multipliers && estimate.multipliers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-between py-2.5 px-4"
                    >
                      <span className="text-sm text-muted-foreground font-display">Multipliers</span>
                      <div className="flex gap-1.5">
                        {estimate.multipliers.map((m) => (
                          <span
                            key={m}
                            className="px-2.5 py-1 rounded-xl bg-primary/[0.06] border border-primary/15 text-[10px] text-primary font-display font-bold tracking-wider uppercase"
                          >
                            {MULTIPLIER_LABELS[m] || m}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Balance */}
                  {tokenBalance != null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="flex items-center justify-between py-2.5 px-4"
                    >
                      <span className="text-sm text-muted-foreground font-display">Your Balance</span>
                      <span className={`font-mono text-sm font-semibold ${hasBalance ? "text-emerald-600" : "text-red-600"}`}>
                        {tokenBalance.toLocaleString()} {symbol}
                      </span>
                    </motion.div>
                  )}

                  {/* Destination */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between py-2.5 px-4"
                  >
                    <span className="text-sm text-muted-foreground font-display">Burn To</span>
                    <span className="font-mono text-[11px] text-muted-foreground/60">0x000...dEaD</span>
                  </motion.div>

                  {/* Insufficient balance warning */}
                  {balanceKnown && !hasBalance && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-500/[0.06] border border-red-500/15"
                    >
                      <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-600 text-xs font-display font-semibold">Insufficient Balance</p>
                        <p className="text-red-500/70 text-[11px] mt-0.5 font-display">
                          {tokenBalance === 0
                            ? `You don't hold any ${symbol} tokens. Buy ${symbol} on Base to continue.`
                            : `You need ${(amount - tokenBalance!).toLocaleString()} more ${symbol}`}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Balance check failed */}
                  {!balanceKnown && burnStatus === "awaiting_confirmation" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15"
                    >
                      <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-amber-600 text-xs font-display font-semibold">Unable to verify balance</p>
                        <p className="text-amber-500/70 text-[11px] mt-0.5 font-display">
                          Make sure your wallet is connected to Base network.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Processing status */}
                  {burnStatus === "signing" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5 p-4 rounded-2xl bg-primary/[0.06] border border-primary/15"
                    >
                      <Loader2 size={16} className="text-primary animate-spin" />
                      <span className="text-primary text-xs font-display font-semibold">Confirm in your wallet...</span>
                    </motion.div>
                  )}

                  {burnStatus === "confirming" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5 p-4 rounded-2xl bg-primary/[0.06] border border-primary/15"
                    >
                      <Loader2 size={16} className="text-primary animate-spin" />
                      <span className="text-primary text-xs font-display font-semibold">Confirming on Base...</span>
                    </motion.div>
                  )}

                  {/* Error */}
                  {isError && burnError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-500/[0.06] border border-red-500/15"
                    >
                      <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-red-600/80 text-xs font-display">{burnError}</p>
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="relative z-10 px-8 pb-8 pt-3 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-gradient-to-b from-secondary/60 to-secondary/30 border border-[hsl(var(--border)/0.4)] text-muted-foreground text-sm font-display font-medium hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset]"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={canBurn ? { scale: 1.03, y: -1, boxShadow: "0 12px 40px hsl(240 100% 50% / 0.25)" } : {}}
                    whileTap={canBurn ? { scale: 0.97 } : {}}
                    onClick={onConfirm}
                    disabled={!canBurn}
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-display font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_6px_25px_hsl(var(--primary)/0.3),0_1px_0_0_hsl(0_0%_100%/0.15)_inset]"
                  >
                    {isProcessing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Zap size={16} />
                    )}
                    {isProcessing ? "Processing..." : !balanceKnown ? "Balance Unknown" : !hasBalance ? "Insufficient Balance" : "Burn & Analyze"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
