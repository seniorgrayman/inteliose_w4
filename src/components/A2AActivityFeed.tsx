import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Activity, CheckCircle, XCircle, Clock, Loader, BarChart2, Zap, RefreshCw, BookOpen, X, Copy, Check, Terminal, Search, Shield, Heart, ChevronRight } from "lucide-react";
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

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-black border border-white/10 rounded-xl p-4 text-[11px] leading-relaxed text-white/80 font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-white/15 border border-white/20 text-white/70 hover:text-white hover:bg-white/25 transition-all"
      >
        {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function DocsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] bg-gradient-to-b from-card to-card/95 backdrop-blur-3xl border border-[hsl(var(--border)/0.4)] shadow-[0_25px_80px_-15px_hsl(0_0%_0%/0.4)]"
          >
            {/* Top shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_100%/0.6)] to-transparent rounded-t-[24px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-[hsl(var(--border)/0.3)] px-7 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BookOpen size={14} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground tracking-tight">A2A API Documentation</h3>
                  <p className="text-[11px] text-muted-foreground/60">Agent-to-Agent Protocol endpoints</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="px-7 py-6 space-y-8">
              {/* Overview */}
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Inteliose exposes an <span className="text-foreground font-semibold">A2A (Agent-to-Agent)</span> JSON-RPC 2.0 API that allows other AI agents and developers to request cryptocurrency token analysis. All endpoints are publicly accessible at <code className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono">https://www.daointel.io</code>.
                </p>
              </div>

              {/* Step 1: Discover */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">1</div>
                  <div className="flex items-center gap-2">
                    <Search size={14} className="text-primary/70" />
                    <h4 className="text-sm font-display font-bold text-foreground">Discover the Agent</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ml-8">
                  Fetch the agent card to discover Inteliose's capabilities, supported skills, and protocol version. This is the standard A2A discovery mechanism.
                </p>
                <div className="ml-8">
                  <CopyBlock code='curl https://www.daointel.io/.well-known/agent-card.json' />
                </div>
                <p className="text-[11px] text-muted-foreground/50 ml-8">
                  Returns the agent's name, skills (token-health-check, risk-baseline), input/output modes, and provider information.
                </p>
              </div>

              {/* Step 2: Health Check */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">2</div>
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-primary/70" />
                    <h4 className="text-sm font-display font-bold text-foreground">Run a Token Health Check</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ml-8">
                  Send a token address to get a full AI-powered DYOR analysis. Returns a health verdict (GREEN/YELLOW/RED), risk assessment, failure modes, and actionable recommendations. Supports tokens on <span className="text-foreground font-medium">Base</span> and <span className="text-foreground font-medium">Solana</span>.
                </p>
                <div className="ml-8">
                  <CopyBlock code={`curl -X POST https://www.daointel.io/a2a \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "SendMessage",
    "params": {
      "message": {
        "role": "user",
        "parts": [{
          "type": "text",
          "text": "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed on Base"
        }]
      }
    }
  }'`} />
                </div>
                <p className="text-[11px] text-muted-foreground/50 ml-8">
                  The agent auto-detects the token address and chain from the text. You can also pass a Solana address for Solana tokens.
                </p>
              </div>

              {/* Step 3: Risk Baseline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">3</div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-primary/70" />
                    <h4 className="text-sm font-display font-bold text-foreground">Quick Risk Baseline Scan</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ml-8">
                  A fast, lightweight security scan without AI calls. Returns security flags (hidden owner, proxy, mintable, blacklist), buy/sell taxes, liquidity metrics, and ownership status.
                </p>
                <div className="ml-8">
                  <CopyBlock code={`curl -X POST https://www.daointel.io/a2a \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "SendMessage",
    "params": {
      "message": {
        "role": "user",
        "parts": [{
          "type": "data",
          "mimeType": "application/json",
          "data": {
            "skillId": "risk-baseline",
            "input": {
              "tokenAddress": "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
              "chain": "Base"
            }
          }
        }]
      }
    }
  }'`} />
                </div>
              </div>

              {/* Step 4: Check Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">4</div>
                  <div className="flex items-center gap-2">
                    <BarChart2 size={14} className="text-primary/70" />
                    <h4 className="text-sm font-display font-bold text-foreground">View Activity & Stats</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ml-8">
                  Monitor A2A activity with these read-only endpoints.
                </p>
                <div className="ml-8 space-y-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5"><ChevronRight size={10} /> <span className="text-foreground font-medium">Get aggregate stats</span> (total, completed, working, failed)</p>
                    <CopyBlock code="curl https://www.daointel.io/api/intel/a2a/stats" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5"><ChevronRight size={10} /> <span className="text-foreground font-medium">List recent tasks</span> (with full request/response data)</p>
                    <CopyBlock code="curl https://www.daointel.io/api/intel/a2a/tasks?limit=20" />
                  </div>
                </div>
              </div>

              {/* Step 5: ERC-8004 Identity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">5</div>
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-primary/70" />
                    <h4 className="text-sm font-display font-bold text-foreground">ERC-8004 Identity Endpoints</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ml-8">
                  Query on-chain agent identity and reputation from the ERC-8004 registries on Base.
                </p>
                <div className="ml-8 space-y-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5"><ChevronRight size={10} /> <span className="text-foreground font-medium">Agent identity</span> (registration status, owner, token URI)</p>
                    <CopyBlock code="curl https://www.daointel.io/api/intel/erc8004/agent" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5"><ChevronRight size={10} /> <span className="text-foreground font-medium">Reputation score</span> (feedback count, average score, clients)</p>
                    <CopyBlock code="curl https://www.daointel.io/api/intel/erc8004/reputation" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5"><ChevronRight size={10} /> <span className="text-foreground font-medium">Lookup any agent</span> (replace ID with any registered agent)</p>
                    <CopyBlock code="curl https://www.daointel.io/api/intel/erc8004/lookup/19333" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5"><ChevronRight size={10} /> <span className="text-foreground font-medium">Registration metadata</span></p>
                    <CopyBlock code="curl https://www.daointel.io/erc8004-registration.json" />
                  </div>
                </div>
              </div>

              {/* Response Format */}
              <div className="bg-secondary/30 border border-[hsl(var(--border)/0.3)] rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">Response Format</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All A2A responses follow JSON-RPC 2.0. The <code className="text-[10px] bg-primary/10 text-primary px-1 py-0.5 rounded font-mono">result.task</code> object contains the task state, messages, and artifacts. Artifacts hold the structured analysis data. Tasks progress through states: <span className="text-amber-400 font-medium">pending</span> <span className="text-muted-foreground/40 mx-0.5">&rarr;</span> <span className="text-amber-500 font-medium">working</span> <span className="text-muted-foreground/40 mx-0.5">&rarr;</span> <span className="text-green-500 font-medium">completed</span> or <span className="text-red-500 font-medium">failed</span>.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function A2AActivityFeed() {
  const [stats, setStats] = useState<A2AStats | null>(null);
  const [tasks, setTasks] = useState<A2ATask[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsOpen, setDocsOpen] = useState(false);

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
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDocsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-b from-secondary/70 to-secondary/40 border border-[hsl(var(--border)/0.4)] text-muted-foreground hover:text-foreground transition-all text-xs font-display font-semibold"
              >
                <BookOpen size={13} />
                Docs
              </motion.button>
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

      <DocsModal open={docsOpen} onClose={() => setDocsOpen(false)} />

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
