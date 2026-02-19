import { Zap, Hammer, Crown, ArrowRight, CheckCircle } from "lucide-react";

const plans = [
  {
    icon: Zap,
    name: "Starter",
    price: "Free",
    description: "Basic token profiling and risk snapshot.",
    cta: "Start Free Analysis",
    highlighted: false,
    features: ["Basic token profile", "Initial risk baseline", "One actionable prompt"],
    label: "Includes",
  },
  {
    icon: Hammer,
    name: "Builder",
    price: "Pro",
    description: "For serious teams needing deeper analysis.",
    cta: "Get Full Access",
    highlighted: true,
    features: ["Full module access", "Dev wallet analysis", "Risk evolution tracking"],
    label: "Everything in Starter plus",
    badge: "Pro",
  },
  {
    icon: Crown,
    name: "Founder",
    price: "Advanced",
    description: "Operational command center access.",
    cta: "Join Waitlist",
    highlighted: false,
    features: ["Dashboard access", "Continuous monitoring", "Priority insights"],
    label: "Includes",
  },
];

const PricingSection = () => {
  return (
    <section className="relative bg-primary rounded-4xl p-8 lg:p-16 overflow-hidden shadow-2xl mt-8">
      {/* Background Text */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 select-none pointer-events-none w-full text-center">
        <span className="text-[12rem] lg:text-[18rem] text-white/[0.02] leading-none font-display font-medium tracking-tighter">PLANS</span>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-white mb-6">
          Simple Pricing
        </span>
        <h2 className="text-4xl md:text-5xl text-white mb-4 font-display font-medium tracking-tighter">
          Intelligence as <br /> Infrastructure.
        </h2>
        <p className="text-blue-200 text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Start with basic profiling. Upgrade for continuous monitoring and advanced risk detection.
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`group relative flex flex-col p-8 rounded-3xl transition-colors duration-300 ${
                plan.highlighted
                  ? "bg-white/[0.15] border border-white/30 overflow-hidden shadow-2xl backdrop-blur-md"
                  : "bg-white/[0.06] border border-white/15 hover:bg-white/[0.1] backdrop-blur-sm"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
              )}

              <div className="mb-6 flex items-start justify-between relative z-10">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                  plan.highlighted ? "bg-white/20 border-white/30" : "bg-white/10 border-white/10"
                }`}>
                  <Icon className="text-white" size={20} />
                </div>
                {plan.badge && (
                  <span className="bg-white text-primary text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">{plan.badge}</span>
                )}
              </div>

              <div className="mb-6 relative z-10">
                <span className="text-3xl text-white font-display font-medium tracking-tighter">{plan.price}</span>
                <h3 className="text-lg text-white mt-4">{plan.name}</h3>
                <p className="text-sm text-blue-200 mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <button className={`relative z-10 w-full py-3 rounded-xl text-sm mb-8 flex items-center justify-center gap-2 transition-colors ${
                plan.highlighted
                  ? "bg-white text-primary hover:bg-blue-50 shadow-[0_0_20px_rgba(0,0,255,0.3)] font-semibold"
                  : "bg-white/90 text-primary hover:bg-white"
              }`}>
                {plan.cta} <ArrowRight size={14} />
              </button>

              <div className="space-y-4 mt-auto relative z-10">
                <p className="text-xs text-blue-300 uppercase tracking-wider">{plan.label}</p>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white">
                      <CheckCircle className={plan.highlighted ? "text-white" : "text-blue-300"} size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
