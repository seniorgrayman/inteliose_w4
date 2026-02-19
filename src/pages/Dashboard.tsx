import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, Clock, DollarSign, BarChart3, Droplets, TrendingUp,
  Percent, Activity, Globe, FileText, MessageCircle, ExternalLink,
  ChevronDown, Search, Sparkles, Wallet, Shield, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import WalletConnectModal, { truncateAddress, type WalletType } from "@/components/WalletConnectModal";
import dashboardBgVideo from "@/assets/dashboard-bg-video.mp4";

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

/* ─── Ultra Premium Glass Card with beveled edges ─── */
const GlassCard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative rounded-[28px] 
        bg-gradient-to-b from-card/80 to-card/60 
        backdrop-blur-3xl 
        border border-[hsl(var(--border)/0.4)]
        p-7 md:p-9
        shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(0_0%_0%/0.08),0_2px_8px_-2px_hsl(0_0%_0%/0.06)]
        ${glow ? 'shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(var(--primary)/0.1),0_2px_8px_-2px_hsl(0_0%_0%/0.06)]' : ''}
        ${className}
      `}
    >
      {/* Top bevel highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.8)] to-transparent rounded-t-[28px] pointer-events-none" />
      {/* Bottom bevel shadow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_0%/0.06)] to-transparent rounded-b-[28px] pointer-events-none" />
      {children}
    </motion.div>
  );
};

const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="flex items-center gap-2.5 mb-5">
    {Icon ? (
      <div className="w-7 h-7 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
        <Icon size={13} className="text-primary" />
      </div>
    ) : (
      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
    )}
    <span className="text-xs font-display font-semibold text-muted-foreground tracking-widest uppercase">{children}</span>
  </div>
);

const StatRow = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between py-3.5 border-b border-border/30 last:border-b-0 group hover:bg-primary/[0.02] -mx-3 px-3 rounded-2xl transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-[hsl(var(--border)/0.5)] flex items-center justify-center group-hover:border-primary/20 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.06)] transition-all duration-300 shadow-[0_1px_0_0_hsl(0_0%_100%/0.5)_inset,0_2px_4px_-1px_hsl(0_0%_0%/0.06)]">
        <Icon size={15} className="text-primary/70 group-hover:text-primary transition-colors" />
      </div>
      <div>
        <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5 max-w-[240px] leading-relaxed">{sub}</p>}
      </div>
    </div>
    <p className="text-sm font-semibold text-foreground font-display tracking-tight">{value}</p>
  </motion.div>
);

/* ─── Floating Orb ─── */
const FloatingOrb = ({ size, x, y, delay, color = "primary" }: { size: number; x: string; y: string; delay: number; color?: string }) => (
  <motion.div
    className={`absolute rounded-full ${color === "primary" ? "bg-primary/[0.04]" : "bg-accent/[0.06]"} blur-[120px] pointer-events-none`}
    style={{ width: size, height: size, left: x, top: y }}
    animate={{ y: [0, -25, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
    transition={{ duration: 12, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

/* ─── Premium Inner Card ─── */
const InnerCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gradient-to-b from-secondary/50 to-secondary/30 rounded-[20px] border border-[hsl(var(--border)/0.4)] p-5 shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.05)] ${className}`}>
    {children}
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          src={dashboardBgVideo}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </div>

      {/* Ambient orbs */}
      <FloatingOrb size={700} x="-10%" y="5%" delay={0} />
      <FloatingOrb size={500} x="60%" y="40%" delay={3} />
      <FloatingOrb size={350} x="30%" y="-8%" delay={6} color="accent" />
      <FloatingOrb size={400} x="80%" y="70%" delay={9} color="accent" />

      {/* Premium Navbar */}
      <nav className="relative z-50 bg-gradient-to-b from-card/70 to-card/50 backdrop-blur-2xl border-b border-[hsl(var(--border)/0.3)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl tracking-tight text-foreground hover:text-foreground/70 transition-colors">
            inteliose™
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors hidden md:block font-display">
              ← Back to Home
            </Link>
            {connectedAddress ? (
              <motion.button
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-primary/[0.06] border border-primary/15 text-foreground px-5 py-2.5 rounded-2xl text-sm transition-all font-display flex items-center gap-2 shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset,0_0_20px_hsl(var(--primary)/0.06)]"
              >
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)] animate-pulse" />
                {truncateAddress(connectedAddress)}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setWalletModalOpen(true)}
                className="bg-foreground text-background px-6 py-2.5 rounded-2xl text-sm hover:bg-foreground/90 transition-all font-display font-semibold flex items-center gap-2 shadow-[0_4px_15px_hsl(0_0%_0%/0.15),0_1px_3px_hsl(0_0%_0%/0.1)]"
              >
                <Wallet size={14} />
                Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 space-y-8">

        {/* ─── Input Hero Card ─── */}
        <GlassCard glow className="relative overflow-hidden">
          {/* Ambient glow inside card */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-primary/[0.03] blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/10 rounded-full px-4 py-1.5 mb-5"
                >
                  <Zap size={12} className="text-primary" />
                  <span className="text-xs text-primary font-display font-semibold tracking-wide">DYOR Intelligence</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-display font-medium tracking-tighter text-foreground leading-[1.05] mb-3"
                >
                  One input →<br />instant intelligence.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground text-sm max-w-lg leading-relaxed"
                >
                  Paste a token address and get a plain-English verdict + what to do next.
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setChain(chain === "Base" ? "Solana" : "Base")}
                className="flex items-center gap-2 bg-gradient-to-b from-secondary/70 to-secondary/40 border border-[hsl(var(--border)/0.5)] rounded-2xl px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-all shrink-0 font-display shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.06)]"
              >
                Chain: <span className="font-bold text-foreground">{chain}</span>
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
                <label className="text-xs text-muted-foreground mb-2 block font-display tracking-wide">
                  Paste {chain} Token Address (0x...)
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-gradient-to-b from-secondary/50 to-secondary/30 border border-[hsl(var(--border)/0.4)] rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 focus:shadow-[0_0_30px_hsl(var(--primary)/0.06),0_1px_0_0_hsl(0_0%_100%/0.4)_inset] focus:bg-card/80 transition-all text-sm font-display shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset,0_2px_4px_-1px_hsl(0_0%_0%/0.04)]"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs text-muted-foreground mb-2 block font-display tracking-wide">
                    Dev wallet (optional, improves optics)
                  </label>
                  <input
                    type="text"
                    value={devWallet}
                    onChange={(e) => setDevWallet(e.target.value)}
                    placeholder="Dev wallet address"
                    className="w-full bg-gradient-to-b from-secondary/50 to-secondary/30 border border-[hsl(var(--border)/0.4)] rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 focus:shadow-[0_0_30px_hsl(var(--primary)/0.06),0_1px_0_0_hsl(0_0%_100%/0.4)_inset] focus:bg-card/80 transition-all text-sm font-display shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset,0_2px_4px_-1px_hsl(0_0%_0%/0.04)]"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2, boxShadow: "0 12px 40px hsl(240 100% 50% / 0.25)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-sm font-display font-semibold flex items-center gap-2.5 transition-all disabled:opacity-50 whitespace-nowrap shadow-[0_6px_25px_hsl(var(--primary)/0.3),0_1px_0_0_hsl(0_0%_100%/0.15)_inset]"
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

                  <label className="flex items-center gap-2.5 bg-gradient-to-b from-secondary/50 to-secondary/30 border border-[hsl(var(--border)/0.4)] rounded-2xl px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground transition-all font-display shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset]">
                    Include Dev Wallet
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-7"
            >

              {/* Token Overview */}
              <GlassCard>
                <SectionLabel icon={BarChart3}>Token Overview</SectionLabel>
                <h2 className="text-3xl font-display font-medium tracking-tighter text-foreground mb-1">
                  {MOCK_TOKEN.name} <span className="text-muted-foreground/60 font-normal text-2xl">({MOCK_TOKEN.symbol})</span>
                </h2>
                <p className="text-sm text-muted-foreground mb-8">Quick facts + instant risk signal.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InnerCard className="md:col-span-2">
                    <p className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.15em] mb-4">Quick Facts</p>
                    <StatRow icon={Clock} label="Age since launch" value={MOCK_TOKEN.age} />
                    <StatRow icon={DollarSign} label="Current price (USD)" value={MOCK_TOKEN.price} />
                    <StatRow icon={BarChart3} label="Volume (24h)" value={MOCK_TOKEN.volume24h} />
                    <StatRow icon={Droplets} label="Liquidity" value={MOCK_TOKEN.liquidity} />
                    <StatRow icon={TrendingUp} label="Market cap" value={MOCK_TOKEN.marketCap} />
                    <StatRow icon={Percent} label="Liquidity / Market cap" value={MOCK_TOKEN.liqMarketCapRatio} sub="Lower % usually means higher volatility risk." />
                    <StatRow icon={Activity} label="Buy/Sell (1h)" value={MOCK_TOKEN.buySell1h} sub="Helps spot sell pressure early." />
                  </InnerCard>

                  <InnerCard>
                    <p className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.15em] mb-4">Social Links</p>
                    <div className="space-y-0.5">
                      {MOCK_TOKEN.socials.map((s) => (
                        <motion.div
                          key={s.name}
                          whileHover={{ x: 3 }}
                          className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-primary/[0.03] transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <s.icon size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            <span className="text-sm text-foreground/60 group-hover:text-foreground transition-colors">{s.name}</span>
                          </div>
                          <ExternalLink size={11} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        </motion.div>
                      ))}
                    </div>
                  </InnerCard>
                </div>

                {/* Status Badges */}
                <div className="flex gap-3 mt-7">
                  {[
                    { label: "Mint Authority", value: MOCK_TOKEN.mintAuthority, dot: true },
                    { label: "Liquidity supply", value: MOCK_TOKEN.liquiditySupply },
                  ].map((badge, i) => (
                    <motion.div
                      key={badge.label}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200 }}
                      className="bg-gradient-to-b from-secondary/50 to-secondary/30 border border-[hsl(var(--border)/0.4)] rounded-2xl px-5 py-4 shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.04)]"
                    >
                      <p className="text-[10px] text-muted-foreground/60 mb-1.5 font-display font-bold uppercase tracking-[0.15em]">{badge.label}</p>
                      <div className="flex items-center gap-2">
                        {badge.dot && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)] animate-pulse" />}
                        <span className="text-sm font-display font-bold text-foreground">{badge.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              {/* Holder Distribution */}
              <GlassCard>
                <SectionLabel icon={Activity}>Holder Distribution (Base)</SectionLabel>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">
                  Base holder distribution and clustering is being added next. For now, Base DYOR focuses on market + liquidity telemetry.
                </p>
              </GlassCard>

              {/* Liquidity & Risk */}
              <GlassCard>
                <SectionLabel icon={Shield}>Liquidity & Death-Spiral Risk</SectionLabel>
                <p className="text-sm text-muted-foreground/70 mb-6">Liquidity intelligence + stress simulation.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InnerCard>
                    <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Liquidity Pool</p>
                    <p className="text-3xl font-display font-bold text-foreground tracking-tight">{MOCK_TOKEN.liquidityPool}</p>
                  </InnerCard>
                  <InnerCard>
                    <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Sudden Rugpull Risk</p>
                    <p className="text-3xl font-display font-bold text-primary tracking-tight">{MOCK_TOKEN.rugpullRisk}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-2 leading-relaxed">Heuristic from liquidity ratio (will improve with LP data).</p>
                  </InnerCard>
                </div>
              </GlassCard>

              {/* Behavioral Intelligence */}
              <GlassCard>
                <SectionLabel icon={Zap}>Behavioral Intelligence (The Alpha)</SectionLabel>
                <InnerCard className="inline-block">
                  <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Buy/Sell imbalance (1h)</p>
                  <p className="text-3xl font-display font-bold text-foreground tracking-tight">{MOCK_TOKEN.buySell1h}</p>
                </InnerCard>
              </GlassCard>

              {/* AI Verdict */}
              <GlassCard glow className="relative overflow-hidden">
                {/* Ambient accent inside */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.03] to-transparent pointer-events-none rounded-[28px]" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-7">
                    <div>
                      <SectionLabel icon={Sparkles}>AI Verdict & Recommendation</SectionLabel>
                      <h3 className="text-2xl font-display font-medium tracking-tighter text-foreground flex items-center gap-2">
                        Final Intelligence Summary
                      </h3>
                      <p className="text-sm text-muted-foreground/60 mt-1">AI verdict based on token telemetry.</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      className="border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 rounded-2xl px-6 py-3 shadow-[0_0_25px_hsl(var(--primary)/0.08),0_1px_0_0_hsl(0_0%_100%/0.3)_inset]"
                    >
                      <span className="text-sm font-display font-bold text-primary">Score: {MOCK_TOKEN.aiScore}/100</span>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InnerCard className="space-y-5">
                      <div>
                        <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">Final Intelligence Summary</p>
                        <p className="text-sm text-foreground/55 leading-relaxed">{MOCK_TOKEN.aiSummary}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">Key signals (Plain English)</p>
                        <p className="text-sm text-foreground/55 leading-relaxed">{MOCK_TOKEN.keySignals}</p>
                      </div>
                      <div className="bg-gradient-to-b from-secondary/40 to-secondary/20 border border-[hsl(var(--border)/0.3)] rounded-xl px-4 py-3">
                        <p className="text-[11px] text-muted-foreground/40 italic leading-relaxed">
                          Disclaimer: This verdict is based on telemetry + technical signals (best-effort). It is not trading advice.
                        </p>
                      </div>
                    </InnerCard>

                    <InnerCard>
                      <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.15em]">Bubble Map</p>
                        <div className="flex items-center gap-1.5 text-xs text-primary font-display cursor-pointer hover:text-primary/80 transition-colors">
                          Open <ExternalLink size={10} />
                        </div>
                      </div>
                      <div className="bg-gradient-to-b from-secondary/60 to-secondary/30 rounded-2xl h-44 flex items-center justify-center border border-[hsl(var(--border)/0.3)] shadow-[0_1px_0_0_hsl(0_0%_100%/0.2)_inset]">
                        <div className="text-center px-6">
                          <p className="text-sm font-display font-semibold text-foreground mb-1.5">View supply clusters?</p>
                          <p className="text-[11px] text-muted-foreground/50 mb-5 max-w-[220px] mx-auto leading-relaxed">Tap on each bubble link to view supply. Note: if cluster supply is more than 5% be cautious.</p>
                          <div className="flex gap-2.5 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-secondary/70 to-secondary/40 border border-[hsl(var(--border)/0.4)] text-xs text-muted-foreground hover:text-foreground transition-colors font-display shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset]"
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.03, y: -1 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-display font-semibold transition-colors shadow-[0_4px_15px_hsl(var(--primary)/0.25),0_1px_0_0_hsl(0_0%_100%/0.15)_inset]"
                            >
                              Proceed →
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </InnerCard>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
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
