import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, Clock, DollarSign, BarChart3, Droplets, TrendingUp,
  Percent, Activity, Globe, FileText, MessageCircle, ExternalLink,
  ChevronDown, Search, Sparkles, Wallet
} from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.webp";
import WalletConnectModal, { truncateAddress, type WalletType } from "@/components/WalletConnectModal";

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
    { name: "Website", icon: Globe },
    { name: "Docs", icon: FileText },
    { name: "X (Twitter)", icon: ExternalLink },
    { name: "Telegram", icon: MessageCircle },
    { name: "Discord", icon: MessageCircle },
  ],
  liquidityPool: "49.44%",
  rugpullRisk: "Low",
  aiScore: 60,
  aiSummary: "The token operates on the Base chain with a market capitalization of $3.03M and $1.50M in liquidity. Recent trading activity indicates a prevalence of sell transactions over buys across multiple timeframes, contributing to a slightly negative price change over 24 hours.",
  keySignals: "The strongest signals include a significant imbalance where sell transactions outnumber buy transactions by a ratio of approximately 2.3:1 over the last 24 hours. This sustained selling pressure has resulted in a 1.27% price decrease over the same period, despite a positive price movement observed in the 6-hour window.",
};

/* ─── Animated Glass Card (scroll-triggered) ─── */
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] backdrop-blur-2xl p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-2.5 h-2.5 rounded-sm bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
    <span className="text-sm font-medium text-white/70 tracking-wide">{children}</span>
  </div>
);

const StatRow = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between py-3.5 border-b border-[hsl(0_0%_100%/0.06)] last:border-b-0 group hover:bg-[hsl(0_0%_100%/0.02)] -mx-3 px-3 rounded-lg transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] flex items-center justify-center group-hover:border-primary/30 transition-colors">
        <Icon size={14} className="text-primary" />
      </div>
      <div>
        <p className="text-sm text-white/80">{label}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
    <p className="text-sm font-semibold text-white font-display tracking-tight">{value}</p>
  </motion.div>
);

/* ─── Floating Particle ─── */
const FloatingOrb = ({ size, x, y, delay }: { size: number; x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/10 blur-3xl pointer-events-none"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

/* ─── Scan Line ─── */
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none z-20"
    animate={{ top: ["0%", "100%"] }}
    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
  />
);

/* ─── Main Dashboard ─── */
const Dashboard = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [devWallet, setDevWallet] = useState("");
  const [includeDevWallet, setIncludeDevWallet] = useState(false);
  const [chain, setChain] = useState<"Base" | "Solana">("Base");
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null);

  const handleWalletConnected = (address: string, wallet: WalletType) => {
    setConnectedAddress(address);
    setConnectedWallet(wallet);
  };

  const handleAnalyze = () => {
    if (!tokenAddress) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-surface-dark text-surface-dark-foreground relative overflow-hidden">
      {/* Full-page background image */}
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(var(--surface-dark))]/60" />
      </div>

      {/* Floating orbs */}
      <FloatingOrb size={500} x="10%" y="20%" delay={0} />
      <FloatingOrb size={300} x="70%" y="60%" delay={3} />
      <FloatingOrb size={200} x="50%" y="10%" delay={5} />

      {/* Navbar */}
      <nav className="relative z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl tracking-tight text-white hover:text-white/80 transition-colors">
            inteliose™
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-white/50 hover:text-white text-sm transition-colors hidden md:block"
            >
              ← Back to Home
            </Link>
            {connectedAddress ? (
              <button className="bg-[hsl(0_0%_100%/0.06)] backdrop-blur-md border border-primary/20 text-white px-5 py-2 rounded-full text-sm transition-all font-display flex items-center gap-2 shadow-[0_0_15px_hsl(var(--primary)/0.1)]">
                <Wallet size={14} className="text-primary" />
                {truncateAddress(connectedAddress)}
              </button>
            ) : (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="bg-[hsl(0_0%_100%/0.06)] backdrop-blur-md border border-[hsl(0_0%_100%/0.1)] text-white px-5 py-2 rounded-full text-sm hover:bg-[hsl(0_0%_100%/0.1)] hover:border-primary/20 transition-all font-display flex items-center gap-2"
              >
                <Wallet size={14} />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.08)] to-transparent" />
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* ─── Input Hero Card ─── */}
        <GlassCard className="relative overflow-hidden">
          <ScanLine />
          {/* Gradient accent */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/[0.04] to-transparent pointer-events-none rounded-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-primary/[0.06] blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-primary font-display font-semibold mb-3 tracking-wide"
                >
                  DYOR Intelligence
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-display font-medium tracking-tighter text-white leading-[1.1] mb-3"
                >
                  One input → instant intelligence.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/40 text-sm max-w-lg"
                >
                  Paste a token address and get a plain-English verdict + what to do next.
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setChain(chain === "Base" ? "Solana" : "Base")}
                className="flex items-center gap-2 bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.12)] rounded-full px-5 py-2.5 text-sm text-white/70 hover:text-white hover:border-[hsl(0_0%_100%/0.2)] transition-all shrink-0 font-display"
              >
                Chain: <span className="font-bold text-white">{chain}</span>
                <ChevronDown size={14} />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-white/40 mb-2 block font-display tracking-wide">
                  Paste {chain} Token Address (0x...)
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.1)] rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all text-sm font-display"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs text-white/40 mb-2 block font-display tracking-wide">
                    Dev wallet (optional, improves optics)
                  </label>
                  <input
                    type="text"
                    value={devWallet}
                    onChange={(e) => setDevWallet(e.target.value)}
                    placeholder="Dev wallet address"
                    className="w-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.1)] rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all text-sm font-display"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 40px hsl(240 100% 50% / 0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-primary via-primary/90 to-blue-700 text-primary-foreground px-8 py-4 rounded-2xl text-sm font-display font-semibold flex items-center gap-2.5 transition-all disabled:opacity-50 whitespace-nowrap border border-primary/30 shadow-[0_0_25px_hsl(var(--primary)/0.15)]"
                  >
                    {isAnalyzing ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Search size={16} />
                        </motion.div>
                        Analyzing...
                      </>
                    ) : (
                      <>Analyze Token <ArrowRight size={16} /></>
                    )}
                  </motion.button>

                  <label className="flex items-center gap-2.5 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.1)] rounded-2xl px-5 py-3.5 text-sm text-white/60 whitespace-nowrap cursor-pointer hover:text-white hover:border-[hsl(0_0%_100%/0.2)] transition-all font-display">
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
            </motion.div>
          </div>
        </GlassCard>

        {/* ─── Analysis Results ─── */}
        <AnimatePresence>
          {analyzed && (
            <div className="space-y-6">

              {/* Token Overview */}
              <GlassCard>
                <SectionLabel>Token Overview</SectionLabel>
                <h2 className="text-3xl font-display font-medium tracking-tighter text-white mb-1">
                  {MOCK_TOKEN.name} <span className="text-white/40 font-normal">({MOCK_TOKEN.symbol})</span>
                </h2>
                <p className="text-sm text-white/30 mb-8">Quick facts + instant risk signal.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Quick Facts */}
                  <div className="md:col-span-2 bg-[hsl(0_0%_100%/0.03)] rounded-2xl border border-[hsl(0_0%_100%/0.06)] p-5">
                    <p className="text-[11px] text-white/40 font-display font-semibold uppercase tracking-widest mb-4">Quick facts</p>
                    <StatRow icon={Clock} label="Age since launch" value={MOCK_TOKEN.age} />
                    <StatRow icon={DollarSign} label="Current price (USD)" value={MOCK_TOKEN.price} />
                    <StatRow icon={BarChart3} label="Volume (24h)" value={MOCK_TOKEN.volume24h} />
                    <StatRow icon={Droplets} label="Liquidity" value={MOCK_TOKEN.liquidity} />
                    <StatRow icon={TrendingUp} label="Market cap" value={MOCK_TOKEN.marketCap} />
                    <StatRow icon={Percent} label="Liquidity / Market cap" value={MOCK_TOKEN.liqMarketCapRatio} sub="Lower % usually means higher volatility risk." />
                    <StatRow icon={Activity} label="Buy/Sell (1h)" value={MOCK_TOKEN.buySell1h} sub="Helps spot sell pressure early." />
                  </div>

                  {/* Social Links */}
                  <div className="bg-[hsl(0_0%_100%/0.03)] rounded-2xl border border-[hsl(0_0%_100%/0.06)] p-5">
                    <p className="text-[11px] text-white/40 font-display font-semibold uppercase tracking-widest mb-4">Social links</p>
                    <div className="space-y-1">
                      {MOCK_TOKEN.socials.map((s) => (
                        <div key={s.name} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.04)] transition-all group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <s.icon size={14} className="text-white/40 group-hover:text-primary transition-colors" />
                            <span className="text-sm text-white/70 group-hover:text-white transition-colors">{s.name}</span>
                          </div>
                          <ExternalLink size={12} className="text-primary/50 group-hover:text-primary transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-3 mt-6">
                  {[
                    { label: "Mint Authority", value: MOCK_TOKEN.mintAuthority, dot: true },
                    { label: "Liquidity supply", value: MOCK_TOKEN.liquiditySupply },
                  ].map((badge, i) => (
                    <motion.div
                      key={badge.label}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200 }}
                      className="bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-2xl px-5 py-3.5"
                    >
                      <p className="text-[11px] text-white/40 mb-1 font-display">{badge.label}</p>
                      <div className="flex items-center gap-2">
                        {badge.dot && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
                        <span className="text-sm font-display font-semibold text-white">{badge.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              {/* Holder Distribution */}
              <GlassCard>
                <SectionLabel>Holder Distribution (Base)</SectionLabel>
                <p className="text-sm text-white/30 leading-relaxed">
                  Base holder distribution and clustering is being added next. For now, Base DYOR focuses on market + liquidity telemetry.
                </p>
              </GlassCard>

              {/* Liquidity & Risk */}
              <GlassCard>
                <SectionLabel>Liquidity & Death-Spiral Risk</SectionLabel>
                <p className="text-sm text-white/30 mb-6">Liquidity intelligence + stress simulation.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] rounded-2xl px-6 py-5">
                    <p className="text-[11px] text-white/40 mb-1.5 font-display uppercase tracking-widest">Liquidity Pool</p>
                    <p className="text-2xl font-display font-bold text-white tracking-tight">{MOCK_TOKEN.liquidityPool}</p>
                  </div>
                  <div className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] rounded-2xl px-6 py-5">
                    <p className="text-[11px] text-white/40 mb-1.5 font-display uppercase tracking-widest">Sudden Rugpull Risk</p>
                    <p className="text-2xl font-display font-bold text-primary tracking-tight">{MOCK_TOKEN.rugpullRisk}</p>
                    <p className="text-[11px] text-white/20 mt-1.5">Heuristic from liquidity ratio (will improve with LP data).</p>
                  </div>
                </div>
              </GlassCard>

              {/* Behavioral Intelligence */}
              <GlassCard>
                <SectionLabel>Behavioral Intelligence (The Alpha)</SectionLabel>
                <div className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] rounded-2xl px-6 py-5 inline-block">
                  <p className="text-[11px] text-white/40 mb-1.5 font-display uppercase tracking-widest">Buy/Sell imbalance (1h)</p>
                  <p className="text-2xl font-display font-bold text-white tracking-tight">{MOCK_TOKEN.buySell1h}</p>
                </div>
              </GlassCard>

              {/* AI Verdict */}
              <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.04] to-transparent pointer-events-none rounded-3xl" />
                <ScanLine />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-[11px] text-white/40 mb-1.5 font-display uppercase tracking-widest">Step 3: AI Verdict & Recommendation</p>
                      <h3 className="text-2xl font-display font-medium tracking-tighter text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" />
                        Final Intelligence Summary
                      </h3>
                      <p className="text-sm text-white/30 mt-1">AI verdict based on token telemetry.</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      className="border border-primary/30 bg-primary/10 rounded-full px-5 py-2 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                    >
                      <span className="text-sm font-display font-bold text-primary">Score: {MOCK_TOKEN.aiScore}/100</span>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] rounded-2xl p-6 space-y-5">
                      <div>
                        <p className="text-[11px] text-white/40 font-display font-semibold mb-2.5 uppercase tracking-widest">Final Intelligence Summary</p>
                        <p className="text-sm text-white/60 leading-relaxed">{MOCK_TOKEN.aiSummary}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40 font-display font-semibold mb-2.5 uppercase tracking-widest">Key signals (Plain English)</p>
                        <p className="text-sm text-white/60 leading-relaxed">{MOCK_TOKEN.keySignals}</p>
                      </div>
                      <div className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] rounded-xl px-4 py-3">
                        <p className="text-[11px] text-white/25 italic">
                          Disclaimer: This verdict is based on telemetry + technical signals (best-effort). It is not trading advice.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <p className="text-[11px] text-white/40 font-display font-semibold uppercase tracking-widest">Bubble Map</p>
                        <div className="flex items-center gap-1.5 text-xs text-primary font-display cursor-pointer hover:text-primary/80 transition-colors">
                          Open <ExternalLink size={10} />
                        </div>
                      </div>
                      <div className="bg-[hsl(0_0%_0%/0.3)] rounded-2xl h-44 flex items-center justify-center border border-[hsl(0_0%_100%/0.06)]">
                        <div className="text-center px-6">
                          <p className="text-sm font-display font-semibold text-white mb-1.5">View supply clusters?</p>
                          <p className="text-[11px] text-white/30 mb-5 max-w-[220px] mx-auto leading-relaxed">Tap on each bubble link to view supply. Note: if cluster supply is more than 5% be cautious.</p>
                          <div className="flex gap-2.5 justify-center">
                            <button className="px-5 py-2 rounded-xl bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.1)] text-xs text-white/60 hover:text-white transition-colors font-display">
                              Cancel
                            </button>
                            <button className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-display font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
                              Proceed →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </AnimatePresence>
      </div>

      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnected={handleWalletConnected}
      />
    </div>
  );
};

export default Dashboard;
