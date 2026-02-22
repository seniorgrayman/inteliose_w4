import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Loader2, Zap, Shield, ArrowRight } from "lucide-react";
import phantomLogo from "@/assets/phantom-logo.jpg";
import metamaskLogo from "@/assets/metamask-logo.png";

type WalletType = "phantom" | "metamask";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string, wallet: WalletType) => void;
}

const truncateAddress = (addr: string) =>
  addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;


const WalletConnectModal = ({ isOpen, onClose, onConnected }: WalletConnectModalProps) => {
  const [connecting, setConnecting] = useState<WalletType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectPhantom = useCallback(async () => {
    setError(null);
    setConnecting("phantom");
    try {
      // Check if on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Use deeplink
        const deeplinkUrl = `https://phantom.app/ul/browse/${window.location.href}`;
        window.location.href = deeplinkUrl;
        return;
      }
      
      // Desktop: Use extension
      const provider = (window as any)?.phantom?.solana;
      if (!provider?.isPhantom) {
        setError("Phantom wallet not detected. Please install the extension.");
        setConnecting(null);
        return;
      }
      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      onConnected(address, "phantom");
      onClose();
    } catch (e: any) {
      setError(e?.message || "Connection rejected.");
    } finally {
      setConnecting(null);
    }
  }, [onConnected, onClose]);

  const connectMetaMask = useCallback(async () => {
    setError(null);
    setConnecting("metamask");
    try {
      // Check if on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Use deeplink
        const deeplinkUrl = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
        window.location.href = deeplinkUrl;
        return;
      }
      
      // Desktop: Use extension
      const provider = (window as any)?.ethereum;
      if (!provider?.isMetaMask) {
        setError("MetaMask not detected. Please install the extension.");
        setConnecting(null);
        return;
      }
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) {
        onConnected(accounts[0], "metamask");
        onClose();
      }
    } catch (e: any) {
      setError(e?.message || "Connection rejected.");
    } finally {
      setConnecting(null);
    }
  }, [onConnected, onClose]);

  const wallets = [
    {
      id: "phantom" as WalletType,
      name: "Phantom",
      description: "Base wallet",
      logo: phantomLogo,
      connect: connectPhantom,
      chain: "Base / Solana",
    },
    {
      id: "metamask" as WalletType,
      name: "MetaMask",
      description: "EVM wallet (Base, ETH)",
      logo: metamaskLogo,
      connect: connectMetaMask,
      chain: "Base / EVM",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — white frosted */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[hsl(0_0%_100%/0.6)] backdrop-blur-2xl"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg relative">
              {/* Ambient glows */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

              {/* Main Card — Dashboard-style glassmorphism */}
              <div className="relative rounded-[28px] bg-gradient-to-b from-card/95 to-card/85 backdrop-blur-3xl border border-[hsl(var(--border)/0.4)] shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_30px_80px_-20px_hsl(0_0%_0%/0.12),0_2px_8px_-2px_hsl(0_0%_0%/0.06)] overflow-hidden">
                {/* Bevel highlights */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.9)] to-transparent rounded-t-[28px] pointer-events-none z-20" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_0%/0.06)] to-transparent rounded-b-[28px] pointer-events-none z-20" />
                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 0.5px, transparent 0)", backgroundSize: "24px 24px" }} />

                {/* Header */}
                <div className="relative z-10 px-8 pt-8 pb-2">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/15 rounded-full px-3.5 py-1.5 mb-4"
                      >
                        <Zap size={11} className="text-primary" />
                        <span className="text-[10px] text-primary font-display font-bold tracking-[0.12em] uppercase">Secure Connect</span>
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl font-display font-medium text-foreground tracking-tighter leading-tight"
                      >
                        Connect Your<br />
                        <span className="text-primary">Wallet</span>
                      </motion.h2>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="w-9 h-9 rounded-xl bg-gradient-to-b from-secondary/60 to-secondary/30 border border-[hsl(var(--border)/0.5)] flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset]"
                    >
                      <X size={14} />
                    </motion.button>
                  </div>

                </div>

                {/* Wallet Options */}
                <div className="relative z-10 px-8 pb-4 space-y-3">
                  {wallets.map((wallet, i) => (
                    <motion.button
                      key={wallet.id}
                      initial={{ opacity: 0, y: 15, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -3, scale: 1.01, boxShadow: "0 15px 50px -15px hsl(var(--primary) / 0.12)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={wallet.connect}
                      disabled={connecting !== null}
                      className="w-full group flex items-center gap-4 p-5 rounded-[20px] border border-[hsl(var(--border)/0.4)] bg-gradient-to-b from-secondary/50 to-secondary/25 hover:border-primary/25 transition-all disabled:opacity-50 relative overflow-hidden shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.05)]"
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full bg-primary/[0.06] blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Logo */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[hsl(var(--border)/0.5)] shrink-0 relative z-10 shadow-[0_4px_15px_-3px_hsl(0_0%_0%/0.1)] group-hover:shadow-[0_8px_25px_-5px_hsl(var(--primary)/0.15)] group-hover:border-primary/20 transition-all duration-500">
                        <img src={wallet.logo} alt={wallet.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left relative z-10">
                        <p className="text-base font-display font-semibold text-foreground tracking-tight group-hover:text-foreground transition-colors">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground/60 font-display mt-0.5">{wallet.description}</p>
                      </div>

                      {/* Right side */}
                      <div className="relative z-10 shrink-0">
                        {connecting === wallet.id ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Loader2 size={18} className="text-primary" />
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-xl bg-primary/[0.06] border border-primary/15 text-[10px] text-primary font-display font-bold tracking-wider uppercase group-hover:bg-primary/[0.1] group-hover:border-primary/25 transition-all">
                              {wallet.chain}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-secondary/60 to-secondary/30 border border-[hsl(var(--border)/0.4)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset]">
                              <ArrowRight size={12} className="text-primary" />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-8 pb-4"
                    >
                      <div className="rounded-2xl bg-destructive/[0.06] border border-destructive/15 px-5 py-3.5">
                        <p className="text-xs text-destructive font-display">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className="relative z-10 px-8 pb-8 pt-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mb-5" />
                  <div className="flex items-center justify-center gap-2">
                    <Shield size={11} className="text-muted-foreground/40" />
                    <p className="text-[10px] text-muted-foreground/40 text-center font-display leading-relaxed">
                      End-to-end encrypted · No private keys requested · Secure handshake protocol
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;
export { truncateAddress };
export type { WalletType };
