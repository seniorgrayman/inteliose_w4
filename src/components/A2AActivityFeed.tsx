import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Activity, CheckCircle, XCircle, Clock, Loader, BarChart2, Zap, RefreshCw } from "lucide-react";
import { fetchA2AStats, fetchA2ATasks, type A2AStats, type A2ATask } from "@/lib/inteliose-api";

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

function getStateIcon(state: string) {
  switch (state) {
    case "completed": return <CheckCircle size={14} className="text-green-500" />;
    case "failed": return <XCircle size={14} className="text-red-500" />;
    case "working": return <Loader size={14} className="text-amber-500 animate-spin" />;
    case "pending": return <Clock size={14} className="text-muted-foreground" />;
    case "canceled": return <XCircle size={14} className="text-muted-foreground/50" />;
    default: return <Clock size={14} className="text-muted-foreground" />;
  }
}

function getStateColor(state: string) {
  switch (state) {
    case "completed": return "text-green-500";
    case "failed": return "text-red-500";
    case "working": return "text-amber-500";
    default: return "text-muted-foreground";
  }
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

function extractSkillFromTask(task: A2ATask): string {
  for (const artifact of task.artifacts) {
    if (artifact.name) return artifact.name.replace("-result", "");
  }
  for (const msg of task.messages) {
    for (const part of msg.parts) {
      if (part.type === "data" && (part as any).data?.skillId) {
        return (part as any).data.skillId;
      }
    }
  }
  return "unknown";
}

export default function A2AActivityFeed() {
  const [stats, setStats] = useState<A2AStats | null>(null);
  const [tasks, setTasks] = useState<A2ATask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [s, t] = await Promise.all([fetchA2AStats(), fetchA2ATasks(20)]);
    setStats(s);
    setTasks(t);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <GlassCard glow className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <SectionLabel icon={Activity}>A2A Activity</SectionLabel>
              <h2 className="text-3xl font-display font-medium tracking-tighter text-foreground mb-1">
                Agent-to-Agent Requests
              </h2>
              <p className="text-sm text-muted-foreground">Incoming requests from other A2A agents.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-gradient-to-b from-secondary/70 to-secondary/40 border border-[hsl(var(--border)/0.4)] text-muted-foreground hover:text-foreground transition-all"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Total</p>
              <p className="text-3xl font-display font-bold text-foreground tracking-tight">{stats?.total ?? 0}</p>
            </InnerCard>
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Completed</p>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-3xl font-display font-bold text-green-500 tracking-tight">{stats?.completed ?? 0}</p>
              </div>
            </InnerCard>
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Working</p>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <p className="text-3xl font-display font-bold text-amber-500 tracking-tight">{stats?.working ?? 0}</p>
              </div>
            </InnerCard>
            <InnerCard>
              <p className="text-[10px] text-muted-foreground/60 mb-2 font-display font-bold uppercase tracking-[0.15em]">Failed</p>
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-500/60" />
                <p className="text-3xl font-display font-bold text-red-500/60 tracking-tight">{stats?.failed ?? 0}</p>
              </div>
            </InnerCard>
          </div>
        </div>
      </GlassCard>

      {/* Task Feed */}
      <GlassCard>
        <SectionLabel icon={BarChart2}>Recent Requests</SectionLabel>

        {loading && tasks.length === 0 ? (
          <div className="flex items-center gap-3 py-12 justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader size={16} className="text-primary" />
            </motion.div>
            <span className="text-sm text-muted-foreground font-display">Loading activity...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={32} className="text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground/60 font-display mb-2">No A2A requests yet</p>
            <p className="text-xs text-muted-foreground/40 max-w-sm mx-auto leading-relaxed">
              When other AI agents discover Inteliose via the A2A protocol and request token analysis, their requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between py-3.5 px-4 rounded-2xl border border-[hsl(var(--border)/0.3)] hover:bg-primary/[0.02] transition-all group"
              >
                <div className="flex items-center gap-3">
                  {getStateIcon(task.status.state)}
                  <div>
                    <p className="text-sm font-display font-semibold text-foreground">
                      {extractSkillFromTask(task)}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50">
                      {task.id.slice(0, 8)}... | {formatTime(task.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-display font-bold uppercase tracking-wider ${getStateColor(task.status.state)}`}>
                  {task.status.state}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
