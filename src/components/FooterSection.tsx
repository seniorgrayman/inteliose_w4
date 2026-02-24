import { ArrowRight, Radar, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import footerBgVideo from "@/assets/footer-bg-video.mp4";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FooterSection = () => {
  return (
    <footer className="mt-8 w-full rounded-4xl overflow-hidden relative shadow-2xl border border-[hsl(var(--glass-border))]">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src={footerBgVideo} type="video/mp4" />
        </video>
      </div>
      {/* Glow */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      {/* CTA */}
      <div className="pt-24 pb-16 px-8 text-center relative z-10">
        <div className="mx-auto w-20 h-20 bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_40px_rgba(0,0,255,0.15)] backdrop-blur-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
            <Radar className="text-blue-400 drop-shadow-[0_0_8px_rgba(0,0,255,0.5)]" size={24} />
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary mb-6 font-display font-medium tracking-tighter">Don't Launch Blind.</h2>
        <p className="text-primary/70 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Analyze your token. Understand your risk. Act before narratives form.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard" className="px-8 py-3 rounded-full bg-gradient-to-b from-primary to-blue-800 text-white hover:brightness-110 transition-all shadow-[0_0_25px_rgba(0,0,255,0.2)] flex items-center gap-2 border border-primary/20">
            Analyze Your Token Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent w-full my-8 opacity-50" />

      {/* Links */}
      <div className="px-8 md:px-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-3xl text-primary font-display font-medium tracking-tighter">inteliose™</h3>
          <p className="text-primary/60 text-sm leading-relaxed max-w-sm">
            Founder-Centric Token Intelligence. Built on Base. Powered by structural risk detection.
          </p>
          <p className="text-primary/40 text-xs max-w-sm">
            Inteliose provides intelligence tools and risk analysis. It does not provide financial advice.
          </p>
          <div className="flex gap-4 pt-2">
            {/* X (Twitter) */}
            <a href="https://x.com/inteliose" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors text-primary/70 hover:text-primary border border-primary/20">
              <XIcon size={16} />
            </a>
            {/* Telegram - Coming Soon */}

            <a href="https://t.me/intelliose" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors text-primary/70 hover:text-primary border border-primary/20">
            <button
             
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors text-primary/70 hover:text-primary border border-primary/20"
            >
              <Send size={16} />
            </button>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-12">
          <div className="space-y-6">
            <h4 className="text-primary">Product</h4>
            <ul className="space-y-3 text-sm text-primary/60">
              <li><button onClick={() => scrollTo("modules")} className="hover:text-primary transition-colors">Modules</button></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><button onClick={() => scrollTo("faq")} className="hover:text-primary transition-colors">FAQ</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-primary">Company</h4>
            <ul className="space-y-3 text-sm text-primary/60">
              <li><button onClick={() => scrollTo("context")} className="hover:text-primary transition-colors">About</button></li>
              <li><button onClick={() => scrollTo("how-it-works")} className="hover:text-primary transition-colors">How It Works</button></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
