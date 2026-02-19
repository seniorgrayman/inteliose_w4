import { Scan, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";

const ModulesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden border-b border-border/60 bg-card/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center rounded-full border border-border bg-card/80 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground mb-6 shadow-sm">
            Intelligence Modules
          </div>
          <h2 className="text-4xl md:text-5xl text-foreground mb-6 leading-[1.1] font-display font-medium tracking-tighter">
            Activate the Right <br className="hidden md:block" /> Intelligence Module Instantly
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Each module is modular. Founders activate what they need, when they need it. From project profiling to failure mode detection.
          </p>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Project Profile */}
          <div className="group flex flex-col items-center text-center">
            <div className="relative h-48 w-full flex items-center justify-center mb-8">
              <div className="w-64 bg-card rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border p-5 relative z-10 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Scan className="text-primary" size={14} />
                  </div>
                  <div className="text-left space-y-1.5">
                    <div className="h-2 w-24 bg-secondary rounded-full" />
                    <div className="h-1.5 w-16 bg-muted rounded-full" />
                  </div>
                </div>
                <div className="space-y-2.5 mb-5">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary/20 rounded-full group-hover:w-full transition-all duration-1000 ease-out" />
                  </div>
                  <div className="h-1.5 w-5/6 bg-muted rounded-full" />
                </div>
                <div className="flex items-center justify-between border-t border-muted pt-3">
                  <div className="h-1.5 w-10 bg-secondary rounded-full" />
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                    <CheckCircle2 size={10} /> Mapped
                  </span>
                </div>
              </div>
            </div>
            <h3 className="text-lg text-foreground mb-3 tracking-tight">Project Profile Engine</h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Automatically maps your token architecture, liquidity design, and launch structure to identify your category.
            </p>
          </div>

          {/* Risk Baseline */}
          <div className="group flex flex-col items-center text-center">
            <div className="relative h-48 w-full flex items-center justify-center mb-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="238" strokeDashoffset="160" strokeLinecap="round" className="transition-all duration-[1.5s] ease-out" />
                </svg>
                <div className="w-16 h-16 bg-card shadow-[0_10px_30px_-5px_rgba(16,185,129,0.15)] rounded-2xl flex items-center justify-center border border-border z-10 relative transform transition-transform duration-500 group-hover:scale-110">
                  <ShieldAlert className="text-primary" size={24} />
                </div>
              </div>
            </div>
            <h3 className="text-lg text-foreground mb-3 tracking-tight">Risk Baseline Scanner</h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Detects fragility zones before they become public narratives. Identify structural weaknesses early.
            </p>
          </div>

          {/* Failure Mode */}
          <div className="group flex flex-col items-center text-center">
            <div className="relative h-48 w-full flex items-center justify-center mb-8">
              <div className="relative w-64 h-32 pl-4">
                <div className="absolute -top-4 right-2 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border px-3 py-2 rounded-lg text-center z-20 transform transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pattern Detected</span>
                  <span className="text-sm text-foreground flex items-center gap-1">
                    Optics Risk <AlertTriangle className="text-primary" size={12} />
                  </span>
                </div>
                <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
                  <line x1="0" y1="25" x2="240" y2="25" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="55" x2="240" y2="55" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="85" x2="240" y2="85" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
                  <path d="M0,85 C50,80 80,60 120,50 S180,30 240,15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="240" cy="15" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg text-foreground mb-3 tracking-tight">Failure Mode Detection</h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Surfaces the patterns that quietly kill projects. Attention decay, liquidity fragility, and insider optics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
