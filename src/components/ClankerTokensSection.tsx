import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ExternalLink,
  TrendingUp,
  Droplets,
  DollarSign,
  Clock,
  Zap,
  Loader,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import {
  fetchClankerTokens,
  formatPrice,
  formatLargeNumber,
  formatTimeSince,
  type ClankerToken,
} from "@/lib/clanker";

const GlassCard = ({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative rounded-[20px] md:rounded-[28px]
        bg-gradient-to-b from-card/80 to-card/60
        backdrop-blur-3xl
        border border-[hsl(var(--border)/0.4)]
        p-5 md:p-9
        shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(0_0%_0%/0.08),0_2px_8px_-2px_hsl(0_0%_0%/0.06)]
        ${glow ? 'shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(var(--primary)/0.1),0_2px_8px_-2px_hsl(0_0%_0%/0.06)]' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.8)] to-transparent rounded-t-[28px] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_0%/0.06)] to-transparent rounded-b-[28px] pointer-events-none" />
      {children}
    </motion.div>
  );
};

const InnerCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-gradient-to-b from-secondary/50 to-secondary/30 rounded-[20px] border border-[hsl(var(--border)/0.4)] p-5 shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.05)] ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: any;
}) => (
  <div className="flex items-center gap-2.5 mb-5">
    {Icon ? (
      <div className="w-7 h-7 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
        <Icon size={13} className="text-primary" />
      </div>
    ) : (
      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
    )}
    <span className="text-xs font-display font-semibold text-muted-foreground tracking-widest uppercase">
      {children}
    </span>
  </div>
);

export default function ClankerTokensSection() {
  const [tokens, setTokens] = useState<ClankerToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const loadTokens = async () => {
    setLoading(true);
    const data = await fetchClankerTokens(12, 1);
    setTokens(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTokens();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadTokens, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard glow className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <SectionLabel icon={Zap}>Clanker</SectionLabel>
              <h2 className="text-3xl font-display font-medium tracking-tighter text-foreground mb-1">
                Latest Clanker Launches
              </h2>
              <p className="text-sm text-muted-foreground">
                Recently created tokens from Clanker on Base.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadTokens}
              disabled={loading}
              className="p-2.5 rounded-xl bg-gradient-to-b from-secondary/70 to-secondary/40 border border-[hsl(var(--border)/0.4)] text-muted-foreground hover:text-foreground transition-all"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
            </motion.button>
          </div>
        </div>
      </GlassCard>

      {/* Token Grid */}
      <div>
        {loading && tokens.length === 0 ? (
          <GlassCard>
            <div className="flex items-center gap-3 py-12 justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
              >
                <Loader size={16} className="text-primary" />
              </motion.div>
              <span className="text-sm text-muted-foreground font-display">
                Loading Clanker tokens...
              </span>
            </div>
          </GlassCard>
        ) : tokens.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12">
              <Zap size={32} className="text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground/60 font-display mb-2">
                No tokens found
              </p>
              <p className="text-xs text-muted-foreground/40 max-w-sm mx-auto leading-relaxed">
                Try refreshing or check back later for new Clanker launches.
              </p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token, idx) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="h-full bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-3xl border border-[hsl(var(--border)/0.4)] rounded-[20px] p-5 shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(0_0%_0%/0.08)] hover:border-primary/20 transition-all duration-300 group">
                  {/* Token Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {token.logo_uri ? (
                        <img
                          src={token.logo_uri}
                          alt={token.symbol}
                          className="w-10 h-10 rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Zap size={14} className="text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-display font-semibold text-foreground">
                          {token.symbol}
                        </h3>
                        <p className="text-[11px] text-muted-foreground/60">
                          {token.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-display font-bold text-primary">
                        {formatPrice(token.price_usd)}
                      </p>
                      <p className="text-[10px] text-muted-foreground/50">
                        {formatTimeSince(token.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {token.description && (
                    <p className="text-[11px] text-muted-foreground/70 mb-4 line-clamp-2">
                      {token.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    {token.market_cap_usd && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground/60 flex items-center gap-1.5">
                          <DollarSign size={12} className="text-primary/60" />
                          Market Cap
                        </span>
                        <span className="font-display font-semibold text-foreground">
                          {formatLargeNumber(token.market_cap_usd)}
                        </span>
                      </div>
                    )}
                    {token.liquidity_usd && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground/60 flex items-center gap-1.5">
                          <Droplets size={12} className="text-primary/60" />
                          Liquidity
                        </span>
                        <span className="font-display font-semibold text-foreground">
                          {formatLargeNumber(token.liquidity_usd)}
                        </span>
                      </div>
                    )}
                    {token.volume_24h_usd && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground/60 flex items-center gap-1.5">
                          <TrendingUp size={12} className="text-primary/60" />
                          24h Volume
                        </span>
                        <span className="font-display font-semibold text-foreground">
                          {formatLargeNumber(token.volume_24h_usd)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tax Info */}
                  {(token.buy_tax !== undefined || token.sell_tax !== undefined) && (
                    <div className="flex items-center gap-2 mb-4 text-[10px]">
                      {token.buy_tax !== undefined && (
                        <span className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500/80">
                          Buy: {token.buy_tax}%
                        </span>
                      )}
                      {token.sell_tax !== undefined && (
                        <span className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500/80">
                          Sell: {token.sell_tax}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contract Address & Links */}
                  <div className="space-y-2 pt-4 border-t border-border/20">
                    <button
                      onClick={() =>
                        handleCopyAddress(token.contract_address)
                      }
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/60 border border-[hsl(var(--border)/0.3)] text-[11px] font-mono text-muted-foreground hover:text-foreground transition-all group/btn"
                    >
                      <span className="truncate flex-1 text-left">
                        {token.contract_address.slice(0, 8)}...
                        {token.contract_address.slice(-6)}
                      </span>
                      {copiedAddress === token.contract_address ? (
                        <Check size={12} className="text-green-500 shrink-0" />
                      ) : (
                        <Copy size={12} className="shrink-0" />
                      )}
                    </button>

                    {token.website && (
                      <a
                        href={token.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[11px] font-display font-semibold transition-all"
                      >
                        Website
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
