import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Lock, ArrowRight, X, TrendingUp, Shield, Droplets, AlertTriangle,
  Clock, DollarSign, BarChart3, Percent, Activity, Globe, FileText,
  ExternalLink, MessageCircle, Sparkles, Zap
} from "lucide-react";
import { ConLaunchToken, listTokens as fetchConLaunchTokens } from "@/lib/conlaunch";
import { TokenData, fetchTokenData } from "@/lib/tokendata";
import { Skeleton } from "@/components/ui/skeleton";

// --- Reusable inner card (matches Dashboard style) ---
const InnerCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gradient-to-b from-secondary/50 to-secondary/30 rounded-[20px] border border-[hsl(var(--border)/0.4)] p-5 shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.05)] ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="flex items-center gap-2.5 mb-4">
    {Icon ? (
      <div className="w-6 h-6 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
        <Icon size={12} className="text-primary" />
      </div>
    ) : (
      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
    )}
    <span className="text-[10px] font-display font-bold text-muted-foreground/60 tracking-[0.15em] uppercase">{children}</span>
  </div>
);

const StatRow = ({ icon: Icon, label, value, sub, isLoading }: { icon: any; label: string; value: string; sub?: string, isLoading?: boolean }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-b-0 group">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-[hsl(var(--border)/0.5)] flex items-center justify-center shadow-[0_1px_0_0_hsl(0_0%_100%/0.5)_inset]">
        <Icon size={12} className="text-primary/70" />
      </div>
      <div>
        <p className="text-xs text-foreground/70">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/50 mt-0.5 max-w-[180px] leading-relaxed">{sub}</p>}
      </div>
    </div>
    {isLoading ? <Skeleton className="h-4 w-16" /> : <p className="text-xs font-semibold text-foreground font-display tracking-tight">{value}</p>}
  </div>
);

// --- Full Analysis View (fetches its own data) ---
const FullAnalysisView = ({ token, onClose }: { token: ConLaunchToken; onClose: () => void }) => {
  const [analysis, setAnalysis] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const getAnalysis = async () => {
      if (!token.address) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchTokenData(token.address, "Base"); // Assuming ConLaunch tokens are on Base
        if (isMounted) {
          setAnalysis(data);
        }
      } catch (error) {
        console.error("Failed to fetch token analysis:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    getAnalysis();
    return () => { isMounted = false; };
  }, [token.id, token.address]);

  const displayValue = (value: string | null | undefined, fallback = "N/A") => value ?? fallback;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest mb-1 font-medium">Inteliose Analysis</p>
          <h4 className="text-lg font-display font-semibold text-foreground">
            {token.name} <span className="text-muted-foreground font-normal">({token.symbol})</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{token.description}</p>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors shrink-0 ml-3"
        >
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Vault Badge */}
      {token.vault_percentage && token.vault_percentage > 0 && (
        <div className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
          <Lock size={10} /> {token.vault_percentage}% Vaulted
        </div>
      )}

      {/* Token Overview - Quick Facts */}
      <InnerCard>
        <SectionLabel icon={BarChart3}>Token Overview</SectionLabel>
        <StatRow icon={Clock} label="Age since launch" value={`${token.deployed_ago}m`} isLoading={isLoading} />
        <StatRow icon={DollarSign} label="Current price (USD)" value={displayValue(analysis?.price)} isLoading={isLoading} />
        <StatRow icon={BarChart3} label="Volume (24h)" value={displayValue(analysis?.volume24h)} isLoading={isLoading} />
        <StatRow icon={Droplets} label="Liquidity" value={displayValue(analysis?.liquidity)} isLoading={isLoading} />
        <StatRow icon={TrendingUp} label="Market cap" value={displayValue(analysis?.marketCap)} isLoading={isLoading} />
      </InnerCard>

      {/* More analysis sections can be added here, using `analysis` state */}
       <InnerCard>
        <SectionLabel icon={Sparkles}>AI Verdict & Recommendation</SectionLabel>
         <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">AI analysis not available for this token.</p>
         </div>
      </InnerCard>
    </motion.div>
  );
};

// --- Token Card ---
const TokenCard = ({ token, isActive, onAnalyze }: { token: ConLaunchToken; isActive: boolean; onAnalyze: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className={`bg-card/60 backdrop-blur-md border rounded-2xl p-5 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)] transition-all duration-300 cursor-default ${isActive ? "border-primary/40 shadow-[0_0_25px_hsl(var(--primary)/0.1)]" : "border-border"}`}
  >
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-display font-semibold text-foreground">
        {token.name} <span className="text-muted-foreground font-normal">({token.symbol})</span>
      </h4>
      {token.deployed_ago && <span className="text-xs text-muted-foreground">{token.deployed_ago}m ago</span>}
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-1">{token.description}</p>
    <div className="flex items-center justify-between">
      <div>
        {token.vault_percentage && token.vault_percentage > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
            <Lock size={10} /> {token.vault_percentage}% Vaulted
          </span>
        )}
      </div>
      <button
        onClick={onAnalyze}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive ? "bg-foreground text-background" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
      >
        {isActive ? "Viewing" : "Analyze"} <ArrowRight size={12} />
      </button>
    </div>
  </motion.div>
);

// --- Main Section ---
const ConLaunchLiveSection = () => {
  const [tokens, setTokens] = useState<ConLaunchToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedToken, setExpandedToken] = useState<ConLaunchToken | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const live = await fetchConLaunchTokens(1, 8);
        if (mounted && live && live.length) {
          setTokens(live);
        }
      } catch (e) {
        console.error("Failed to load ConLaunch tokens:", e);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAnalyze = useCallback((token: ConLaunchToken) => {
    setExpandedToken(token);
  }, []);

  const renderSkeletons = () => (
    Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-card/60 backdrop-blur-md border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-7 w-28" />
        </div>
      </div>
    ))
  );

  return (
    <section id="conlaunch-live" className="pt-4">
      {/* Section Header */}
      <div className="flex justify-between items-start border-b border-border pb-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tighter text-foreground">
            ConLaunch Live
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time intelligence on agent-deployed tokens.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{tokens.length}</span> tokens live
          </span>
        </div>
      </div>

      {/* Feed + Analysis */}
      <LayoutGroup>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Token Feed Column */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {isLoading ? renderSkeletons() : tokens.map((token) => (
                <TokenCard
                  key={token.id}
                  token={token}
                  isActive={expandedToken?.id === token.id}
                  onAnalyze={() => handleAnalyze(token)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Full Analysis Panel */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8 bg-card/60 backdrop-blur-md border border-border rounded-2xl min-h-[500px] overflow-hidden">
              <AnimatePresence mode="wait">
                {expandedToken ? (
                  <FullAnalysisView
                    key={expandedToken.id}
                    token={expandedToken}
                    onClose={() => setExpandedToken(null)}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[500px] text-center px-8"
                  >
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <TrendingUp size={20} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-display text-muted-foreground">
                      Select a token to view its<br />full Inteliose analysis
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </LayoutGroup>

      {/* Mobile Analysis Modal */}
      <AnimatePresence>
        {expandedToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setExpandedToken(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full bg-card border-t border-border rounded-t-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
              <FullAnalysisView token={expandedToken} onClose={() => setExpandedToken(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ConLaunchLiveSection;
