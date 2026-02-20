import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Lock, ArrowRight, X, TrendingUp, Shield, Droplets, AlertTriangle } from "lucide-react";

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

// --- Analysis Mock ---
const AnalysisView = ({ token, onClose }: { token: MockToken; onClose: () => void }) => {
  const scores = [
    { label: "Price Stability", value: Math.floor(Math.random() * 40) + 50, icon: TrendingUp },
    { label: "Liquidity Depth", value: Math.floor(Math.random() * 30) + 40, icon: Droplets },
    { label: "Security Score", value: Math.floor(Math.random() * 25) + 65, icon: Shield },
    { label: "Risk Level", value: Math.floor(Math.random() * 50) + 20, icon: AlertTriangle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest mb-1 font-medium">Inteliose Analysis</p>
          <h4 className="text-lg font-display font-semibold text-foreground">
            {token.name} <span className="text-muted-foreground">({token.symbol})</span>
          </h4>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
        >
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {scores.map((s) => (
          <div key={s.label} className="bg-secondary/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-display font-semibold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground mb-1">/100</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary/40 rounded-xl p-4">
        <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">AI Verdict</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {token.name} shows {scores[2].value > 70 ? "strong" : "moderate"} security fundamentals with {scores[1].value > 50 ? "adequate" : "limited"} liquidity depth.
          {token.vault_percentage > 0
            ? ` The ${token.vault_percentage}% vaulted supply adds a layer of holder confidence.`
            : " No vaulted supply detected — monitor early holder behavior closely."}
          {" "}Further monitoring recommended before commitment.
        </p>
      </div>
    </motion.div>
  );
};

// --- Token Card ---
const TokenCard = ({ token, onAnalyze }: { token: MockToken; onAnalyze: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)] transition-all duration-300 cursor-default"
  >
    {/* Top Row */}
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-display font-semibold text-foreground">
        {token.name} <span className="text-muted-foreground font-normal">({token.symbol})</span>
      </h4>
      <span className="text-xs text-muted-foreground">{token.deployed_ago}m ago</span>
    </div>
    {/* Description */}
    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-1">{token.description}</p>
    {/* Bottom Row */}
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
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-medium hover:bg-primary/90 transition-colors"
      >
        Analyze <ArrowRight size={12} />
      </button>
    </div>
  </motion.div>
);

// --- Main Section ---
const ConLaunchLiveSection = () => {
  const [tokens, setTokens] = useState<MockToken[]>(initialTokens);
  const [todayCount, setTodayCount] = useState(127);
  const [expandedToken, setExpandedToken] = useState<MockToken | null>(null);

  // Simulate live feed
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
    <section id="conlaunch-live" className="pt-12">
      {/* Section Header */}
      <div className="flex justify-between items-start border-b border-border pb-4 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-sm text-foreground">02</span>
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tighter text-foreground">
              ConLaunch Live
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Real-time intelligence on agent-deployed tokens.</p>
          </div>
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

      {/* Feed */}
      <LayoutGroup>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Token Feed Column */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tokens.map((token) => (
                <TokenCard key={token.id} token={token} onAnalyze={() => handleAnalyze(token)} />
              ))}
            </AnimatePresence>
          </div>

          {/* Analysis Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-8 bg-card/60 backdrop-blur-md border border-border rounded-2xl min-h-[400px] overflow-hidden">
              <AnimatePresence mode="wait">
                {expandedToken ? (
                  <AnalysisView
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
                    className="flex flex-col items-center justify-center h-[400px] text-center px-8"
                  >
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <TrendingUp size={20} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select a token to view its<br />Inteliose analysis
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
              className="w-full bg-card border-t border-border rounded-t-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
              <AnalysisView token={expandedToken} onClose={() => setExpandedToken(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ConLaunchLiveSection;
