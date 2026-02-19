import { BarChart3, Users, Bot, Activity, TrendingUp, Eye, Zap, Shield } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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

/* ─── Typing Lines ─── */
const TypingLines = ({ lines, delay = 0 }: { lines: string[]; delay?: number }) => {
  const [visible, setVisible] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisible((prev) => {
          if (prev >= lines.length) { clearInterval(interval); return prev; }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, lines.length, delay]);

  return (
    <div ref={ref} className="font-mono text-[9px] md:text-[10px] leading-relaxed">
      {lines.slice(0, visible).map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.12 }} className="text-white/90">
          {line}
        </motion.div>
      ))}
      {visible < lines.length && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="text-white">█</motion.span>
      )}
    </div>
  );
};

/* ─── Animated Bar ─── */
const AnimBar = ({ label, percent, delay = 0 }: { label: string; percent: number; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground/70 font-display">{label}</span>
        <span className="text-foreground font-display font-semibold">{percent}%</span>
      </div>
      <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden border border-[hsl(var(--border)/0.3)]">
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
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none z-20"
    animate={{ top: ["0%", "100%", "0%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  />
);

/* ─── Glass Card ─── */
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative rounded-[28px] bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-3xl border border-[hsl(var(--border)/0.4)] p-6 md:p-8 shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(0_0%_0%/0.08),0_2px_8px_-2px_hsl(0_0%_0%/0.06)] overflow-hidden ${className}`}>
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.8)] to-transparent rounded-t-[28px] pointer-events-none" />
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_0%/0.06)] to-transparent rounded-b-[28px] pointer-events-none" />
    {children}
  </div>
);

/* ─── ASCII Data ─── */
const MARKET_ASCII = [
  "┌─────────────────────────┐",
  "│ MARKET TELEMETRY v2.1   │",
  "│ ▸ price    $0.00342     │",
  "│ ▸ vol.24h  $1.2M        │",
  "│ ▸ liq/mc   38.7%        │",
  "│ ▸ buy:sell 1:1.8        │",
  "│ ▸ spread   0.12%        │",
  "│ ▓▓▓▓▓▓▓▓▓░  STREAMING   │",
  "└─────────────────────────┘",
];

const DISTRO_ASCII = [
  "┌─────────────────────────┐",
  "│ WALLET CLUSTERING       │",
  "│ ▸ top10    42.3%        │",
  "│ ▸ whales   8 detected   │",
  "│ ▸ clusters 3 linked     │",
  "│ ▸ supply   concentrated │",
  "│ ▸ gini     0.67         │",
  "│ ████████░░  MAPPING...  │",
  "└─────────────────────────┘",
];

const VERDICT_ASCII = [
  "┌─────────────────────────┐",
  "│ AI VERDICT ENGINE       │",
  "│ ▸ model   GPT-risk-v4   │",
  "│ ▸ bias    0.00          │",
  "│ ▸ conf    87%           │",
  "│ ▸ flags   2 warnings    │",
  "│ ▸ output  plain-text    │",
  "│ ▓▓▓▓▓▓░░░░  ANALYZING  │",
  "└─────────────────────────┘",
];

/* ─── Module Configs ─── */
const modules = [
  {
    icon: BarChart3,
    title: "Market Intelligence",
    description: "Price • Liquidity • Volume • Buy/Sell telemetry — real-time on-chain data synthesis",
    ascii: MARKET_ASCII,
    stats: [
      { icon: Activity, label: "Data Points", value: 48200 },
      { icon: TrendingUp, label: "Accuracy", value: 96, suffix: "%" },
    ],
    bars: [
      { label: "Price Stability", percent: 72 },
      { label: "Volume Health", percent: 58 },
      { label: "Liquidity Depth", percent: 84 },
    ],
    asciiDelay: 300,
  },
  {
    icon: Users,
    title: "Distribution Analysis",
    description: "Top wallets • Whale detection • Cluster mapping • Supply concentration signals",
    ascii: DISTRO_ASCII,
    stats: [
      { icon: Eye, label: "Wallets Tracked", value: 2841 },
      { icon: Shield, label: "Whales Found", value: 8 },
    ],
    bars: [
      { label: "Holder Spread", percent: 62 },
      { label: "Cluster Risk", percent: 43 },
      { label: "Concentration", percent: 67 },
    ],
    asciiDelay: 600,
  },
  {
    icon: Bot,
    title: "AI Verdict Engine",
    description: "Neutral, plain-English risk assessment. Properties + implications. Zero bias.",
    ascii: VERDICT_ASCII,
    stats: [
      { icon: Zap, label: "Verdicts Issued", value: 9140 },
      { icon: Shield, label: "Confidence", value: 87, suffix: "%" },
    ],
    bars: [
      { label: "Neutrality Score", percent: 98 },
      { label: "Coverage", percent: 91 },
      { label: "Clarity Index", percent: 85 },
    ],
    asciiDelay: 900,
  },
];

const ModulesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="modules" ref={sectionRef} className="py-16 md:py-32 relative overflow-hidden">
      {/* Ambient */}
      <motion.div
        className="absolute rounded-full bg-primary/[0.04] blur-[120px] pointer-events-none"
        style={{ width: 500, height: 500, left: "-10%", top: "20%" }}
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 0.5px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/15 backdrop-blur-sm px-4 py-1.5 text-xs text-primary mb-6 font-display font-semibold tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Zap size={12} />
            Intelligence Modules
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 leading-[1.1] font-display font-medium tracking-tighter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Activate the Right <br className="hidden md:block" /> Intelligence Module
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Each module is modular. Founders activate what they need, when they need it.
          </motion.p>
        </div>

        {/* Module Cards */}
        <div className="space-y-8">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 50, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard className="group hover:shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_30px_80px_-20px_hsl(var(--primary)/0.12),0_2px_8px_-2px_hsl(0_0%_0%/0.06)] hover:border-primary/20 transition-all duration-500">
                <ScanLine />
                {/* Ambient glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/[0.03] blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    className="w-12 h-12 rounded-2xl bg-primary/[0.07] border border-primary/15 flex items-center justify-center group-hover:bg-primary/[0.12] group-hover:border-primary/25 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-500"
                  >
                    <mod.icon size={20} className="text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-display font-medium text-foreground tracking-tight">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">{mod.description}</p>
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-primary bg-primary/[0.06] px-3 py-1.5 rounded-full border border-primary/15 font-display font-semibold shrink-0">
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    ACTIVE
                  </span>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                  {/* ASCII Terminal */}
                  <div className="bg-gradient-to-b from-primary to-primary/90 rounded-[20px] border border-[hsl(0_0%_100%/0.15)] p-4 md:p-5 overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.4)] to-transparent" />
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-2 h-2 rounded-full bg-destructive/60" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                      <div className="w-2 h-2 rounded-full bg-green-500/60" />
                      <span className="ml-2 text-[8px] text-white/40 font-mono">inteliose://module</span>
                    </div>
                    <TypingLines lines={mod.ascii} delay={mod.asciiDelay} />
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    {mod.stats.map((stat, si) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="bg-gradient-to-b from-secondary/50 to-secondary/30 rounded-[18px] border border-[hsl(var(--border)/0.4)] p-4 shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.05)] cursor-default"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/[0.07] border border-primary/15 flex items-center justify-center">
                            <stat.icon size={12} className="text-primary" />
                          </div>
                          <span className="text-[9px] text-muted-foreground/60 font-display font-bold uppercase tracking-[0.12em]">{stat.label}</span>
                        </div>
                        <p className="text-xl font-display font-semibold text-foreground tracking-tighter">
                          <AnimCounter target={stat.value} suffix={stat.suffix || ""} />
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Risk Bars */}
                  <div className="space-y-4 flex flex-col justify-center">
                    {mod.bars.map((bar, bi) => (
                      <AnimBar key={bar.label} label={bar.label} percent={bar.percent} delay={0.3 + bi * 0.12} />
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
