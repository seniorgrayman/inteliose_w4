import { ArrowRight, Radar, Twitter, MessageCircle, Circle } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="mt-8 w-full bg-[hsl(0_0%_2%)] rounded-4xl overflow-hidden relative shadow-2xl border border-[hsl(var(--glass-border))]">
      {/* Glow */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      {/* CTA */}
      <div className="pt-24 pb-16 px-8 text-center relative z-10">
        <div className="mx-auto w-20 h-20 bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_40px_rgba(0,0,255,0.15)] backdrop-blur-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
            <Radar className="text-blue-400 drop-shadow-[0_0_8px_rgba(0,0,255,0.5)]" size={24} />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 font-display font-medium tracking-tighter">Don't Launch Blind.</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Analyze your token. Understand your risk. Act before narratives form.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-3 rounded-full bg-gradient-to-b from-primary to-blue-800 text-white hover:brightness-110 transition-all shadow-[0_0_25px_rgba(0,0,255,0.2)] flex items-center gap-2 border border-primary/20">
            Analyze Your Token Now <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-8 opacity-50" />

      {/* Links */}
      <div className="px-8 md:px-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-3xl text-white font-display font-medium tracking-tighter">inteliose™</h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Founder-Centric Token Intelligence. Built on Base. Powered by structural risk detection.
          </p>
          <p className="text-gray-600 text-xs max-w-sm">
            Inteliose provides intelligence tools and risk analysis. It does not provide financial advice.
          </p>
          <div className="flex gap-4 pt-2">
            {[Twitter, MessageCircle, Circle].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white border border-white/5">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-12">
          <div className="space-y-6">
            <h4 className="text-white">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Modules</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Docs</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-white">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
