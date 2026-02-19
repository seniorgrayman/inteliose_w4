import { ArrowRight, BarChart3, Users, Bot, ExternalLink } from "lucide-react";

const chains = [
  {
    name: "Solana DYOR",
    detail: "holders + BubbleMaps",
  },
  {
    name: "Base DYOR",
    detail: "Coinbase + Zerion fallback",
  },
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
  return (
    <section className="rounded-3xl bg-surface-dark text-surface-dark-foreground p-8 lg:p-16">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4 font-medium">Technology</p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter leading-[1.05] mb-6">
          DYOR <span className="text-primary">Intelligence</span>
        </h2>
        <p className="text-lg text-white/60 leading-relaxed">
          Inteliose helps you dyor faster: real-time market telemetry, liquidity signals, authority checks, and neutral AI summaries. Choose the chain first, then paste the token address.
        </p>
      </div>

      {/* Chain Cards + Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {chains.map((chain) => (
          <div
            key={chain.name}
            className="flex items-center justify-between bg-[hsl(var(--glass-bg))] backdrop-blur-sm border border-[hsl(var(--glass-border))] rounded-2xl p-6 hover:border-primary/30 transition-colors group"
          >
            <div>
              <p className="text-white font-display font-medium text-lg">{chain.name}</p>
              <p className="text-white/40 text-sm mt-1">{chain.detail}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ArrowRight size={18} className="text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap gap-3 mb-20">
        <a
          href="#"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          DYOR Intelligence
          <ArrowRight size={16} />
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-2 bg-[hsl(var(--glass-bg))] backdrop-blur-sm border border-[hsl(var(--glass-border))] text-white px-6 py-3 rounded-full text-sm font-medium hover:border-primary/30 transition-colors"
        >
          Manage Project
          <ExternalLink size={14} />
        </a>
      </div>

      {/* What DYOR gives you */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.3em] text-primary mb-10 font-medium">What DYOR gives you</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border border-[hsl(var(--glass-border))] rounded-2xl p-8 bg-[hsl(var(--glass-bg))] backdrop-blur-sm hover:border-primary/20 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon size={22} className="text-primary" />
              </div>
              <h4 className="text-white font-display font-medium text-lg mb-3">{feature.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
