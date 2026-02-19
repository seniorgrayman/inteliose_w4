import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ExternalLink, Check, Loader2 } from "lucide-react";
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
      description: "Solana wallet",
      logo: phantomLogo,
      connect: connectPhantom,
      chain: "Solana",
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[hsl(0_0%_0%/0.7)] backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-3xl border border-[hsl(0_0%_100%/0.1)] bg-[hsl(228_14%_10%)] backdrop-blur-2xl shadow-[0_30px_100px_-20px_hsl(var(--primary)/0.2),0_0_60px_-15px_hsl(0_0%_0%/0.5)] overflow-hidden relative">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 px-8 pt-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
                    <Wallet size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-semibold text-white tracking-tight">Connect Wallet</h2>
                    <p className="text-[11px] text-white/40 font-display">Choose your preferred wallet</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.1)] flex items-center justify-center text-white/40 hover:text-white hover:bg-[hsl(0_0%_100%/0.1)] transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Wallet Options */}
              <div className="relative z-10 px-8 pb-6 space-y-3">
                {wallets.map((wallet, i) => (
                  <motion.button
                    key={wallet.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={wallet.connect}
                    disabled={connecting !== null}
                    className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] hover:bg-[hsl(0_0%_100%/0.06)] hover:border-primary/20 transition-all disabled:opacity-50 relative overflow-hidden"
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[hsl(0_0%_100%/0.1)] shrink-0 relative z-10 shadow-lg">
                      <img src={wallet.logo} alt={wallet.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left relative z-10">
                      <p className="text-sm font-display font-semibold text-white group-hover:text-white transition-colors">{wallet.name}</p>
                      <p className="text-[11px] text-white/35 font-display">{wallet.description}</p>
                    </div>
                    <div className="relative z-10 shrink-0">
                      {connecting === wallet.id ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Loader2 size={16} className="text-primary" />
                        </motion.div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.1)] text-[11px] text-white/50 font-display group-hover:text-primary group-hover:border-primary/20 transition-all">
                          {wallet.chain}
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
                    className="px-8 pb-6"
                  >
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                      <p className="text-xs text-destructive font-display">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="relative z-10 px-8 pb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.06)] to-transparent mb-5" />
                <p className="text-[10px] text-white/20 text-center font-display leading-relaxed">
                  By connecting, you agree to the Terms of Service. We never request private keys or seed phrases.
                </p>
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
