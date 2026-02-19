import { ArrowRight, BarChart3, Users, Bot, ExternalLink } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

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

const TechnologySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden border-b border-border/60 bg-card/50"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header — matching other sections */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            className="inline-flex items-center rounded-full border border-border bg-card/80 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground mb-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Technology
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl text-foreground mb-6 leading-[1.1] font-display font-medium tracking-tighter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            DYOR <span className="text-primary">Intelligence</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Inteliose helps you dyor faster: real-time market telemetry, liquidity signals, authority checks, and neutral AI summaries. Choose the chain first, then paste the token address.
          </motion.p>
        </div>

        {/* Chain Selection Cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-8 max-w-3xl mx-auto">
          {chains.map((chain, i) => (
            <motion.div
              key={chain.name}
              className="group flex items-center justify-between bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-primary/30 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div>
                <p className="text-foreground font-display font-medium text-base tracking-tight flex items-center gap-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  {chain.name}
                </p>
                <p className="text-muted-foreground text-sm mt-1 pl-5">{chain.detail}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a
            href="#"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-all"
          >
            DYOR Intelligence
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:border-primary/30 transition-all"
          >
            Manage Project
            <ExternalLink size={13} />
          </a>
        </motion.div>

        {/* What DYOR gives you — 3 column grid matching ModulesSection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.15 }}
            >
              {/* Icon card */}
              <div className="relative h-48 w-full flex items-center justify-center mb-8">
                <motion.div
                  className="w-64 bg-card rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border p-5 relative z-10 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <feature.icon className="text-primary" size={14} />
                    </div>
                    <div className="text-left space-y-1.5">
                      <div className="h-2 w-24 bg-secondary rounded-full" />
                      <div className="h-1.5 w-16 bg-muted rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-5">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary/20 rounded-full"
                        initial={{ width: "0%" }}
                        animate={isInView ? { width: `${60 + i * 15}%` } : {}}
                        transition={{ duration: 1.5, delay: 0.8 + i * 0.2, ease: "easeOut" }}
                      />
                    </div>
                    <div className="h-1.5 w-5/6 bg-muted rounded-full" />
                  </div>
                  <div className="flex items-center justify-between border-t border-muted pt-3">
                    <div className="h-1.5 w-10 bg-secondary rounded-full" />
                    <span className="flex items-center gap-1.5 text-[10px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Active
                    </span>
                  </div>
                </motion.div>
              </div>

              <h3 className="text-lg text-foreground mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
