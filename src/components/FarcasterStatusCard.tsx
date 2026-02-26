import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageCircle, ExternalLink, CheckCircle, AlertCircle, Clock, Radio, Users, Zap, Link2 } from "lucide-react";
import { fetchFarcasterStatus, type FarcasterStatus } from "@/lib/farcaster-api";

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

export default function FarcasterStatusCard() {
  const [status, setStatus] = useState<FarcasterStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchFarcasterStatus();
      setStatus(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <GlassCard>
        <SectionLabel icon={MessageCircle}>Farcaster</SectionLabel>
        <div className="flex items-center gap-3 py-12 justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Clock size={16} className="text-primary" />
          </motion.div>
          <span className="text-sm text-muted-foreground font-display">Loading Farcaster status...</span>
        </div>
      </GlassCard>
    );
  }

  const profile = status?.profile;

  return (
    <GlassCard glow className="relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-500/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <SectionLabel icon={MessageCircle}>Farcaster Integration</SectionLabel>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          {profile?.pfpUrl ? (
            <img
              src={profile.pfpUrl}
              alt={profile.displayName}
              className="w-12 h-12 rounded-full border-2 border-primary/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary/60 border-2 border-primary/20 flex items-center justify-center">
              <MessageCircle size={20} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-display font-medium tracking-tight text-foreground">
              {profile?.displayName || "Inteliose Bot"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile ? `@${profile.username} (FID: ${profile.fid})` : "Not connected"}
            </p>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <InnerCard>
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Status</p>
            <div className="flex items-center gap-2">
              {status?.botActive ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                  <span className="text-sm font-display font-bold text-green-500">Active</span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                  <span className="text-sm font-display font-bold text-zinc-500">Inactive</span>
                </>
              )}
            </div>
          </InnerCard>

          <InnerCard>
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Interactions</p>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary/60" />
              <span className="text-xl font-display font-bold text-foreground tracking-tight">
                {status?.interactionCount ?? 0}
              </span>
            </div>
          </InnerCard>

          <InnerCard>
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Auto-Cast</p>
            <div className="flex items-center gap-2">
              <Zap size={16} className={status?.autoCastEnabled ? "text-green-500" : "text-zinc-500"} />
              <span className={`text-sm font-display font-bold ${status?.autoCastEnabled ? "text-green-500" : "text-zinc-500"}`}>
                {status?.autoCastEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </InnerCard>

          <InnerCard>
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Identity Link</p>
            <div className="flex items-center gap-2">
              {status?.identityLink?.linked ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-display font-bold text-green-500">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-amber-500" />
                  <span className="text-sm font-display font-bold text-amber-500">Unlinked</span>
                </>
              )}
            </div>
          </InnerCard>
        </div>

        {/* Warpcast Link */}
        {profile?.username && (
          <a
            href={`https://warpcast.com/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            View on Warpcast <ExternalLink size={10} />
          </a>
        )}
      </div>
    </GlassCard>
  );
}
