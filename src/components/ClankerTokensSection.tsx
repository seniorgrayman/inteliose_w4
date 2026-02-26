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
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  fetchClankerTokens,
  formatPrice,
  formatLargeNumber,
  formatTimeSince,
  type ClankerToken,
} from "@/lib/clanker";
import { fetchTokenData, fetchSecurityScan, generateAIAnalysis, type AIAnalysis } from "@/lib/tokendata";

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

interface AnalysisState {
  tokenAddress: string;
  tokenData: any;
  securityData: any;
  aiAnalysis: AIAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

export default function ClankerTokensSection() {
  const [tokens, setTokens] = useState<ClankerToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [analysisModal, setAnalysisModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ClankerToken | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    tokenAddress: "",
    tokenData: null,
    securityData: null,
    aiAnalysis: null,
    isLoading: false,
    error: null,
  });

  const loadTokens = async () => {
    setLoading(true);
    const data = await fetchClankerTokens(12, 1);
    setTokens(data);
    setLoading(false);
  };

  const handleAnalyzeToken = async (token: ClankerToken) => {
    setSelectedToken(token);
    setAnalysisModal(true);
    setAnalysis({
      tokenAddress: token.contract_address,
      tokenData: null,
      securityData: null,
      aiAnalysis: null,
      isLoading: true,
      error: null,
    });

    try {
      // Fetch token data from DexScreener
      const tokenData = await fetchTokenData(token.contract_address, "Base");
      
      if (!tokenData) {
        setAnalysis((prev) => ({
          ...prev,
          error: "Token not deployed yet on DexScreener",
          isLoading: false,
        }));
        return;
      }

      // Fetch security scan
      const securityData = await fetchSecurityScan(token.contract_address, "Base");

      // Generate AI analysis
      let aiAnalysis: AIAnalysis | null = null;
      if (tokenData && securityData) {
        aiAnalysis = await generateAIAnalysis(
          tokenData.name,
          tokenData.symbol,
          tokenData,
          securityData,
          "Base"
        );
      }

      setAnalysis({
        tokenAddress: token.contract_address,
        tokenData,
        securityData,
        aiAnalysis,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAnalysis((prev) => ({
        ...prev,
        error: "Failed to analyze token",
        isLoading: false,
      }));
    }
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
                <div className="h-full flex flex-col bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-3xl border border-[hsl(var(--border)/0.4)] rounded-[20px] p-5 shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(0_0%_0%/0.08)] hover:border-primary/20 transition-all duration-300 group">
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

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnalyzeToken(token)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[11px] font-display font-semibold transition-all"
                    >
                      <Sparkles size={11} />
                      Analyze
                    </motion.button>

                    {token.website && (
                      <a
                        href={token.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/60 border border-[hsl(var(--border)/0.3)] text-muted-foreground hover:text-foreground text-[11px] font-display font-semibold transition-all"
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

      <AnimatePresence>
        {analysisModal && selectedToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setAnalysisModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-full md:max-w-2xl md:rounded-[28px] rounded-t-[28px] bg-card border border-[hsl(var(--border)/0.4)] shadow-2xl max-h-[80vh] md:max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-[hsl(var(--border)/0.3)] px-5 md:px-8 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground">
                    {selectedToken.symbol}
                  </h3>
                  <p className="text-xs text-muted-foreground/60">{selectedToken.name}</p>
                </div>
                <button
                  onClick={() => setAnalysisModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 md:px-8 py-6 space-y-6">
                {analysis.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader size={24} className="text-primary" />
                    </motion.div>
                    <p className="mt-4 text-sm text-muted-foreground">Analyzing token...</p>
                  </div>
                ) : analysis.error ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-5 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="font-display font-semibold text-destructive">{analysis.error}</p>
                        <p className="text-sm text-muted-foreground/80 mt-1">
                          This token has not been deployed yet or cannot be found on DexScreener.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : analysis.tokenData ? (
                  <>
                    {/* Token Stats */}
                    <GlassCard>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InnerCard>
                          <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase">
                            Price
                          </p>
                          <p className="text-lg font-display font-bold text-foreground">
                            {formatPrice(analysis.tokenData.priceUsd)}
                          </p>
                        </InnerCard>
                        <InnerCard>
                          <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase">
                            Market Cap
                          </p>
                          <p className="text-lg font-display font-bold text-foreground">
                            {formatLargeNumber(analysis.tokenData.fdv)}
                          </p>
                        </InnerCard>
                        <InnerCard>
                          <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase">
                            Liquidity
                          </p>
                          <p className="text-lg font-display font-bold text-foreground">
                            {formatLargeNumber(analysis.tokenData.liquidity)}
                          </p>
                        </InnerCard>
                      </div>
                    </GlassCard>

                    {/* Security Data */}
                    {analysis.securityData && (
                      <GlassCard>
                        <h4 className="font-display font-semibold text-foreground mb-4">Security</h4>
                        <div className="space-y-2">
                          {Object.entries(analysis.securityData).map(([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-b-0"
                            >
                              <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                              <span className="font-display font-semibold text-foreground">
                                {typeof value === "boolean" ? (value ? "✓" : "✗") : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}

                    {/* AI Analysis */}
                    {analysis.aiAnalysis && (
                      <GlassCard glow>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-7 h-7 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
                            <Sparkles size={13} className="text-primary" />
                          </div>
                          <h4 className="font-display font-semibold text-foreground">AI Analysis</h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-sm font-display font-semibold text-foreground mb-2">
                              Summary
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {analysis.aiAnalysis.summary}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-display font-semibold text-foreground mb-2">
                              Risk Level
                            </h5>
                            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-display font-semibold ${
                              analysis.aiAnalysis.riskLevel === "Very Low" ? "bg-green-500/10 text-green-500" :
                              analysis.aiAnalysis.riskLevel === "Low" ? "bg-green-500/10 text-green-500" :
                              analysis.aiAnalysis.riskLevel === "Medium" ? "bg-yellow-500/10 text-yellow-500" :
                              analysis.aiAnalysis.riskLevel === "High" ? "bg-orange-500/10 text-orange-500" :
                              "bg-red-500/10 text-red-500"
                            }`}>
                              {analysis.aiAnalysis.riskLevel}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-display font-semibold text-foreground mb-2">
                              Key Points
                            </h5>
                            <ul className="space-y-1">
                              {analysis.aiAnalysis.keyPoints?.map((point: string, idx: number) => (
                                <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                                  <span className="text-primary shrink-0">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-display font-semibold text-foreground mb-2">
                              Recommendation
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {analysis.aiAnalysis.recommendation}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    )}
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
