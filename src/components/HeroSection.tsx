import { ArrowRight } from "lucide-react";
import { useState } from "react";
import Navbar from "./Navbar";
import heroBgNew from "@/assets/hero-bg-new.jpg";

const HeroSection = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <section id="hero" className="relative w-full rounded-3xl md:rounded-4xl overflow-hidden bg-surface-dark text-surface-dark-foreground min-h-[500px] md:min-h-[600px] flex flex-col justify-between p-5 md:p-8 lg:p-12 shadow-2xl">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroBgNew} alt="" className="w-full h-full object-cover" />
      </div>

      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 mt-auto max-w-4xl">
        <h1 className="text-3xl sm:text-5xl md:text-7xl leading-[1.1] mb-6 md:mb-8 font-display font-medium tracking-tighter text-white">
          Build Smarter Tokens. <br />
          <span className="text-primary">Avoid Predictable</span> <br />
          Failure.
        </h1>
        <p className="text-base md:text-lg text-white/70 max-w-2xl mb-6 md:mb-8">
          Inteliose is a founder-centric intelligence platform on Base. We analyze your token, classify risk baselines, and surface failure modes before they burn your project.
        </p>
      </div>

      {/* Founders Dashboard Info Box */}
      <button
        onClick={() => setShowComingSoon(true)}
        className="absolute bottom-12 right-12 z-20 hidden md:flex items-center gap-3 bg-[hsl(var(--glass-bg))] backdrop-blur-md border border-primary/20 p-4 rounded-2xl max-w-xs text-left cursor-pointer hover:border-primary/40 transition-all"
      >
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Manage Project</p>
          <p className="text-sm leading-snug text-foreground">Founder dashboard<br />Token monitoring<br />Action checklist</p>
        </div>
        <div className="flex gap-2 ml-4 self-end">
          <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <ArrowRight className="text-primary-foreground" size={16} />
          </span>
        </div>
      </button>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">Manage Project</p>
            <h3 className="text-xl font-display font-semibold text-card-foreground mb-3">Founder dashboard coming soon</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We're finalizing the project workspace: pinned token + monitoring + action checklist.
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
