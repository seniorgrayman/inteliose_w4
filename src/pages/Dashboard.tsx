import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Clock, DollarSign, BarChart3, Droplets, TrendingUp, 
  Percent, Activity, Globe, FileText, MessageCircle, ExternalLink,
  Shield, AlertTriangle, Brain, ChevronDown, Menu, Search
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Mock Data ─── */
const MOCK_TOKEN = {
  name: "Moltbook",
  symbol: "MOLT",
  age: "21d",
  price: "$0.000030",
  volume24h: "$462,162",
  liquidity: "$1.50M",
  marketCap: "$3.03M",
  liqMarketCapRatio: "49.44%",
  buySell1h: "19 / 53",
  mintAuthority: "Renounced",
  liquiditySupply: "49.44%",
  socials: [
    { name: "Website", icon: Globe, available: true },
    { name: "Docs", icon: FileText, available: true },
    { name: "X (Twitter)", icon: ExternalLink, available: true },
    { name: "Telegram", icon: MessageCircle, available: true },
    { name: "Discord", icon: MessageCircle, available: true },
  ],
  liquidityPool: "49.44%",
  rugpullRisk: "Low",
  aiScore: 60,
  aiSummary: "The token operates on the Base chain with a market capitalization of $3.03M and $1.50M in liquidity. Recent trading activity indicates a prevalence of sell transactions over buys across multiple timeframes, contributing to a slightly negative price change over 24 hours.",
  keySignals: "The strongest signals include a significant imbalance where sell transactions outnumber buy transactions by a ratio of approximately 2.3:1 over the last 24 hours. This sustained selling pressure has resulted in a 1.27% price decrease over the same period, despite a positive price movement observed in the 6-hour window.",
};

/* ─── Animated Components ─── */
const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={`rounded-2xl border border-[hsl(var(--glass-border))] bg-[hsl(var(--glass-bg))] backdrop-blur-xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionLabel = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay }}
    className="flex items-center gap-2 mb-3"
  >
    <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
    <span className="text-sm font-medium text-white/80">{children}</span>
  </motion.div>
);

const StatRow = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--glass-border))] last:border-b-0 group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] flex items-center justify-center">
        <Icon size={14} className="text-primary" />
      </div>
      <div>
        <p className="text-sm text-white/90">{label}</p>
        {sub && <p className="text-xs text-white/40">{sub}</p>}
      </div>
    </div>
    <p className="text-sm font-semibold text-white font-display">{value}</p>
  </div>
);

/* ─── Main Dashboard ─── */
const Dashboard = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [devWallet, setDevWallet] = useState("");
  const [includeDevWallet, setIncludeDevWallet] = useState(false);
  const [chain, setChain] = useState<"Base" | "Solana">("Base");
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!tokenAddress) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface-dark text-surface-dark-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-[hsl(var(--glass-border))]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl tracking-tight text-white">
            inteliose™
          </Link>
          <div className="flex items-center gap-3">
            <button className="bg-[hsl(var(--glass-bg))] backdrop-blur-md border border-[hsl(var(--glass-border))] text-white px-5 py-2 rounded-full text-sm hover:bg-[hsl(0_0%_100%/0.1)] transition-all">
              Wallet Connect (Solana)
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        
        {/* Input Section */}
        <GlassCard className="mb-8 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none rounded-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-primary font-medium mb-2">DYOR Intelligence</p>
                <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mb-2">
                  One input → instant intelligence.
                </h1>
                <p className="text-white/50 text-sm">
                  Paste a token address and get a plain-English verdict + what to do next.
                </p>
              </div>
              <button
                onClick={() => setChain(chain === "Base" ? "Solana" : "Base")}
                className="flex items-center gap-2 bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-full px-4 py-2 text-sm text-white/80 hover:text-white transition-colors shrink-0"
              >
                Chain: <span className="font-semibold text-white">{chain}</span>
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">
                  Paste {chain} Token Address (0x...)
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs text-white/50 mb-1.5 block">
                    Dev wallet (optional, improves optics)
                  </label>
                  <input
                    type="text"
                    value={devWallet}
                    onChange={(e) => setDevWallet(e.target.value)}
                    placeholder="Dev wallet address"
                    className="w-full bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-primary-foreground px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(0,0,255,0.3)] transition-all disabled:opacity-60 whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Search size={16} />
                      </motion.div>
                    ) : (
                      <>Analyze Token <ArrowRight size={16} /></>
                    )}
                  </motion.button>

                  <label className="flex items-center gap-2 bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-4 py-3 text-sm text-white/70 whitespace-nowrap cursor-pointer hover:text-white transition-colors">
                    Include Dev Wallet Behavior
                    <input
                      type="checkbox"
                      checked={includeDevWallet}
                      onChange={(e) => setIncludeDevWallet(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Analysis Results */}
        <AnimatePresence>
          {analyzed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Token Overview */}
              <GlassCard delay={0.1}>
                <SectionLabel delay={0.15}>Token Overview</SectionLabel>
                <h2 className="text-2xl font-display font-bold text-white mb-1">
                  {MOCK_TOKEN.name} <span className="text-white/50">({MOCK_TOKEN.symbol})</span>
                </h2>
                <p className="text-sm text-white/40 mb-6">Quick facts + instant risk signal.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quick Facts */}
                  <div className="md:col-span-2 bg-[hsl(var(--glass-bg))] rounded-xl border border-[hsl(var(--glass-border))] p-5">
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-4">Quick facts</p>
                    <StatRow icon={Clock} label="Age since launch" value={MOCK_TOKEN.age} />
                    <StatRow icon={DollarSign} label="Current price (USD)" value={MOCK_TOKEN.price} />
                    <StatRow icon={BarChart3} label="Volume (24h)" value={MOCK_TOKEN.volume24h} />
                    <StatRow icon={Droplets} label="Liquidity" value={MOCK_TOKEN.liquidity} />
                    <StatRow icon={TrendingUp} label="Market cap" value={MOCK_TOKEN.marketCap} />
                    <StatRow icon={Percent} label="Liquidity / Market cap" value={MOCK_TOKEN.liqMarketCapRatio} sub="Lower % usually means higher volatility risk." />
                    <StatRow icon={Activity} label="Buy/Sell (1h)" value={MOCK_TOKEN.buySell1h} sub="Helps spot sell pressure early." />
                  </div>

                  {/* Social Links */}
                  <div className="bg-[hsl(var(--glass-bg))] rounded-xl border border-[hsl(var(--glass-border))] p-5">
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-4">Social links</p>
                    <div className="space-y-2">
                      {MOCK_TOKEN.socials.map((s) => (
                        <div key={s.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[hsl(var(--glass-bg))] transition-colors group cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <s.icon size={14} className="text-white/50 group-hover:text-primary transition-colors" />
                            <span className="text-sm text-white/80">{s.name}</span>
                          </div>
                          <ExternalLink size={12} className="text-primary/60" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-3 mt-5">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-5 py-3"
                  >
                    <p className="text-xs text-white/50 mb-1">Mint Authority</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold text-white">{MOCK_TOKEN.mintAuthority}</span>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-5 py-3"
                  >
                    <p className="text-xs text-white/50 mb-1">Liquidity supply</p>
                    <span className="text-sm font-semibold text-white">{MOCK_TOKEN.liquiditySupply}</span>
                  </motion.div>
                </div>
              </GlassCard>

              {/* Holder Distribution */}
              <GlassCard delay={0.2}>
                <SectionLabel delay={0.25}>Holder Distribution (Base)</SectionLabel>
                <p className="text-sm text-white/40">
                  Base holder distribution and clustering is being added next. For now, Base DYOR focuses on market + liquidity telemetry.
                </p>
              </GlassCard>

              {/* Liquidity & Risk */}
              <GlassCard delay={0.3}>
                <SectionLabel delay={0.35}>Liquidity & Death-Spiral Risk</SectionLabel>
                <p className="text-sm text-white/40 mb-5">Liquidity intelligence + stress simulation.</p>
                <div className="flex gap-4">
                  <div className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-5 py-4 flex-1">
                    <p className="text-xs text-white/50 mb-1">Liquidity Pool</p>
                    <p className="text-lg font-display font-bold text-white">{MOCK_TOKEN.liquidityPool}</p>
                  </div>
                  <div className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-5 py-4 flex-1">
                    <p className="text-xs text-white/50 mb-1">Sudden Rugpull Risk</p>
                    <p className="text-lg font-display font-bold text-emerald-400">{MOCK_TOKEN.rugpullRisk}</p>
                    <p className="text-xs text-white/30 mt-1">Heuristic from liquidity ratio (will improve with LP data).</p>
                  </div>
                </div>
              </GlassCard>

              {/* Behavioral Intelligence */}
              <GlassCard delay={0.4}>
                <SectionLabel delay={0.45}>Behavioral Intelligence (The Alpha)</SectionLabel>
                <div className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl px-5 py-4 inline-block">
                  <p className="text-xs text-white/50 mb-1">Buy/Sell imbalance (1h)</p>
                  <p className="text-lg font-display font-bold text-white">{MOCK_TOKEN.buySell1h}</p>
                </div>
              </GlassCard>

              {/* AI Verdict */}
              <GlassCard delay={0.5} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-white/50 mb-1">Step 3: AI Verdict & Recommendation</p>
                      <h3 className="text-xl font-display font-bold text-white">Final Intelligence Summary</h3>
                      <p className="text-sm text-white/40">AI verdict based on token telemetry.</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                      className="border border-primary/40 bg-primary/10 rounded-full px-4 py-1.5"
                    >
                      <span className="text-sm font-display font-bold text-primary">Score: {MOCK_TOKEN.aiScore}/100</span>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl p-5 space-y-4">
                      <div>
                        <p className="text-xs text-white/50 font-semibold mb-2">Final Intelligence Summary</p>
                        <p className="text-sm text-white/70 leading-relaxed">{MOCK_TOKEN.aiSummary}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 font-semibold mb-2">Key signals (Plain English)</p>
                        <p className="text-sm text-white/70 leading-relaxed">{MOCK_TOKEN.keySignals}</p>
                      </div>
                      <div className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-lg px-4 py-2.5">
                        <p className="text-xs text-white/40 italic">
                          Disclaimer: This verdict is based on telemetry + technical signals (best-effort). It is not trading advice.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-white/50 font-semibold">Bubble Map</p>
                        <div className="flex items-center gap-1.5 text-xs text-primary">
                          Open <ExternalLink size={10} />
                        </div>
                      </div>
                      <div className="bg-surface-dark/80 rounded-xl h-40 flex items-center justify-center border border-[hsl(var(--glass-border))]">
                        <div className="text-center px-6">
                          <p className="text-sm font-semibold text-white mb-1">View supply clusters?</p>
                          <p className="text-xs text-white/40 mb-4">Tap on each bubble link to view supply. Note: if cluster supply is more than 5% be cautious.</p>
                          <div className="flex gap-2 justify-center">
                            <button className="px-4 py-1.5 rounded-lg bg-[hsl(var(--glass-bg))] border border-[hsl(var(--glass-border))] text-xs text-white/70 hover:text-white transition-colors">
                              Cancel
                            </button>
                            <button className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                              Proceed →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
