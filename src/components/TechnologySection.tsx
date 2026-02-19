import { ArrowRight, BarChart3, Users, Bot, ExternalLink, Shield, Zap, Activity } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ─── ASCII Intelligence Matrix ─── */
const ASCII_LINES = [
  "╔══════════════════════════════════════╗",
  "║  INTELIOSE DYOR ENGINE v3.1.0       ║",
  "║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░  78% LOADED  ║",
  "╠══════════════════════════════════════╣",
  "║  > token.scan(0x...)     [OK]       ║",
  "║  > liquidity.pool.map   [OK]       ║",
  "║  > wallet.cluster.id    [OK]       ║",
  "║  > risk.vector.calc     [RUNNING]  ║",
  "║  > ai.verdict.gen       [QUEUE]    ║",
  "╠══════════════════════════════════════╣",
  "║  RISK MATRIX:                       ║",
  "║  ████░░░░░░  LIQUIDITY   42%       ║",
  "║  ██████░░░░  AUTHORITY   61%       ║",
  "║  ████████░░  COMMUNITY   83%       ║",
  "║  ██░░░░░░░░  WHALE RISK  19%       ║",
  "╠══════════════════════════════════════╣",
  "║  VERDICT: MODERATE CONFIDENCE       ║",
  "║  → Deploy with caution              ║",
  "╚══════════════════════════════════════╝",
];

const ASCII_MINI = [
  "┌─────────────────────┐",
  "│ SIGNAL INTERCEPT    │",
  "│ ▸ buy:sell  1:2.3   │",
  "│ ▸ vol Δ    +12.4%   │",
  "│ ▸ liq/mc   49.44%   │",
  "│ ▸ holders  2,841    │",
  "│ ▸ whales   7        │",
  "└─────────────────────┘",
];

/* ─── Animated Counter ─── */
const AnimCounter = ({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, target]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

/* ─── Typing ASCII Block ─── */
const TypingASCII = ({ lines, delay = 0 }: { lines: string[]; delay?: number }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleLines((prev) => {
          if (prev >= lines.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 120);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, lines.length, delay]);

  return (
    <div ref={ref} className="font-mono text-[10px] md:text-xs leading-relaxed">
      {lines.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="text-white/90"
        >
          {line}
        </motion.div>
      ))}
      {visibleLines < lines.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="text-white"
        >
          █
        </motion.span>
      )}
    </div>
  );
};

/* ─── Floating Orb ─── */
const FloatingOrb = ({ size, x, y, delay }: { size: number; x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/[0.04] blur-[120px] pointer-events-none"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{ y: [0, -25, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
    transition={{ duration: 12, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

/* ─── Glass Card (Dashboard-style) ─── */
const GlassCard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div
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
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.8)] to-transparent rounded-t-[28px] pointer-events-none" />
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_0%/0.06)] to-transparent rounded-b-[28px] pointer-events-none" />
    {children}
  </div>
);

/* ─── Stat Pill ─── */
const StatPill = ({ label, value, icon: Icon, delay = 0 }: { label: string; value: React.ReactNode; icon: any; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gradient-to-b from-secondary/50 to-secondary/30 rounded-[20px] border border-[hsl(var(--border)/0.4)] p-5 shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.05)] group cursor-default"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/[0.07] border border-primary/15 flex items-center justify-center group-hover:bg-primary/[0.12] group-hover:border-primary/25 transition-all duration-500 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
          <Icon size={14} className="text-primary" />
        </div>
        <span className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.15em]">{label}</span>
      </div>
      <p className="text-2xl font-display font-semibold text-foreground tracking-tighter">{value}</p>
    </motion.div>
  );
};

/* ─── Animated Progress Bar ─── */
const AnimBar = ({ label, percent, delay = 0, color = "primary" }: { label: string; percent: number; delay?: number; color?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground/70 font-display">{label}</span>
        <span className="text-foreground font-display font-semibold">{percent}%</span>
      </div>
      <div className="h-2 bg-secondary/60 rounded-full overflow-hidden border border-[hsl(var(--border)/0.3)]">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percent}%` } : {}}
          transition={{ duration: 1.5, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
};

/* ─── Scan Line ─── */
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none z-20"
    animate={{ top: ["0%", "100%", "0%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  />
);

/* ─── Features ─── */
const features = [
  {
    icon: BarChart3,
    title: "Market Intelligence",
    description: "Price • Liquidity • Volume • Buy/Sell telemetry — real-time on-chain data synthesis",
  },
  {
    icon: Users,
    title: "Distribution Analysis",
    description: "Top wallets • Whale detection • Cluster mapping • Supply concentration signals",
  },
  {
    icon: Bot,
    title: "AI Verdict Engine",
    description: "Neutral, plain-English risk assessment. Properties + implications. Zero bias.",
  },
];

const TechnologySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="py-32 relative overflow-hidden"
    >
      {/* Ambient */}
      <FloatingOrb size={600} x="-15%" y="10%" delay={0} />
      <FloatingOrb size={400} x="70%" y="50%" delay={4} />
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 0.5px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/15 backdrop-blur-sm px-4 py-1.5 text-xs text-primary mb-6 font-display font-semibold tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Zap size={12} />
            Intelligence Engine
          </motion.div>
          <motion.h2
            className="text-5xl md:text-7xl text-foreground mb-6 leading-[0.95] font-display font-medium tracking-tighter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            DYOR<br />
            <span className="text-primary">Intelligence</span>
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real-time market telemetry, liquidity signals, authority checks, and neutral AI verdicts — paste a token address and get instant clarity.
          </motion.p>
        </div>

        {/* ─── HERO GLASS CARD: ASCII + Live Stats ─── */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <GlassCard glow className="relative overflow-hidden">
            <ScanLine />
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/[0.04] blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              {/* Left: ASCII Terminal */}
              <div className="bg-gradient-to-b from-primary to-primary/90 rounded-[20px] border border-[hsl(0_0%_100%/0.15)] p-6 overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.4)] to-transparent" />
                {/* Terminal header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-[10px] text-white/50 font-mono">inteliose://dyor-engine</span>
                </div>
                <TypingASCII lines={ASCII_LINES} delay={500} />
              </div>

              {/* Right: Live Stats Dashboard */}
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)] animate-pulse" />
                  <span className="text-[10px] font-display font-bold text-muted-foreground tracking-[0.15em] uppercase">Live Engine Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <StatPill icon={Activity} label="Tokens Scanned" value={<AnimCounter target={12847} />} delay={0.4} />
                  <StatPill icon={Shield} label="Risks Flagged" value={<AnimCounter target={3291} />} delay={0.5} />
                  <StatPill icon={BarChart3} label="Accuracy Rate" value={<AnimCounter target={94} suffix="%" />} delay={0.6} />
                  <StatPill icon={Zap} label="Avg Response" value={<><AnimCounter target={1} />.2s</>} delay={0.7} />
                </div>

                {/* Mini ASCII */}
                <div className="bg-gradient-to-b from-primary to-primary/90 rounded-2xl border border-[hsl(0_0%_100%/0.15)] p-4 overflow-hidden">
                  <TypingASCII lines={ASCII_MINI} delay={2500} />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ─── Risk Analysis Bars ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/[0.08] border border-primary/15 flex items-center justify-center">
                  <Shield size={13} className="text-primary" />
                </div>
                <span className="text-xs font-display font-semibold text-muted-foreground tracking-widest uppercase">Risk Vector Analysis</span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-primary bg-primary/[0.06] px-3 py-1.5 rounded-full border border-primary/15 font-display font-semibold">
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                LIVE
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-5">
              <AnimBar label="Liquidity Depth" percent={78} delay={0} />
              <AnimBar label="Holder Distribution" percent={62} delay={0.1} />
              <AnimBar label="Smart Contract Safety" percent={91} delay={0.2} />
              <AnimBar label="Trading Volume Health" percent={54} delay={0.3} />
              <AnimBar label="Community Signals" percent={83} delay={0.4} />
              <AnimBar label="Authority Verification" percent={96} delay={0.5} />
            </div>
          </GlassCard>
        </motion.div>

        {/* ─── Action Buttons ─── */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.03, y: -2, boxShadow: "0 12px 40px hsl(240 100% 50% / 0.25)" }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl text-sm font-display font-semibold transition-all shadow-[0_6px_25px_hsl(var(--primary)/0.3),0_1px_0_0_hsl(0_0%_100%/0.15)_inset]"
          >
            Launch DYOR Engine
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </motion.a>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-secondary/70 to-secondary/40 border border-[hsl(var(--border)/0.5)] text-foreground px-8 py-3.5 rounded-2xl text-sm font-display font-medium hover:border-primary/30 transition-all shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.06)]"
          >
            Manage Project
            <ExternalLink size={13} />
          </a>
        </motion.div>

        {/* ─── Feature Cards (3 col) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.7 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group"
            >
              <GlassCard className="h-full text-center flex flex-col items-center transition-all duration-500 group-hover:shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_30px_80px_-20px_hsl(var(--primary)/0.12),0_2px_8px_-2px_hsl(0_0%_0%/0.06)] group-hover:border-primary/20">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/[0.07] border border-primary/15 flex items-center justify-center mb-6 group-hover:bg-primary/[0.12] group-hover:border-primary/25 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-500">
                  <feature.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-display font-medium text-foreground mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
