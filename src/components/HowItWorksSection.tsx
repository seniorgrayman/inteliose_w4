import { ArrowUpRight, ShieldCheck, ArrowRight } from "lucide-react";
import dashboardBg from "@/assets/dashboard-bg.jpg";
import founderVideo from "@/assets/dashboard-bg-video.mp4";

const HowItWorksSection = () => {
  return (
    <section className="overflow-hidden bg-secondary/50 border-border/60 border-b pt-24 pb-24 relative">
      <div className="lg:px-8 max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground max-w-4xl leading-[1.05] font-display font-medium tracking-tighter">
            From Contract Address <span className="text-primary">to Clear Action.</span>
          </h2>
          <a href="#" className="group inline-flex items-center text-sm text-foreground hover:text-primary transition-colors border-b border-foreground hover:border-primary pb-0.5 whitespace-nowrap">
            Founder Dashboard
            <ArrowUpRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Steps */}
          <div className="bg-card p-8 min-h-[520px] flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-shadow duration-500 group rounded-3xl">
            <div>
              <h3 className="text-xl text-foreground mb-6 leading-snug font-display font-medium tracking-tighter">How It Works</h3>
              <ul className="space-y-6 text-muted-foreground text-[15px]">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-foreground font-bold">1</span>
                  <p><strong className="text-foreground block">Input</strong> Paste your Base contract address.</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-foreground font-bold">2</span>
                  <p><strong className="text-foreground block">Profile Detection</strong> We classify your project launch structure and liquidity design.</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-foreground font-bold">3</span>
                  <p><strong className="text-foreground block">Action Prompt</strong> Receive a plain-English verdict and next best move.</p>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-border mt-auto">
              <p className="text-sm text-foreground italic">"No dashboards full of meaningless metrics. Just what matters."</p>
            </div>
          </div>

          {/* Card 2: Dashboard Visual */}
          <div className="relative min-h-[520px] bg-surface-dark overflow-hidden group rounded-3xl">
            <video
              autoPlay
              muted
              loop
              playsInline
              src={founderVideo}
              className="w-full h-full object-cover absolute inset-0 opacity-70 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
            />

            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
              <span className="text-white text-lg tracking-tight mix-blend-overlay">The Founder Workspace</span>
            </div>
            <div className="absolute bottom-8 right-8 z-10 text-right">
              <span className="block text-white font-medium">Operational Intelligence</span>
              <span className="text-white/60 text-xs">Coming Soon</span>
            </div>
          </div>

          {/* Card 3: Metric */}
          <div className="min-h-[520px] flex flex-col overflow-hidden group text-center bg-card p-8 relative items-center justify-between rounded-3xl">
            <p className="text-muted-foreground text-lg mt-8">We Don't Investigate.<br /> We Prevent.</p>

            <div className="relative flex items-center justify-center w-56 h-56 my-8">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" stroke="hsl(var(--border))" strokeWidth="1.5" fill="none" />
                <circle cx="100" cy="100" r="90" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" strokeDasharray="565" strokeDashoffset="141" className="transition-all duration-1000 ease-out group-hover:stroke-[3]" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <ShieldCheck className="text-foreground mb-2" size={48} />
                <span className="text-sm text-muted-foreground">Proactive</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground px-4">Most platforms are reactive. Inteliose surfaces risk before it compounds.</p>
            </div>
          </div>

          {/* Card 4: CTA - Blue background with glassmorphic style */}
          <div className="min-h-[520px] flex flex-col group overflow-hidden text-white bg-primary p-8 relative justify-between rounded-3xl">
            <div className="flex justify-between items-start z-10">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-white">
                <span className="text-xl font-display font-medium tracking-tighter">Don't Launch Blind</span>
              </span>
              <ArrowUpRight className="text-white/50 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" size={20} />
            </div>

            <div className="z-10 relative">
              <p className="text-blue-200 leading-relaxed mb-12 text-[15px]">
                Analyze your token. Understand your risk. Act before narratives form.
              </p>
              <button className="w-full py-3 bg-white text-primary rounded-full font-medium hover:bg-blue-50 transition-colors">
                Analyze Token
              </button>
            </div>

            {/* Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/20 transition-all duration-700 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
