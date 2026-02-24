import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, ExternalLink, Star, Users, CheckCircle, AlertCircle, Clock, Fingerprint } from "lucide-react";
import { fetchAgentIdentity, fetchAgentReputation, type AgentIdentity, type AgentReputation } from "@/lib/inteliose-api";

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

export default function AgentStatusCard() {
  const [identity, setIdentity] = useState<AgentIdentity | null>(null);
  const [reputation, setReputation] = useState<AgentReputation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [id, rep] = await Promise.all([fetchAgentIdentity(), fetchAgentReputation()]);
      setIdentity(id);
      setReputation(rep);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <GlassCard>
        <SectionLabel icon={Fingerprint}>Agent Identity</SectionLabel>
        <div className="flex items-center gap-3 py-12 justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Clock size={16} className="text-primary" />
          </motion.div>
          <span className="text-sm text-muted-foreground font-display">Loading agent status...</span>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <GlassCard glow className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <SectionLabel icon={Fingerprint}>ERC-8004 Agent Identity</SectionLabel>
          <h2 className="text-3xl font-display font-medium tracking-tighter text-foreground mb-1">
            Inteliose Agent
          </h2>
          <p className="text-sm text-muted-foreground mb-6">On-chain identity powered by ERC-8004 on Base.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Registration Status</p>
              <div className="flex items-center gap-2">
                {identity?.registered ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                    <span className="text-lg font-display font-bold text-green-500">Registered</span>
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />
                    <span className="text-lg font-display font-bold text-amber-500">Pending</span>
                  </>
                )}
              </div>
            </InnerCard>

            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Agent ID</p>
              <p className="text-lg font-display font-bold text-foreground tracking-tight">
                {identity?.agentId ? `#${identity.agentId}` : "Not assigned"}
              </p>
            </InnerCard>
          </div>

          {/* Contract Info */}
          <InnerCard className="mb-4">
            <p className="text-[10px] text-muted-foreground/60 mb-3 font-display font-bold uppercase tracking-[0.15em]">Contract Details</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Identity Registry</span>
                <span className="text-xs font-mono text-foreground/70">
                  {(identity?.registryAddress || identity?.contracts?.identityRegistry || "").slice(0, 10)}...
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Chain</span>
                <span className="text-xs font-display font-semibold text-foreground">
                  {identity?.chain || identity?.contracts?.chain || "base"}
                </span>
              </div>
              {(identity?.scanUrl || identity?.agentId) && (
                <a
                  href={identity.scanUrl || `https://www.8004scan.io/agents/base/${identity.agentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  View on 8004scan.io <ExternalLink size={10} />
                </a>
              )}
            </div>
          </InnerCard>
        </div>
      </GlassCard>

      {/* Reputation Card */}
      <GlassCard>
        <SectionLabel icon={Star}>On-Chain Reputation</SectionLabel>
        <p className="text-sm text-muted-foreground mb-6">Reputation score from the ERC-8004 Reputation Registry.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <InnerCard>
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Score</p>
            <p className="text-3xl font-display font-bold text-primary tracking-tight">
              {reputation?.averageScore ?? 0}
              <span className="text-lg text-muted-foreground/40">/{reputation?.maxScore ?? 100}</span>
            </p>
          </InnerCard>
          <InnerCard>
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Reviews</p>
            <div className="flex items-center gap-2">
              <Star size={18} className="text-primary/60" />
              <p className="text-3xl font-display font-bold text-foreground tracking-tight">{reputation?.feedbackCount ?? 0}</p>
            </div>
          </InnerCard>
          <InnerCard>
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Unique Clients</p>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary/60" />
              <p className="text-3xl font-display font-bold text-foreground tracking-tight">{reputation?.clients?.length ?? 0}</p>
            </div>
          </InnerCard>
        </div>

        {!identity?.registered && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-display font-semibold text-amber-500 mb-1">Registration Required</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Inteliose needs to be registered on the ERC-8004 Identity Registry (Base chain) to start building on-chain reputation. Set <code className="text-xs bg-secondary/60 px-1.5 py-0.5 rounded">INTELIOSE_AGENT_ID</code> in the server environment after registration.
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
