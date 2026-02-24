import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileCode, Copy, Check, ExternalLink, Tag, Globe, Cpu, Clock, Loader } from "lucide-react";
import { fetchAgentCard, type AgentCard } from "@/lib/inteliose-api";

const GlassCard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative rounded-[20px] md:rounded-[28px]
        bg-gradient-to-b from-card/80 to-card/60
        backdrop-blur-3xl
        border border-[hsl(var(--border)/0.4)]
        p-5 md:p-9
        shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(0_0%_0%/0.08),0_2px_8px_-2px_hsl(0_0%_0%/0.06)]
        ${glow ? 'shadow-[0_1px_0_0_hsl(0_0%_100%/0.6)_inset,0_-1px_0_0_hsl(0_0%_0%/0.04)_inset,0_20px_60px_-15px_hsl(var(--primary)/0.1),0_2px_8px_-2px_hsl(0_0%_0%/0.06)]' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.8)] to-transparent rounded-t-[28px] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_0%/0.06)] to-transparent rounded-b-[28px] pointer-events-none" />
      {children}
    </motion.div>
  );
};

const InnerCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gradient-to-b from-secondary/50 to-secondary/30 rounded-[20px] border border-[hsl(var(--border)/0.4)] p-5 shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.05)] ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="flex items-center gap-2.5 mb-5">
    {Icon ? (
      <div className="w-7 h-7 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
        <Icon size={13} className="text-primary" />
      </div>
    ) : (
      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
    )}
    <span className="text-xs font-display font-semibold text-muted-foreground tracking-widest uppercase">{children}</span>
  </div>
);

export default function AgentCardPreview() {
  const [card, setCard] = useState<AgentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAgentCard();
      setCard(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleCopyJson = () => {
    if (!card) return;
    navigator.clipboard.writeText(JSON.stringify(card, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <GlassCard>
        <SectionLabel icon={FileCode}>Agent Card</SectionLabel>
        <div className="flex items-center gap-3 py-12 justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader size={16} className="text-primary" />
          </motion.div>
          <span className="text-sm text-muted-foreground font-display">Loading agent card...</span>
        </div>
      </GlassCard>
    );
  }

  if (!card) {
    return (
      <GlassCard>
        <SectionLabel icon={FileCode}>Agent Card</SectionLabel>
        <div className="text-center py-12">
          <FileCode size={32} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/60 font-display mb-2">Agent Card unavailable</p>
          <p className="text-xs text-muted-foreground/40 max-w-sm mx-auto leading-relaxed">
            Start the backend server to see the live Agent Card. Run: <code className="text-xs bg-secondary/60 px-1.5 py-0.5 rounded">cd server && npm run dev</code>
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Overview */}
      <GlassCard glow className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <SectionLabel icon={FileCode}>A2A Agent Card</SectionLabel>
              <h2 className="text-3xl font-display font-medium tracking-tighter text-foreground mb-1">
                {card.name}
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">{card.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-display font-bold text-primary bg-primary/8 border border-primary/15 rounded-full px-3 py-1">
                v{card.version}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Protocol</p>
              <p className="text-lg font-display font-bold text-foreground">A2A v{card.protocolVersion}</p>
            </InnerCard>
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Provider</p>
              <p className="text-lg font-display font-bold text-foreground">{card.provider.organization}</p>
            </InnerCard>
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Capabilities</p>
              <div className="flex gap-2">
                <span className={`text-xs font-display px-2 py-1 rounded-lg border ${card.capabilities.streaming ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-secondary/40 border-border/30 text-muted-foreground/50'}`}>
                  Streaming {card.capabilities.streaming ? "On" : "Off"}
                </span>
              </div>
            </InnerCard>
          </div>
        </div>
      </GlassCard>

      {/* Skills */}
      <GlassCard>
        <SectionLabel icon={Cpu}>Skills ({card.skills.length})</SectionLabel>
        <div className="space-y-4">
          {card.skills.map((skill, idx) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <InnerCard>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-display font-bold text-foreground mb-1">{skill.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{skill.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/50 bg-secondary/60 px-2 py-1 rounded-lg shrink-0 ml-3">
                    {skill.id}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] font-display text-primary/70 bg-primary/5 border border-primary/10 rounded-full px-2.5 py-1"
                    >
                      <Tag size={8} />
                      {tag}
                    </span>
                  ))}
                </div>
              </InnerCard>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Raw JSON */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <SectionLabel icon={Globe}>Discovery Endpoint</SectionLabel>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 text-xs font-display text-primary bg-primary/8 border border-primary/15 rounded-xl px-3 py-1.5 hover:bg-primary/12 transition-all"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy JSON"}
          </motion.button>
        </div>

        <div className="text-xs text-muted-foreground mb-3 font-mono bg-secondary/40 border border-border/30 rounded-xl px-4 py-2.5">
          GET /.well-known/agent-card.json
        </div>

        <div className="bg-[hsl(var(--card)/0.8)] border border-[hsl(var(--border)/0.3)] rounded-2xl p-4 max-h-80 overflow-y-auto">
          <pre className="text-[11px] font-mono text-foreground/70 leading-relaxed whitespace-pre-wrap break-words">
            {JSON.stringify(card, null, 2)}
          </pre>
        </div>

        <div className="bg-gradient-to-b from-secondary/40 to-secondary/20 border border-[hsl(var(--border)/0.3)] rounded-xl px-4 py-3 mt-4">
          <p className="text-[11px] text-muted-foreground/40 italic leading-relaxed">
            This Agent Card is served at <code className="text-[10px] bg-secondary/60 px-1 py-0.5 rounded">/.well-known/agent-card.json</code> per the A2A protocol specification. Other A2A-compatible agents use this to discover Inteliose's capabilities.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
