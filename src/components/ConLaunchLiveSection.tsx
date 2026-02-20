import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Lock, ArrowRight, X, TrendingUp, Shield, Droplets, AlertTriangle,
  Clock, DollarSign, BarChart3, Percent, Activity, Globe, FileText,
  ExternalLink, MessageCircle, Sparkles, Zap
} from "lucide-react";

// --- Mock Data ---
const TOKEN_NAMES = [
  { name: "Aether Agent", symbol: "AETH", desc: "Autonomous portfolio rebalancer powered by on-chain sentiment signals.", vault: 40 },
  { name: "BaseBot", symbol: "BBOT", desc: "AI-driven trading assistant for the Base L2 ecosystem.", vault: 0 },
  { name: "NeuralSwap", symbol: "NSWP", desc: "Intelligent AMM with predictive liquidity routing on Base.", vault: 25 },
  { name: "SentinelAI", symbol: "SNAI", desc: "Real-time smart contract vulnerability scanner and alerting agent.", vault: 60 },
  { name: "Catalyst", symbol: "CTLY", desc: "Multi-strategy yield optimizer with autonomous compounding.", vault: 0 },
  { name: "Axiom Protocol", symbol: "AXIO", desc: "Decentralized inference network for on-chain AI model execution.", vault: 35 },
  { name: "Oraculum", symbol: "ORCL", desc: "Hybrid oracle aggregator with built-in anomaly detection.", vault: 15 },
  { name: "Vanguard DAO", symbol: "VGRD", desc: "Community-governed security audit and insurance protocol.", vault: 50 },
  { name: "FluxMind", symbol: "FLUX", desc: "Adaptive market-making agent for low-liquidity token pairs.", vault: 0 },
  { name: "Helix AI", symbol: "HELX", desc: "Cross-chain bridge monitor with predictive fraud scoring.", vault: 70 },
];

type MockToken = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  vault_percentage: number;
  deployed_ago: number;
};

const generateToken = (): MockToken => {
  const pick = TOKEN_NAMES[Math.floor(Math.random() * TOKEN_NAMES.length)];
  return {
    id: crypto.randomUUID(),
    name: pick.name,
    symbol: pick.symbol,
    description: pick.desc,
    vault_percentage: pick.vault,
    deployed_ago: Math.floor(Math.random() * 55) + 1,
  };
};

const initialTokens = (): MockToken[] => Array.from({ length: 6 }, generateToken);

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

const StatRow = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
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
    <p className="text-xs font-semibold text-foreground font-display tracking-tight">{value}</p>
  </div>
);

// --- Generate mock analysis data for a token ---
const generateAnalysis = (token: MockToken) => {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
  const price = (Math.random() * 0.001).toFixed(6);
  const vol = rand(50, 900);
  const liq = (Math.random() * 3).toFixed(2);
  const mcap = (Math.random() * 5).toFixed(2);
  const liqRatio = rand(15, 65);
  const buys = rand(5, 40);
  const sells = rand(5, 60);
  const aiScore = rand(30, 85);

  return {
    age: `${token.deployed_ago}m`,
    price: `$${price}`,
    volume24h: `$${vol},${rand(100, 999)}`,
    liquidity: `$${liq}M`,
    marketCap: `$${mcap}M`,
    liqMarketCapRatio: `${liqRatio}%`,
    buySell1h: `${buys} / ${sells}`,
    mintAuthority: Math.random() > 0.5 ? "Renounced" : "Active",
    liquidityPool: `${liqRatio}%`,
    rugpullRisk: liqRatio > 40 ? "Low" : liqRatio > 25 ? "Medium" : "High",
    aiScore,
    aiSummary: `${token.name} operates on Base with a market cap of $${mcap}M and $${liq}M in liquidity. Trading activity shows ${sells > buys ? "sell-dominant" : "buy-dominant"} pressure with a ${buys}/${sells} buy/sell ratio in the last hour.`,
    keySignals: `${sells > buys ? `Sell transactions outnumber buys by ${(sells / buys).toFixed(1)}:1 ratio.` : `Buy transactions lead with a ${(buys / sells).toFixed(1)}:1 ratio.`} Liquidity-to-market-cap ratio sits at ${liqRatio}%, ${liqRatio > 40 ? "indicating reasonable depth." : "suggesting elevated volatility risk."}`,
    socials: [
      { name: "Website", icon: Globe },
      { name: "Docs", icon: FileText },
      { name: "X (Twitter)", icon: ExternalLink },
      { name: "Telegram", icon: MessageCircle },
    ],
  };
};

// --- Full Analysis View (mirrors Dashboard analysis) ---
const FullAnalysisView = ({ token, onClose }: { token: MockToken; onClose: () => void }) => {
  const data = useMemo(() => generateAnalysis(token), [token.id]);

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
      {token.vault_percentage > 0 && (
        <div className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
          <Lock size={10} /> {token.vault_percentage}% Vaulted
        </div>
      )}

      {/* Token Overview - Quick Facts */}
      <InnerCard>
        <SectionLabel icon={BarChart3}>Token Overview</SectionLabel>
        <StatRow icon={Clock} label="Age since launch" value={data.age} />
        <StatRow icon={DollarSign} label="Current price (USD)" value={data.price} />
        <StatRow icon={BarChart3} label="Volume (24h)" value={data.volume24h} />
        <StatRow icon={Droplets} label="Liquidity" value={data.liquidity} />
        <StatRow icon={TrendingUp} label="Market cap" value={data.marketCap} />
        <StatRow icon={Percent} label="Liquidity / Market cap" value={data.liqMarketCapRatio} sub="Lower % = higher volatility risk." />
        <StatRow icon={Activity} label="Buy/Sell (1h)" value={data.buySell1h} sub="Helps spot sell pressure early." />
      </InnerCard>

      {/* Status Badges */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-gradient-to-b from-secondary/50 to-secondary/30 border border-[hsl(var(--border)/0.4)] rounded-xl px-4 py-3 shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset]">
          <p className="text-[10px] text-muted-foreground/60 mb-1 font-display font-bold uppercase tracking-[0.15em]">Mint Authority</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${data.mintAuthority === "Renounced" ? "bg-primary" : "bg-destructive"} shadow-[0_0_8px_hsl(var(--primary)/0.5)]`} />
            <span className="text-xs font-display font-bold text-foreground">{data.mintAuthority}</span>
          </div>
        </div>
        <div className="bg-gradient-to-b from-secondary/50 to-secondary/30 border border-[hsl(var(--border)/0.4)] rounded-xl px-4 py-3 shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset]">
          <p className="text-[10px] text-muted-foreground/60 mb-1 font-display font-bold uppercase tracking-[0.15em]">Liquidity Supply</p>
          <span className="text-xs font-display font-bold text-foreground">{data.liquidityPool}</span>
        </div>
      </div>

      {/* Social Links */}
      <InnerCard>
        <SectionLabel icon={Globe}>Social Links</SectionLabel>
        <div className="space-y-0.5">
          {data.socials.map((s) => (
            <div key={s.name} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-primary/[0.03] transition-all group cursor-pointer">
              <div className="flex items-center gap-2">
                <s.icon size={12} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
                <span className="text-xs text-foreground/60 group-hover:text-foreground transition-colors">{s.name}</span>
              </div>
              <ExternalLink size={10} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </InnerCard>

      {/* Liquidity & Risk */}
      <InnerCard>
        <SectionLabel icon={Shield}>Liquidity & Death-Spiral Risk</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-b from-secondary/40 to-secondary/20 rounded-xl p-3 border border-[hsl(var(--border)/0.3)]">
            <p className="text-[10px] text-muted-foreground/60 mb-1 font-display font-bold uppercase tracking-[0.15em]">Liquidity Pool</p>
            <p className="text-xl font-display font-bold text-foreground tracking-tight">{data.liquidityPool}</p>
          </div>
          <div className="bg-gradient-to-b from-secondary/40 to-secondary/20 rounded-xl p-3 border border-[hsl(var(--border)/0.3)]">
            <p className="text-[10px] text-muted-foreground/60 mb-1 font-display font-bold uppercase tracking-[0.15em]">Rugpull Risk</p>
            <p className={`text-xl font-display font-bold tracking-tight ${data.rugpullRisk === "Low" ? "text-primary" : data.rugpullRisk === "Medium" ? "text-yellow-500" : "text-destructive"}`}>{data.rugpullRisk}</p>
          </div>
        </div>
      </InnerCard>

      {/* Behavioral Intelligence */}
      <InnerCard>
        <SectionLabel icon={Zap}>Behavioral Intelligence</SectionLabel>
        <div className="bg-gradient-to-b from-secondary/40 to-secondary/20 rounded-xl p-3 border border-[hsl(var(--border)/0.3)] inline-block">
          <p className="text-[10px] text-muted-foreground/60 mb-1 font-display font-bold uppercase tracking-[0.15em]">Buy/Sell (1h)</p>
          <p className="text-xl font-display font-bold text-foreground tracking-tight">{data.buySell1h}</p>
        </div>
      </InnerCard>

      {/* AI Verdict */}
      <InnerCard className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.03] to-transparent pointer-events-none rounded-[20px]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <SectionLabel icon={Sparkles}>AI Verdict & Recommendation</SectionLabel>
            <div className="border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 rounded-xl px-4 py-2 shadow-[0_0_15px_hsl(var(--primary)/0.08)]">
              <span className="text-xs font-display font-bold text-primary">Score: {data.aiScore}/100</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-1.5 uppercase tracking-[0.15em]">Summary</p>
              <p className="text-xs text-foreground/55 leading-relaxed">{data.aiSummary}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-1.5 uppercase tracking-[0.15em]">Key Signals</p>
              <p className="text-xs text-foreground/55 leading-relaxed">{data.keySignals}</p>
            </div>
            <div className="bg-gradient-to-b from-secondary/40 to-secondary/20 border border-[hsl(var(--border)/0.3)] rounded-lg px-3 py-2">
              <p className="text-[10px] text-muted-foreground/40 italic leading-relaxed">
                Disclaimer: This verdict is based on telemetry + technical signals (best-effort). It is not trading advice.
              </p>
            </div>
          </div>
        </div>
      </InnerCard>
    </motion.div>
  );
};

// --- Token Card ---
const TokenCard = ({ token, isActive, onAnalyze }: { token: MockToken; isActive: boolean; onAnalyze: () => void }) => (
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
      <span className="text-xs text-muted-foreground">{token.deployed_ago}m ago</span>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-1">{token.description}</p>
    <div className="flex items-center justify-between">
      <div>
        {token.vault_percentage > 0 && (
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
  const [tokens, setTokens] = useState<MockToken[]>(initialTokens);
  const [todayCount, setTodayCount] = useState(127);
  const [expandedToken, setExpandedToken] = useState<MockToken | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) => {
        const newToken = generateToken();
        const updated = [newToken, ...prev];
        return updated.slice(0, 8);
      });
      setTodayCount((c) => c + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = useCallback((token: MockToken) => {
    setExpandedToken(token);
  }, []);

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
            <span className="text-foreground font-semibold">{todayCount}</span> tokens today
          </span>
        </div>
      </div>

      {/* Feed + Analysis */}
      <LayoutGroup>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Token Feed Column */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {tokens.map((token) => (
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
