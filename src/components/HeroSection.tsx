import { ArrowRight } from "lucide-react";
import Navbar from "./Navbar";
import heroBg from "@/assets/hero-bg.png";

const HeroSection = () => {
  return (
    <section id="hero" className="relative w-full rounded-3xl md:rounded-4xl overflow-hidden bg-surface-dark text-surface-dark-foreground min-h-[500px] md:min-h-[600px] flex flex-col justify-between p-5 md:p-8 lg:p-12 shadow-2xl">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
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

      {/* Floating Badge */}
      <a href="/dashboard" className="absolute bottom-12 right-12 z-20 hidden md:flex items-center gap-3 bg-[hsl(var(--glass-bg))] backdrop-blur-md border border-blue-500/20 p-4 rounded-2xl max-w-xs">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
          <p className="text-sm leading-snug">Plain-English intelligence.<br />Actionable next steps.<br />Built for Base.</p>
        </div>
        <div className="flex gap-2 ml-4 self-end">
          <span className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition">
            <ArrowRight className="text-foreground" size={16} />
          </span>
        </div>
      </a>
    </section>
  );
};

export default HeroSection;
