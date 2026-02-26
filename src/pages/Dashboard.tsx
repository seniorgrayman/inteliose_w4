import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, Clock, DollarSign, BarChart3, Droplets, TrendingUp,
  Percent, Activity, Globe, FileText, MessageCircle, ExternalLink,
  ChevronDown, Search, Sparkles, Wallet, Shield, Zap, Radio, Copy, Check, BarChart2,
  Fingerprint, FileCode, LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { truncateAddress } from "@/components/WalletConnectModal";
import ConLaunchLiveSection from "@/components/ConLaunchLiveSection";
import AgentStatusCard from "@/components/AgentStatusCard";
import A2AActivityFeed from "@/components/A2AActivityFeed";
import AgentCardPreview from "@/components/AgentCardPreview";
import BurnConfirmModal from "@/components/BurnConfirmModal";
import ClankerTokensSection from "@/components/ClankerTokensSection";
import FarcasterStatusCard from "@/components/FarcasterStatusCard";
import { useWallet, getEVMProviderForType } from "@/contexts/WalletContext";
import { useBurn } from "@/hooks/useBurn";
import type { EVMProvider } from "@/types/wallet";
import { getToken as fetchConLaunchToken } from "@/lib/conlaunch";
import { fetchTokenData, fetchSecurityScan, generateAIAnalysis, fetchMintAuthority, fetchHolderDistribution, type AIAnalysis, type HolderDistribution } from "@/lib/tokendata";

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
  const [quickIntel, setQuickIntel] = useState<any | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [currentToken, setCurrentToken] = useState<any | null>(null);
  const [holders, setHolders] = useState<HolderDistribution | null>(null);
  const [mintAuthority, setMintAuthority] = useState<string | null>(null);
  const { isConnected, fullWalletAddress, walletType, openConnectModal, disconnect } = useWallet();
  const connectedAddress = isConnected ? fullWalletAddress : null;
  const [activeTab, setActiveTab] = useState<"analyze" | "conlaunch" | "agent-status" | "a2a-activity" | "clanker" | "agent-card" | "farcaster">("analyze");
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<"agent-card" | null>(null);
  const walletDropdownRef = useRef<HTMLDivElement>(null);

  // Close wallet dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(e.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    if (walletDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [walletDropdownOpen]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ─── EVM Provider + Burn Integration ───
  const getEVMProvider = useCallback((): EVMProvider | null => {
    return getEVMProviderForType(walletType) as EVMProvider | null;
  }, [walletType]);

  const {
    requestBurn,
    showBurnModal,
    estimate: burnEstimate,
    burnStatus,
    burnError,
    tokenBalance,
    confirmBurn,
    cancelBurn,
  } = useBurn({
    walletAddress: connectedAddress,
    getProvider: getEVMProvider,
    openWalletModal: openConnectModal,
  });

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleAnalyze = async () => {
    if (!tokenAddress) {
      setValidationError(null);
      return;
    }
    
    // Validate token address format
    const trimmedAddress = tokenAddress.trim();
    const isValidBase = /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress);
    // Solana addresses are typically 43-44 characters but can vary - just check length
    const isValidSolana = trimmedAddress.length >= 32 && trimmedAddress.length <= 50;
    
    if (chain === "Base" && !isValidBase) {
      setValidationError("Invalid token address");
      setQuickIntel(null);
      setAIAnalysis(null);
      return;
    }
    
    if (chain === "Solana" && !isValidSolana) {
      setValidationError("Invalid token address");
      setQuickIntel(null);
      setAIAnalysis(null);
      return;
    }

    // Clear validation error when valid
    setValidationError(null);

    // ─── Burn Gate: require token burn before analysis ───
    const burnApproved = await requestBurn(trimmedAddress);
    if (!burnApproved) return;

    setIsAnalyzing(true);
    
    // Clear previous data to avoid caching
    setCurrentToken(null);
    setQuickIntel(null);
    setAIAnalysis(null);
    setHolders(null);
    setMintAuthority(null);
    
    try {
      // Fetch real token data from APIs (Coinbase → Zerion → DexScreener for Base)
      const tokenData = await fetchTokenData(trimmedAddress, chain);
      
      if (tokenData) {
        setCurrentToken(tokenData);
      }
      
  // NOTE: removed ConLaunch API call here to avoid hitting local /api/tokens?address
  // If you need ConLaunch context later, fetch it in the Clawn.ch section only.
      
      // Fetch REAL security checks with real-time RPC data
      const securityData = await fetchSecurityScan(trimmedAddress, chain);
      if (securityData) {
        setQuickIntel(securityData);
      } else {
        setQuickIntel(null);
      }

      // Fetch holder distribution and mint authority in parallel
      const [holderData, mintAuth] = await Promise.all([
        chain === "Solana" ? fetchHolderDistribution(trimmedAddress, chain) : Promise.resolve(null),
        chain === "Solana" ? fetchMintAuthority(trimmedAddress) : Promise.resolve(null),
      ]);
      
      if (holderData) {
        setHolders(holderData);
      }
      
      if (mintAuth) {
        setMintAuthority(mintAuth);
      }

      // Generate REAL AI analysis using Gemini API with fresh data
      if (tokenData && securityData) {
        const analysis = await generateAIAnalysis(
          tokenData.name,
          tokenData.symbol,
          tokenData,
          securityData,
          chain
        );
        if (analysis) {
          setAIAnalysis(analysis);
        }
      }
    } catch (e) {
      console.warn("handleAnalyze error:", e);
      setQuickIntel(null);
      setAIAnalysis(null);
    }

    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Ambient orbs */}
      <FloatingOrb size={700} x="-10%" y="5%" delay={0} />
      <FloatingOrb size={500} x="60%" y="40%" delay={3} />
      <FloatingOrb size={350} x="30%" y="-8%" delay={6} color="accent" />
      <FloatingOrb size={400} x="80%" y="70%" delay={9} color="accent" />

      {/* Premium Navbar */}
      <nav className="relative z-50 bg-gradient-to-b from-card/70 to-card/50 backdrop-blur-2xl border-b border-[hsl(var(--border)/0.3)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl tracking-tight text-foreground hover:text-foreground/70 transition-colors">
            inteliose™
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors hidden md:block font-display">
              ← Back to Home
            </Link>
            {connectedAddress ? (
              <div className="relative" ref={walletDropdownRef}>
                <motion.button
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  onClick={() => setWalletDropdownOpen((p) => !p)}
                  className="bg-primary/[0.06] border border-primary/15 text-foreground px-5 py-2.5 rounded-2xl text-sm transition-all font-display flex items-center gap-2 shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset,0_0_20px_hsl(var(--primary)/0.06)] hover:bg-primary/[0.1] cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)] animate-pulse" />
                  {truncateAddress(connectedAddress)}
                  <ChevronDown size={12} className={`text-muted-foreground transition-transform ${walletDropdownOpen ? "rotate-180" : ""}`} />
                </motion.button>

                <AnimatePresence>
                  {walletDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-2xl border border-[hsl(var(--border)/0.5)] rounded-2xl shadow-[0_20px_60px_-15px_hsl(0_0%_0%/0.15),0_1px_0_0_hsl(0_0%_100%/0.4)_inset] overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border/30">
                        <p className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.12em]">Connected</p>
                        <p className="text-xs text-foreground font-mono mt-1">{truncateAddress(connectedAddress)}</p>
                      </div>
                      <div className="py-1.5">
                        <button
                          onClick={() => {
                            window.open(`https://basescan.org/address/${connectedAddress}`, "_blank");
                            setWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/[0.05] hover:text-foreground transition-colors font-display"
                        >
                          <ExternalLink size={14} className="text-muted-foreground/60" />
                          View on Basescan
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(connectedAddress);
                            setWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/[0.05] hover:text-foreground transition-colors font-display"
                        >
                          <Copy size={14} className="text-muted-foreground/60" />
                          Copy Address
                        </button>
                        <div className="h-px bg-border/30 mx-3 my-1" />
                        <button
                          onClick={() => {
                            disconnect();
                            setWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive/80 hover:bg-destructive/[0.05] hover:text-destructive transition-colors font-display"
                        >
                          <LogOut size={14} />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={openConnectModal}
                className="bg-foreground text-background px-6 py-2.5 rounded-2xl text-sm hover:bg-foreground/90 transition-all font-display font-semibold flex items-center gap-2 shadow-[0_4px_15px_hsl(0_0%_0%/0.15),0_1px_3px_hsl(0_0%_0%/0.1)]"
              >
                <Wallet size={14} />
                Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* Tab Toggle */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-2">
        <div className="inline-flex items-center bg-gradient-to-b from-card/70 to-card/50 backdrop-blur-2xl border border-[hsl(var(--border)/0.4)] rounded-2xl p-1 shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.06)] overflow-x-auto max-w-full hide-scrollbar">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-display font-semibold transition-all whitespace-nowrap ${
              activeTab === "analyze"
                ? "bg-foreground text-background shadow-[0_4px_15px_hsl(0_0%_0%/0.15)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search size={14} />
            <span className="hidden sm:inline">Analyze Token</span>
            <span className="sm:hidden">Analyze</span>
          </button>
          <button
            onClick={() => setActiveTab("clanker")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-display font-semibold transition-all whitespace-nowrap ${
              activeTab === "clanker"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Radio size={14} />
            Clanker
          </button>
          <button
            onClick={() => setActiveTab("agent-status")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-display font-semibold transition-all whitespace-nowrap ${
              activeTab === "agent-status"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Fingerprint size={14} />
            <span className="hidden sm:inline">Agent Status</span>
            <span className="sm:hidden">Agent</span>
          </button>
          <button
            onClick={() => setActiveTab("a2a-activity")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-display font-semibold transition-all whitespace-nowrap ${
              activeTab === "a2a-activity"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity size={14} />
            A2A
          </button>
          <button
            onClick={() => setActiveTab("agent-card")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-display font-semibold transition-all whitespace-nowrap ${
              activeTab === "agent-card"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCode size={14} />
            <span className="hidden sm:inline">Agent Card</span>
            <span className="sm:hidden">Card</span>
          </button>
          <button
            onClick={() => setActiveTab("farcaster")}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-display font-semibold transition-all whitespace-nowrap ${
              activeTab === "farcaster"
                ? "bg-foreground text-background shadow-[0_4px_15px_hsl(0_0%_0%/0.15)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle size={14} />
            Farcaster
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">

        {activeTab === "analyze" && (
        <>
        {/* ─── Input Hero Card ─── */}
        <GlassCard glow className="relative overflow-hidden">
          {/* Ambient glow inside card */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-primary/[0.03] blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 md:mb-8">
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
                  className="text-3xl md:text-5xl font-display font-medium tracking-tighter text-foreground leading-[1.05] mb-3"
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
                <div className={`flex items-center gap-3 w-full bg-gradient-to-b from-secondary/50 to-secondary/30 border rounded-2xl px-5 py-4 focus-within:shadow-[0_0_30px_hsl(var(--primary)/0.06),0_1px_0_0_hsl(0_0%_100%/0.4)_inset] focus-within:bg-card/80 transition-all shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset,0_2px_4px_-1px_hsl(0_0%_0%/0.04)] ${
                  validationError 
                    ? "border-destructive/50 focus-within:border-destructive/70" 
                    : "border-[hsl(var(--border)/0.4)] focus-within:border-primary/30"
                }`}>
                  <div className="flex-shrink-0">
                    {chain === "Base" ? (
                      <div className="text-lg font-bold text-blue-500">⛓️</div>
                    ) : (
                      <div className="text-lg font-bold text-purple-500">◎</div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => {
                      setTokenAddress(e.target.value);
                      // Clear error when user starts typing
                      if (validationError) setValidationError(null);
                    }}
                    placeholder={chain === "Base" ? "0x + 40 hex chars" : "43-50 characters"}
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/30 focus:outline-none text-sm font-display"
                  />
                </div>
                {validationError && (
                  <p className="text-xs text-destructive mt-2 font-display">{validationError}</p>
                )}
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

                <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
                  <motion.button
                    whileHover={!tokenAddress.trim() || isAnalyzing ? {} : { scale: 1.03, y: -2, boxShadow: "0 12px 40px hsl(240 100% 50% / 0.25)" }}
                    whileTap={!tokenAddress.trim() || isAnalyzing ? {} : { scale: 0.97 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !tokenAddress.trim()}
                    className="bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm font-display font-semibold flex items-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_6px_25px_hsl(var(--primary)/0.3),0_1px_0_0_hsl(0_0%_100%/0.15)_inset] w-full md:w-auto justify-center"
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
                <div className="flex items-start gap-4 mb-6">
                  {currentToken?.image && (
                    <motion.img
                      src={currentToken.image}
                      alt={currentToken?.name || "Token"}
                      className="w-20 h-20 rounded-2xl border border-[hsl(var(--border)/0.5)] object-cover shadow-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-3xl font-display font-medium tracking-tighter text-foreground">
                      {currentToken?.name || "Unknown"} <span className="text-muted-foreground/60 font-normal text-2xl">({currentToken?.symbol || "??"})</span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">Quick facts + instant risk signal.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                  <InnerCard>
                    <p className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.15em] mb-4">Quick Facts</p>
                    <StatRow icon={DollarSign} label="Current price (USD)" value={currentToken?.price || "N/A"} />
                    <StatRow icon={BarChart3} label="Volume (24h)" value={currentToken?.volume24h || "N/A"} />
                    <StatRow icon={Droplets} label="Liquidity" value={currentToken?.liquidity || "N/A"} />
                    <StatRow icon={TrendingUp} label="Market cap" value={currentToken?.marketCap || "N/A"} />
                  </InnerCard>
                </div>

                {/* Status Badges */}
                <div className="flex gap-3 mt-7">
                  {chain === "Solana" && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="bg-gradient-to-b from-secondary/50 to-secondary/30 border border-[hsl(var(--border)/0.4)] rounded-2xl px-5 py-4 shadow-[0_1px_0_0_hsl(0_0%_100%/0.3)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.04)]"
                    >
                      <p className="text-[10px] text-muted-foreground/60 mb-1.5 font-display font-bold uppercase tracking-[0.15em]">Mint Authority</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${mintAuthority === "RENOUNCED" ? "bg-primary" : mintAuthority === "ACTIVE" ? "bg-orange-500" : "bg-gray-500"} shadow-[0_0_10px_hsl(var(--primary)/0.5)] animate-pulse`} />
                        <span className="text-sm font-display font-bold text-foreground">{mintAuthority || "Unknown"}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </GlassCard>

              {/* Go+ Security Checks */}
              <GlassCard>
                <SectionLabel icon={Shield}>Go+ Security Checks</SectionLabel>
                {quickIntel ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div key={i} className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-all ${row[2] ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/10"}`}>
                          <p className="text-sm text-foreground/70">{row[0]}</p>
                          <p className={`text-sm font-semibold ${row[2] ? "text-destructive" : "text-primary"}`}>{row[1]}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {[
                        ["Buy tax", quickIntel.buyTax],
                        ["Sell tax", quickIntel.sellTax],
                        ["Ownership renounced", (mintAuthority === "RENOUNCED" || quickIntel.ownershipRenounced === "Yes") ? "✅ YES" : (quickIntel.ownershipRenounced === "Unknown" ? "❓ Unknown" : "❌ NO")],
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/40 border border-border/30">
                          <p className="text-sm text-foreground/70">{row[0]}</p>
                          <p className="text-sm font-semibold text-foreground">{row[1]}</p>
                        </div>
                      ))}
                      {quickIntel.ownerAddress && quickIntel.ownerAddress !== "Unknown" && (
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/40 border border-border/30 md:col-span-2">
                          <p className="text-sm text-foreground/70">Owner address</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{quickIntel.ownerAddress.slice(0, 10)}...{quickIntel.ownerAddress.slice(-4)}</p>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCopyAddress(quickIntel.ownerAddress)}
                              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                              title="Copy address"
                            >
                              {copiedAddress === quickIntel.ownerAddress ? (
                                <Check size={16} className="text-primary" />
                              ) : (
                                <Copy size={16} className="text-muted-foreground/60 hover:text-primary" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60">No security checks available for this token.</p>
                )}
              </GlassCard>

              {/* Holder Distribution - Only for Solana */}
              {chain === "Solana" && (
              <GlassCard>
                <SectionLabel icon={Activity}>Holder Distribution ({chain})</SectionLabel>
                {holders && holders.topHolders && holders.topHolders.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground/60 mb-4">Top 20 holders (excluding dev wallet)</p>
                    {holders.topHolders.map((holder, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 p-2 hover:bg-secondary/20 rounded-lg transition-colors">
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <span className="text-xs text-muted-foreground/70 truncate">
                            {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopyAddress(holder.address)}
                            className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                            title="Copy address"
                          >
                            {copiedAddress === holder.address ? (
                              <Check size={12} className="text-primary" />
                            ) : (
                              <Copy size={12} className="text-muted-foreground/40 hover:text-primary" />
                            )}
                          </motion.button>
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
                ) : (
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">
                    Run analysis to fetch holder distribution data for this Solana token.
                  </p>
                )}
              </GlassCard>
              )}

              {/* Liquidity & Risk */}
              <GlassCard>
                <SectionLabel icon={Shield}>Liquidity & Death-Spiral Risk</SectionLabel>
                <p className="text-sm text-muted-foreground/70 mb-6">Token liquidity and security status.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InnerCard>
                    <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Chain</p>
                    <p className="text-3xl font-display font-bold text-foreground tracking-tight">{chain}</p>
                  </InnerCard>
                  <InnerCard>
                    <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Analysis Status</p>
                    <p className="text-3xl font-display font-bold text-primary tracking-tight">{analyzed ? "✅ Done" : "⏳ Ready"}</p>
                  </InnerCard>
                </div>
              </GlassCard>

              {/* AI Analysis Summary */}
              {aiAnalysis && (
              <GlassCard>
                <SectionLabel icon={Sparkles}>AI Verdict Summary</SectionLabel>
                <InnerCard className="mb-4">
                  <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Risk Assessment</p>
                  <p className="text-3xl font-display font-bold text-foreground tracking-tight">{aiAnalysis.riskLevel}</p>
                </InnerCard>
              </GlassCard>
              )}

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
                    {aiAnalysis && (
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 rounded-2xl px-6 py-3 shadow-[0_0_25px_hsl(var(--primary)/0.08),0_1px_0_0_hsl(0_0%_100%/0.3)_inset]"
                      >
                        <span className="text-sm font-display font-bold text-primary">Risk: {aiAnalysis.riskLevel}</span>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InnerCard className="space-y-5">
                      <div>
                        <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">AI Analysis Summary</p>
                        <p className="text-sm text-foreground/55 leading-relaxed">
                          {aiAnalysis?.summary || "Run analysis to generate AI insights..."}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">Recommendation</p>
                        <p className="text-sm text-foreground/55 font-semibold leading-relaxed">
                          {aiAnalysis?.recommendation || "N/A"}
                        </p>
                      </div>
                      {aiAnalysis?.keyPoints && aiAnalysis.keyPoints.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/60 font-display font-bold mb-2.5 uppercase tracking-[0.15em]">Key Points</p>
                          <ul className="text-sm text-foreground/55 leading-relaxed space-y-1.5">
                            {aiAnalysis.keyPoints.map((point, idx) => (
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
                    </InnerCard>

                    <InnerCard>
                      <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.15em]">Bubble Map</p>
                        <div 
                          className="flex items-center gap-1.5 text-xs text-primary font-display cursor-pointer hover:text-primary/80 transition-colors"
                          onClick={() => {
                            const tokenAddr = currentToken?.address || tokenAddress;
                            if (tokenAddr) {
                              const chainParam = chain === "Base" ? "base" : "solana";
                              const bubbleMapsUrl = `https://v2.bubblemaps.io/map?address=${tokenAddr}&chain=${chainParam}`;
                              window.open(bubbleMapsUrl, '_blank');
                            }
                          }}
                        >
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
                              onClick={() => {
                                const tokenAddr = currentToken?.address || tokenAddress;
                                if (tokenAddr) {
                                  const chainParam = chain === "Base" ? "base" : "solana";
                                  const bubbleMapsUrl = `https://v2.bubblemaps.io/map?address=${tokenAddr}&chain=${chainParam}`;
                                  window.open(bubbleMapsUrl, '_blank');
                                }
                              }}
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
        </>
        )}

        {activeTab === "conlaunch" && (
          <ConLaunchLiveSection />
        )}

        {activeTab === "clanker" && (
          <ClankerTokensSection />
        )}


        {activeTab === "agent-status" && (
          <AgentStatusCard />
        )}

        {activeTab === "a2a-activity" && (
          <A2AActivityFeed />
        )}

        {activeTab === "agent-card" && (
          <AgentCardPreview />
        )}

        {activeTab === "farcaster" && (
          <FarcasterStatusCard />
        )}
      </div>

      <BurnConfirmModal
        open={showBurnModal}
        estimate={burnEstimate}
        tokenBalance={tokenBalance}
        burnStatus={burnStatus}
        burnError={burnError}
        onConfirm={confirmBurn}
        onCancel={cancelBurn}
      />
    </div>
  );
};

export default Dashboard;
