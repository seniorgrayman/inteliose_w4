import { ArrowDown, AlertCircle, ArrowRight } from "lucide-react";
import darkTexture from "@/assets/dark-texture.jpg";

const ContextSection = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-12">
      {/* Col 1: Text */}
      <div className="lg:col-span-4 flex flex-col justify-between space-y-12 py-4">
        <div className="flex justify-between border-b border-border pb-4">
          <span className="text-sm text-foreground">01</span>
          <span className="text-xs text-muted-foreground tracking-wide">CONTEXT</span>
        </div>

        <div>
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
            Market Reality
          </div>
          <h3 className="text-3xl text-foreground leading-tight mb-6 font-display font-medium tracking-tighter">
            Founder Intelligence <br />
            <span className="text-muted-foreground">for the Base Ecosystem</span>
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            Inteliose is not a token rating site. It's not investigative surveillance. It's proactive intelligence designed for builders.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            We help founders classify profiles, identify risk baselines, and detect early-stage failure modes.
          </p>

          <button className="group flex items-center gap-3 bg-primary text-white pl-5 pr-2 py-2 rounded-full text-base font-medium hover:opacity-90 transition-all">
            <span>See How It Works</span>
            <span className="bg-white text-primary rounded-full w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDown size={16} />
            </span>
          </button>
        </div>
      </div>

      {/* Col 2: Card Light */}
      <div className="lg:col-span-4 relative group cursor-pointer">
        <div className="relative h-[550px] w-full rounded-3xl overflow-hidden bg-secondary">
          {/* Chart SVG */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <svg viewBox="0 0 200 100" className="w-full px-8 text-muted-foreground fill-current">
              <path d="M0,100 L20,80 L40,90 L60,50 L80,60 L100,20 L120,40 L140,10 L160,30 L180,5 L200,0 V100 H0 Z" className="opacity-20" />
              <path d="M0,100 L20,80 L40,90 L60,50 L80,60 L100,20 L120,40 L140,10 L160,30 L180,5 L200,0" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />

          <div className="absolute top-6 left-6 text-foreground">
            <p className="text-lg tracking-tight font-semibold">Structural Failure</p>
            <p className="text-sm text-muted-foreground">Since 2021</p>
          </div>

          <div className="absolute bottom-6 w-full px-6 flex flex-col justify-end text-foreground">
            <p className="text-3xl font-display font-medium tracking-tighter mb-2">Over 50% Inactive</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Over half of crypto tokens launched since 2021 are now inactive. Failure is common. Blind spots are optional.
            </p>
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full text-xs border border-border shadow-sm">
              <AlertCircle className="text-primary" size={14} />
              Built for signal, not noise
            </div>
          </div>
        </div>
      </div>

      {/* Col 3: Card Dark */}
      <div className="lg:col-span-4 relative group cursor-pointer">
        <div className="relative h-[550px] w-full rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-surface-dark">
            <img src={darkTexture} alt="" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(221,100%,50%)]/20 to-black/60 mix-blend-overlay" />
          </div>

          <div className="absolute top-6 left-6 text-white">
            <p className="text-lg tracking-tight">Why Base</p>
            <p className="text-sm text-gray-400">L2 Scalability</p>
          </div>

          <div className="absolute bottom-6 w-full px-6 flex justify-between items-end text-white">
            <div className="max-w-[90%]">
              <p className="text-xl mb-2 font-display font-medium tracking-tighter">Built for Scale</p>
              <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                Inteliose runs on Base for a reason. Low-cost transactions, Ethereum-grade security, and seamless Coinbase ecosystem access.
              </p>
              <button className="flex items-center gap-2 bg-white text-foreground px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition">
                Explore Ecosystem <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContextSection;
