import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Lock, ArrowRight, X, TrendingUp, Shield, Droplets, AlertTriangle,
  Clock, DollarSign, BarChart3, Percent, Activity, Globe, FileText,
  ExternalLink, MessageCircle, Sparkles, Zap
} from "lucide-react";
import { ConLaunchToken, listTokens as fetchClawnchTokens, getTokenAnalytics } from "@/lib/conlaunch";
import { fetchTokenDetailsByAddress } from "@/lib/dexscreener";
import { TokenData, fetchTokenData, generateFounderAIAnalysis, fetchSecurityScan, generateAIAnalysis, fetchMintAuthority, fetchHolderDistribution, type AIAnalysis, type HolderDistribution } from "@/lib/tokendata";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Copy } from "lucide-react";

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
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [quickIntel, setQuickIntel] = useState<any | null>(null);
  const [aiAnalysisDetails, setAiAnalysisDetails] = useState<AIAnalysis | null>(null);
  const [holders, setHolders] = useState<HolderDistribution | null>(null);
  const [mintAuthority, setMintAuthority] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Default chain for Clawn.ch tokens (component scope so JSX can reference it)
  const chain: "Base" | "Solana" = "Base";

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    let isMounted = true;
    const getAnalysis = async () => {
      // Clawn.ch tokens are on Base chain (using component-level `chain`)

      if (!token.address) {
        setIsLoading(false);
        return;
      }
  setIsLoading(true);
  setAiLoading(true);

      try {
        // Fetch real token data from APIs (prefer DexScreener for Base tokens)
        // Use fetchTokenDetailsByAddress to enrich Clawn.ch token info
        let fetchedTokenData: TokenData | null = null;
        try {
          const ds = await fetchTokenDetailsByAddress(token.address || "", "base");
          if (ds) {
            fetchedTokenData = {
              name: ds.name || ds.symbol || "Unknown",
              symbol: ds.symbol || "???",
              price: ds.priceUsd ? `$${parseFloat(String(ds.priceUsd)).toFixed(8)}` : null,
              volume24h: ds.volume24h ? `$${(ds.volume24h / 1e6).toFixed(2)}M` : null,
              liquidity: ds.liquidity ? `$${(ds.liquidity / 1e6).toFixed(2)}M` : null,
              marketCap: ds.marketCap ? `$${(ds.marketCap / 1e6).toFixed(2)}M` : null,
              holders: null,
            };
          } else {
            fetchedTokenData = await fetchTokenData(token.address, chain);
          }
        } catch (e) {
          // Fallback to generic fetchTokenData on error
          fetchedTokenData = await fetchTokenData(token.address, chain);
        }
        if (isMounted) {
          setTokenData(fetchedTokenData);
        }
        
        // Fetch REAL security checks with real-time RPC data
        const securityData = await fetchSecurityScan(token.address, chain);
        if (isMounted) {
          setQuickIntel(securityData);
        }

        // Clawn.ch tokens are on Base chain, so holder distribution and mint authority will be null
        // These are only for Solana tokens
        if (isMounted) {
          setHolders(null);
          setMintAuthority(null);
        }

        // Generate REAL AI analysis using Gemini API with fresh data
        if (fetchedTokenData && securityData) {
          const analysis = await generateAIAnalysis(
            fetchedTokenData.name,
            fetchedTokenData.symbol,
            fetchedTokenData,
            securityData,
            chain
          );
          if (isMounted) {
            setAiAnalysisDetails(analysis);
          }
        }
      } catch (error) {
        console.error("Failed to fetch token analysis:", error);
        if (isMounted) {
          setTokenData(null);
          setQuickIntel(null);
          setAiAnalysisDetails(null);
          setHolders(null);
          setMintAuthority(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setAiLoading(false);
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
          <p className="text-xs text-primary uppercase tracking-widest mb-1 font-medium">Clawnch Analysis</p>
          <h4 className="text-lg font-display font-semibold text-foreground">
            {token.name} <span className="text-muted-foreground font-normal">({token.symbol})</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{token.description}</p>
          {token.agent && (
            <p className="text-xs text-primary/70 mt-2">🤖 Agent: <span className="font-medium">{token.agent}</span></p>
          )}
          {token.source && (
            <p className="text-xs text-muted-foreground/70 mt-1">Launched on: <span className="capitalize font-medium">{token.source}</span></p>
          )}
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors shrink-0 ml-3"
        >
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Contract Address */}
      {token.address && (
        <div className="inline-flex items-center gap-2 text-xs bg-secondary/50 px-3 py-2 rounded-lg font-mono">
          <span className="text-muted-foreground/70">CA:</span>
          <span className="text-foreground/80 truncate max-w-[150px]">{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(token.address!);
              alert("Contract address copied!");
            }}
            className="text-primary/70 hover:text-primary transition ml-1"
          >
            📋
          </button>
        </div>
      )}

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
        <StatRow icon={DollarSign} label="Current price (USD)" value={displayValue(tokenData?.price)} isLoading={isLoading} />
        <StatRow icon={BarChart3} label="Volume (24h)" value={displayValue(tokenData?.volume24h)} isLoading={isLoading} />
        <StatRow icon={Droplets} label="Liquidity" value={displayValue(tokenData?.liquidity)} isLoading={isLoading} />
        <StatRow icon={TrendingUp} label="Market cap" value={displayValue(tokenData?.marketCap)} isLoading={isLoading} />
        {mintAuthority && (
          <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-b-0 group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-[hsl(var(--border)/0.5)] flex items-center justify-center shadow-[0_1px_0_0_hsl(0_0%_100%/0.5)_inset]">
                <Shield size={12} className="text-primary/70" />
              </div>
              <p className="text-xs text-foreground/70">Mint Authority</p>
            </div>
            <p className="text-xs font-semibold text-foreground font-display tracking-tight">{mintAuthority}</p>
          </div>
        )}
      </InnerCard>

      {/* Go+ Security Checks */}
      <InnerCard>
        <SectionLabel icon={Shield}>Go+ Security Checks</SectionLabel>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : quickIntel ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {[
                ["Hidden owner", quickIntel.hiddenOwner ? "⚠️ Yes" : "✅ No", quickIntel.hiddenOwner],
                ["Obfuscated address", quickIntel.obfuscatedAddress ? "⚠️ Yes" : "✅ No", quickIntel.obfuscatedAddress],
                ["Suspicious functions", quickIntel.suspiciousFunctions ? "⚠️ Yes" : "✅ No", quickIntel.suspiciousFunctions],
                ["Proxy contract", quickIntel.proxyContract ? "⚠️ Yes" : "✅ No", quickIntel.proxyContract],
                ["Mintable", quickIntel.mintable ? "⚠️ Yes" : "✅ No", quickIntel.mintable],
                ["Transfer pausable", quickIntel.transferPausable ? "⚠️ Yes" : "✅ No", quickIntel.transferPausable],
                ["Trading cooldown", quickIntel.tradingCooldown ? "⚠️ Yes" : "✅ No", quickIntel.tradingCooldown],
                ["Has blacklist", quickIntel.hasBlacklist ? "⚠️ Yes" : "✅ No", quickIntel.hasBlacklist],
                ["Has whitelist", quickIntel.hasWhitelist ? "⚠️ Yes" : "✅ No", quickIntel.hasWhitelist],
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg border transition-all ${row[2] ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/10"}`}>
                  <p className="text-xs text-foreground/70">{row[0]}</p>
                  <p className={`text-xs font-semibold ${row[2] ? "text-destructive" : "text-primary"}`}>{row[1]}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {[
                ["Buy tax", quickIntel.buyTax],
                ["Sell tax", quickIntel.sellTax],
                ["Ownership renounced", (mintAuthority === "RENOUNCED" || quickIntel.ownershipRenounced === "Yes") ? "✅ YES" : (quickIntel.ownershipRenounced === "Unknown" ? "❓ Unknown" : "❌ NO")],
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/40 border border-border/30">
                  <p className="text-xs text-foreground/70">{row[0]}</p>
                  <p className="text-xs font-semibold text-foreground">{row[1]}</p>
                </div>
              ))}
              {quickIntel.ownerAddress && quickIntel.ownerAddress !== "Unknown" && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/40 border border-border/30">
                  <p className="text-xs text-foreground/70">Owner address</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-foreground">{quickIntel.ownerAddress.slice(0, 10)}...{quickIntel.ownerAddress.slice(-4)}</p>
                    <button
                      onClick={() => handleCopyAddress(quickIntel.ownerAddress)}
                      className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress === quickIntel.ownerAddress ? (
                        <Check size={12} className="text-primary" />
                      ) : (
                        <Copy size={12} className="text-muted-foreground/60 hover:text-primary" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60">No security checks available for this token.</p>
        )}
      </InnerCard>

      {/* Holder Distribution - Only for Solana (Clawn.ch is Base, so this won't display) */}
      {false && holders && holders.topHolders && holders.topHolders.length > 0 && (
        <InnerCard>
          <SectionLabel icon={Activity}>Holder Distribution (Solana)</SectionLabel>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground/60 mb-4">Top 20 holders (excluding dev wallet)</p>
            {holders.topHolders.map((holder, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2 hover:bg-secondary/20 rounded-lg transition-colors">
                <div className="flex items-center gap-2 min-w-[150px]">
                  <span className="text-xs text-muted-foreground/70 truncate">
                    {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                  </span>
                  <button
                    onClick={() => handleCopyAddress(holder.address)}
                    className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    {copiedAddress === holder.address ? (
                      <Check size={12} className="text-primary" />
                    ) : (
                      <Copy size={12} className="text-muted-foreground/40 hover:text-primary" />
                    )}
                  </button>
                  <motion.a
                    href={`https://solscan.io/address/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                    title="View on Solscan"
                  >
                    <ExternalLink size={12} className="text-muted-foreground/40 hover:text-primary" />
                  </motion.a>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-1.5 bg-primary/20 rounded-full flex-1">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                      style={{ width: `${Math.min(holder.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground/80 min-w-[45px] text-right">
                    {holder.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
            {holders.totalHolders && (
              <p className="text-xs text-muted-foreground/50 mt-4 pt-3 border-t border-border/30">
                Total holders: {holders.totalHolders}
              </p>
            )}
          </div>
        </InnerCard>
      )}

      {/* AI Verdict */}
      <InnerCard>
        <SectionLabel icon={Sparkles}>AI Verdict & Recommendation</SectionLabel>
        {aiLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : aiAnalysisDetails ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.15em]">Risk Assessment</p>
              <span className="text-sm font-display font-bold text-primary">Risk: {aiAnalysisDetails.riskLevel}</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">AI Analysis Summary</p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {aiAnalysisDetails.summary}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">Recommendation</p>
              <p className="text-sm text-foreground/80 font-semibold leading-relaxed">
                {aiAnalysisDetails.recommendation}
              </p>
            </div>
            {aiAnalysisDetails.keyPoints && aiAnalysisDetails.keyPoints.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">Key Points</p>
                <ul className="text-sm text-foreground/80 leading-relaxed space-y-1.5">
                  {aiAnalysisDetails.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary/60">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-gradient-to-b from-secondary/40 to-secondary/20 border border-[hsl(var(--border)/0.3)] rounded-xl px-4 py-3">
              <p className="text-[11px] text-muted-foreground/40 italic leading-relaxed">
                Disclaimer: This verdict is generated using AI + telemetry + technical signals. It is not trading advice.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Unable to generate AI analysis at this time.</p>
          </div>
        )}
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
        const live = await fetchClawnchTokens(8, 0);
        if (mounted && live && live.length) {
          setTokens(live);
        }
      } catch (e) {
        console.error("Failed to load Clawnch tokens:", e);
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
            Clawn.ch Live
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
