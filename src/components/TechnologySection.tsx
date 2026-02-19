import { ArrowRight, BarChart3, Users, Bot, ExternalLink, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const chains = [
  { name: "Solana DYOR", detail: "holders + BubbleMaps" },
  { name: "Base DYOR", detail: "Coinbase + Zerion fallback" },
];

const features = [
  {
    icon: BarChart3,
    title: "Market snapshot (best-effort)",
    description: "Price • Liquidity • Volume • Buy/Sell telemetry when available",
  },
  {
    icon: Users,
    title: "Distribution + supply signals (Solana)",
    description: "Top wallets (ex-LP) • Whale count • BubbleMaps clusters",
  },
  {
    icon: Bot,
    title: "Neutral AI explanation",
    description: "Describes token properties + what they imply. Not trading advice.",
  },
];

/* Animated particles floating in background */
const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20 blur-sm"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      opacity: [0.2, 0.6, 0.3, 0.5, 0.2],
      scale: [1, 1.3, 0.9, 1.1, 1],
    }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* Animated scanning line */
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
    animate={{ top: ["0%", "100%", "0%"] }}
    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
  />
);

/* Counter animation */
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* Orbiting dot */
const OrbitDot = ({ radius, duration, delay, color }: { radius: number; duration: number; delay: number; color: string }) => (
  <motion.div
    className="absolute"
    style={{ width: 6, height: 6 }}
    animate={{ rotate: 360 }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  >
    <div
      className="rounded-full"
      style={{
        width: 6,
        height: 6,
        backgroundColor: color,
        transform: `translateX(${radius}px)`,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  </motion.div>
);

const TechnologySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative rounded-3xl bg-card/50 border border-border/60 p-8 lg:p-16 overflow-hidden"
    >
      {/* Animated background particles */}
      <FloatingParticle delay={0} x="10%" y="20%" size={4} />
      <FloatingParticle delay={1.5} x="80%" y="15%" size={6} />
      <FloatingParticle delay={3} x="60%" y="70%" size={3} />
      <FloatingParticle delay={0.8} x="25%" y="80%" size={5} />
      <FloatingParticle delay={2.2} x="90%" y="50%" size={4} />
      <FloatingParticle delay={4} x="45%" y="40%" size={7} />
      <FloatingParticle delay={1} x="70%" y="85%" size={3} />

      {/* Scanning line effect */}
      <ScanLine />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Glow orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/8 blur-[100px] pointer-events-none"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Header */}
      <motion.div
        className="max-w-3xl mb-16 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.p
          className="text-xs uppercase tracking-[0.3em] text-primary mb-4 font-medium flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Zap size={12} className="text-primary" />
          Technology
        </motion.p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter leading-[1.05] mb-6 text-foreground">
          DYOR <span className="text-primary">Intelligence</span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Inteliose helps you dyor faster: real-time market telemetry, liquidity signals, authority checks, and neutral AI summaries. Choose the chain first, then paste the token address.
        </p>
      </motion.div>

      {/* Chain Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6 relative z-10">
        {chains.map((chain, i) => (
          <motion.div
            key={chain.name}
            className="relative flex items-center justify-between bg-secondary/80 backdrop-blur-sm border border-border rounded-3xl p-6 hover:border-primary/40 transition-all duration-500 group cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Hover glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
            />

            {/* Animated border pulse on hover */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ boxShadow: "inset 0 0 30px hsl(var(--primary) / 0.05)" }}
            />

            <div className="relative z-10">
              <p className="text-foreground font-display font-medium text-lg flex items-center gap-3">
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
                {chain.name}
              </p>
              <p className="text-muted-foreground text-sm mt-1">{chain.detail}</p>
            </div>
            <motion.div
              className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative z-10"
              whileHover={{ rotate: -45 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight size={18} className="text-primary" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Action Row */}
      <motion.div
        className="flex flex-wrap gap-3 mb-20 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.a
          href="#"
          className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          DYOR Intelligence
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight size={16} />
          </motion.span>
        </motion.a>
        <motion.a
          href="#"
          className="inline-flex items-center gap-2 bg-secondary border border-border text-foreground px-6 py-3 rounded-full text-sm font-medium hover:border-primary/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Manage Project
          <ExternalLink size={14} />
        </motion.a>
      </motion.div>

      {/* Animated Divider */}
      <motion.div
        className="relative h-px mb-16"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <motion.div
          className="absolute top-0 w-20 h-px bg-primary"
          animate={{ left: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* What DYOR gives you */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h3 className="text-xs uppercase tracking-[0.3em] text-primary mb-10 font-medium">What DYOR gives you</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="relative border border-border rounded-3xl p-8 bg-card hover:border-primary/30 transition-all duration-500 group overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.9 + i * 0.15 }}
              whileHover={{ y: -4 }}
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-bl-3xl pointer-events-none">
                <motion.div
                  className="absolute top-0 right-0 w-px h-12 bg-gradient-to-b from-primary/40 to-transparent"
                  initial={{ height: 0 }}
                  animate={isInView ? { height: 48 } : {}}
                  transition={{ duration: 0.8, delay: 1.2 + i * 0.2 }}
                />
                <motion.div
                  className="absolute top-0 right-0 h-px w-12 bg-gradient-to-l from-primary/40 to-transparent"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: 48 } : {}}
                  transition={{ duration: 0.8, delay: 1.2 + i * 0.2 }}
                />
              </div>

              {/* Icon with orbit */}
              <div className="relative h-16 w-16 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <OrbitDot radius={24} duration={6 + i} delay={i * 0.5} color="hsl(240 100% 50% / 0.3)" />
                </div>
                <motion.div
                  className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center relative z-10 group-hover:bg-primary/20 transition-colors duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon size={22} className="text-primary" />
                </motion.div>
              </div>

              <h4 className="text-foreground font-display font-medium text-lg mb-3">{feature.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>

              {/* Bottom stat */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Active</span>
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default TechnologySection;
