"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import WalletConnectModal from "@/components/wallet-connect-modal";
import { useSolanaWallet } from "@/lib/solana/use-solana-wallet";
import { useRouter } from "next/navigation";
import { useIntelSummary } from "@/lib/intel/use-intel-summary";
import type {
  AiDiagnosis,
  Category,
  IntelSummary,
  Intent,
  LaunchPlatform,
  LaunchType,
  ProfileModel,
  Stage,
} from "@/lib/intel/types";

type Model = ProfileModel;

const STEPS = [
  { key: "token", label: "Token" },
  { key: "stage", label: "Stage" },
  { key: "context", label: "Context" },
  { key: "intent", label: "Intent" },
  { key: "snapshot", label: "Snapshot" },
  { key: "next", label: "Dashboard" },
] as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ name }: { name: "spark" | "shield" | "link" | "arrow" }) {
  const common = "h-4 w-4";
  if (name === "spark") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l1.3 5.1L18 9l-4.7 1.9L12 16l-1.3-5.1L6 9l4.7-1.9L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 14l.7 2.6L8 18l-2.3.4L5 21l-.7-2.6L2 18l2.3-.4L5 14Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M19 13l.8 3L22 17l-2.2.4L19 20l-.8-3L16 17l2.2-.4L19 13Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l8 4v7c0 5-3.2 8.7-8 9-4.8-.3-8-4-8-9V6l8-4Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 12l2 2 4-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "link") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path
          d="M10 13a5 5 0 0 1 0-7l1.2-1.2a5 5 0 0 1 7 7L17 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M14 11a5 5 0 0 1 0 7l-1.2 1.2a5 5 0 0 1-7-7L7 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none">
      <path
        d="M10 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlassCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.65)] sm:p-8">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.35),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.30),transparent_60%),radial-gradient(circle_at_40%_80%,rgba(236,72,153,0.16),transparent_60%)] blur-2xl" />
      <div className="relative">
        <div className="text-xs font-semibold tracking-wider text-white/55">
          INTELIOSE — Diagnosis Flow
        </div>
        <h2 className="mt-2 text-pretty text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-white/65">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.55)] transition",
        "bg-[linear-gradient(90deg,rgba(34,211,238,0.22),rgba(99,102,241,0.18),rgba(236,72,153,0.14))]",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_24px_80px_rgba(0,0,0,0.65)]",
        disabled &&
          "cursor-not-allowed opacity-50 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.55)]"
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function ChoiceCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group w-full rounded-2xl border px-5 py-4 text-left transition",
        selected
          ? "border-cyan-300/40 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_24px_70px_rgba(0,0,0,0.55)]"
          : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs leading-5 text-white/60">
            {description}
          </div>
        </div>
        <div
          className={cx(
            "mt-0.5 h-5 w-5 rounded-full border transition",
            selected
              ? "border-cyan-200/70 bg-cyan-300/15 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
              : "border-white/20 bg-white/5"
          )}
        />
      </div>
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-semibold tracking-wider text-white/55">
        {label}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-2xl border border-white/10 bg-black/25 px-4 pr-10 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {options.find((o) => o.value === value)?.hint ? (
        <div className="mt-2 text-xs leading-5 text-white/55">
          {options.find((o) => o.value === value)?.hint}
        </div>
      ) : null}
    </label>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-semibold tracking-wider text-white/55">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/55">{hint}</div> : null}
    </div>
  );
}

function fmtPct(v: number | null) {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return `${v.toFixed(v < 1 ? 2 : 1)}%`;
}

function fmtMoney(v: number | null) {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(4)}`;
}

function fmtNum(v: number | null) {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function StageLabel(s: Stage) {
  if (s === "pre-launch") return "Pre-launch";
  if (s === "live") return "Live (0–72h)";
  if (s === "post-launch") return "Post-launch";
  return "Revival / Declining";
}

function IntentLabel(i: Intent) {
  if (i === "fast-flip") return "Fast flip";
  if (i === "medium") return "Medium-term growth";
  return "Long-term ecosystem";
}

function PlatformLabel(p: LaunchPlatform) {
  if (p === "pumpfun") return "Pumpfun";
  if (p === "bags") return "Bags";
  if (p === "raydium") return "Raydium";
  if (p === "moonshot") return "Moonshot";
  return "Launchmytoken";
}

function CategoryLabel(c: Category) {
  if (c === "ai") return "AI";
  if (c === "meme") return "Meme";
  if (c === "defi") return "Defi";
  if (c === "gamify") return "Gamify";
  if (c === "nft") return "NFT";
  if (c === "socialfi") return "SocialFi";
  if (c === "dao") return "DAO";
  return "Utility";
}

function LaunchTypeLabel(t: LaunchType) {
  if (t === "meme") return "Meme";
  if (t === "liquidity") return "Liquidity";
  return "IDO";
}

function deriveSnapshot(model: Model) {
  const chain = "Solana";
  const stage = model.stage;
  const launchPlatform = model.launchPlatform;
  const launchType = model.launchType;
  const category = model.category;
  const intent = model.intent;

  let riskBaseline: "Low" | "Moderate" | "Elevated" | "Critical" = "Moderate";
  const failureModes: string[] = [];

  // Launchpads tend to compress the lifecycle; meme-style launches amplify churn.
  const isLaunchpad = launchPlatform === "pumpfun" || launchPlatform === "moonshot" || launchPlatform === "bags";
  if (isLaunchpad && launchType === "meme") {
    riskBaseline = "Elevated";
    failureModes.push("Early volume collapse", "Attention decay < 48h", "Insider optics");
  } else if (launchType === "ido") {
    riskBaseline = "Moderate";
    failureModes.push("Expectation mismatch", "Liquidity perception risk");
  } else if (launchType === "liquidity") {
    riskBaseline = "Moderate";
    failureModes.push("Liquidity thin-out", "Holder formation volatility");
  }

  if (category === "meme") failureModes.push("Attention decay", "Optics-driven sell waves");
  if (category === "ai") failureModes.push("Narrative fragility", "Trust sensitivity");
  if (category === "defi") failureModes.push("Liquidity shock risk", "Sustainability drift");

  if (stage === "live") {
    riskBaseline = riskBaseline === "Elevated" ? "Critical" : "Elevated";
    failureModes.unshift("Intervention window mis-timing");
  }

  if (stage === "post-launch") {
    failureModes.push("Sustainability drift", "Compounding trust decay");
  }

  if (intent === "fast-flip") {
    failureModes.push("Take-profit optics backlash", "Aggressive decay blindsides");
  } else if (intent === "long") {
    failureModes.push("Trust trajectory penalties", "Dev wallet optics sensitivity");
  } else if (intent === "medium") {
    failureModes.push("Narrative consistency risk", "Holder confidence wobble");
  }

  const primaryFailureModes = Array.from(new Set(failureModes)).slice(0, 4);

  const nextPrompt =
    stage === "pre-launch"
      ? "Let’s sanity-check your tokenomics before you deploy."
      : stage === "live"
        ? "We’re monitoring for early decay signals. First risk check takes 2 minutes."
        : stage === "post-launch"
          ? "Let’s assess holder confidence and sustainability."
          : "Let’s identify what broke, what still has signal, and the best revival move.";

  return {
    chain,
    riskBaseline,
    primaryFailureModes,
    nextPrompt,
  };
}

export default function OnboardingWizard() {
  const router = useRouter();
  const wallet = useSolanaWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [model, setModel] = useState<Model>({
    tokenAddress: "",
    isPrelaunch: false,
    stage: null,
    launchPlatform: null,
    launchType: null,
    category: null,
    intent: null,
    devWallet: "",
    marketingWallet: "",
  });

  const [stepIdx, setStepIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [stepIdx]);

  const snapshot = useMemo(() => deriveSnapshot(model), [model]);

  const intel = useIntelSummary({
    mint: model.tokenAddress,
    devWallet: model.devWallet,
    marketingWallet: model.marketingWallet,
    enabled: !model.isPrelaunch && model.tokenAddress.trim().length >= 10,
  });
  const autoFilledDevRef = useRef(false);

  useEffect(() => {
    if (autoFilledDevRef.current) return;
    if (model.devWallet.trim()) return;
    if (intel.status !== "ready") return;
    const mintAuth = intel.data.mintFacts.mintAuthority;
    if (!mintAuth) return;
    // Best-effort: mint authority is NOT always the dev wallet, but is often the closest on-chain signal pre-launch.
    setModel((m) => ({ ...m, devWallet: mintAuth }));
    autoFilledDevRef.current = true;
  }, [intel.status, model.devWallet, intel, setModel]);

  const canContinue = useMemo(() => {
    const step = STEPS[stepIdx]?.key;
    if (step === "token") return model.isPrelaunch || model.tokenAddress.trim().length >= 10;
    if (step === "stage") return model.stage !== null;
    if (step === "context")
      return model.launchPlatform !== null && model.launchType !== null && model.category !== null;
    if (step === "intent") return model.intent !== null;
    return true;
  }, [model, stepIdx]);

  const goNext = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));

  const persistProfile = () => {
    try {
      const enrichIntelWithLocalMarketCapHistory = (base: IntelSummary | null) => {
        if (!base?.market) return base;
        try {
          const mint = base.mint;
          const key = `dao-intel:mcaps:${mint}`;
          const nowMs = Date.now();
          const marketCapNow = base.market.marketCap ?? null;
          const raw = localStorage.getItem(key);
          const arr = (raw ? (JSON.parse(raw) as Array<{ tMs: number; marketCap: number | null }>) : [])
            .filter((x) => typeof x?.tMs === "number")
            .slice(-2000);
          arr.push({ tMs: nowMs, marketCap: marketCapNow });
          localStorage.setItem(key, JSON.stringify(arr));

          const points = [
            { label: "24h" as const, agoSeconds: 24 * 60 * 60 },
            { label: "15h" as const, agoSeconds: 15 * 60 * 60 },
            { label: "8h" as const, agoSeconds: 8 * 60 * 60 },
            { label: "2h" as const, agoSeconds: 2 * 60 * 60 },
            { label: "1h" as const, agoSeconds: 60 * 60 },
            { label: "20s" as const, agoSeconds: 20 },
          ].map((p) => {
            const targetMs = nowMs - p.agoSeconds * 1000;
            let best: { tMs: number; marketCap: number | null } | null = null;
            let bestDist = Infinity;
            for (const s of arr) {
              const dist = Math.abs(s.tMs - targetMs);
              if (dist < bestDist) {
                best = s;
                bestDist = dist;
              }
            }
            return {
              label: p.label,
              agoSeconds: p.agoSeconds,
              at: best ? new Date(best.tMs).toISOString() : null,
              marketCap: best?.marketCap ?? null,
            };
          });

          return {
            ...base,
            market: {
              ...base.market,
              marketCapHistory: {
                points,
                updatedAt: new Date().toISOString(),
                source: "local" as const,
              },
            },
          } satisfies IntelSummary;
        } catch {
          return base;
        }
      };

      const intelPayload =
        intel.status === "ready" ? enrichIntelWithLocalMarketCapHistory(intel.data) : null;
      const payload = {
        model,
        snapshot,
        intel: intelPayload,
        ai: aiDiagnosis,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("dao-intel:profile", JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const [aiDiagnosis, setAiDiagnosis] = useState<AiDiagnosis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const step = STEPS[stepIdx]?.key;
    if (step !== "snapshot") return;

    // If user selected "no token yet" (or didn't provide a usable mint), do NOT fetch intel or run AI diagnose.
    // This prevents background API calls and avoids showing misleading AI output for pre-launch setup.
    const hasToken = !model.isPrelaunch && model.tokenAddress.trim().length >= 10;
    if (!hasToken) {
      setAiLoading(false);
      setAiDiagnosis(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setAiLoading(true);
        const enrichIntelWithLocalMarketCapHistory = (base: IntelSummary | null) => {
          if (!base?.market) return base;
          try {
            const mint = base.mint;
            const key = `dao-intel:mcaps:${mint}`;
            const nowMs = Date.now();
            const marketCapNow = base.market.marketCap ?? null;
            const raw = localStorage.getItem(key);
            const arr = (raw ? (JSON.parse(raw) as Array<{ tMs: number; marketCap: number | null }>) : [])
              .filter((x) => typeof x?.tMs === "number")
              .slice(-2000);
            arr.push({ tMs: nowMs, marketCap: marketCapNow });
            localStorage.setItem(key, JSON.stringify(arr));

            const points = [
              { label: "24h" as const, agoSeconds: 24 * 60 * 60 },
              { label: "15h" as const, agoSeconds: 15 * 60 * 60 },
              { label: "8h" as const, agoSeconds: 8 * 60 * 60 },
              { label: "2h" as const, agoSeconds: 2 * 60 * 60 },
              { label: "1h" as const, agoSeconds: 60 * 60 },
              { label: "20s" as const, agoSeconds: 20 },
            ].map((p) => {
              const targetMs = nowMs - p.agoSeconds * 1000;
              let best: { tMs: number; marketCap: number | null } | null = null;
              let bestDist = Infinity;
              for (const s of arr) {
                const dist = Math.abs(s.tMs - targetMs);
                if (dist < bestDist) {
                  best = s;
                  bestDist = dist;
                }
              }
              return {
                label: p.label,
                agoSeconds: p.agoSeconds,
                at: best ? new Date(best.tMs).toISOString() : null,
                marketCap: best?.marketCap ?? null,
              };
            });

            return {
              ...base,
              market: {
                ...base.market,
                marketCapHistory: {
                  points,
                  updatedAt: new Date().toISOString(),
                  source: "local" as const,
                },
              },
            } satisfies IntelSummary;
          } catch {
            return base;
          }
        };

        const intelPayload =
          intel.status === "ready" ? enrichIntelWithLocalMarketCapHistory(intel.data) : null;
        const res = await fetch("/api/intel/diagnose", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model,
            snapshot,
            intel: intelPayload,
          }),
        });
        if (!res.ok) {
          if (!cancelled) setAiDiagnosis(null);
          return;
        }
        const json = (await res.json()) as AiDiagnosis;
        if (!cancelled) setAiDiagnosis(json);
      } catch {
        if (!cancelled) setAiDiagnosis(null);
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, model.isPrelaunch, model.tokenAddress]);

  const header = (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          INTELIOSE
        </Link>
        <div className="hidden text-xs text-white/55 sm:block">
          Diagnosis cap: <span className="text-white/75">≤10 minutes</span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => {
            const isDone = i < stepIdx;
            const isActive = i === stepIdx;
            return (
              <div
                key={s.key}
                className={cx(
                  "h-2 w-14 rounded-full border transition",
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300/15 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : isDone
                      ? "border-white/10 bg-white/10"
                      : "border-white/10 bg-white/5"
                )}
                title={s.label}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/55">
          <span className="ai-orb h-2.5 w-2.5 rounded-full" />
          <span>Inference engine</span>
          <span className="ai-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {header}

      <div
        key={animKey}
        className="animate-step"
      >
        {STEPS[stepIdx].key === "token" ? (
          <GlassCard
            title="Token identification"
            subtitle="We’ll adapt guidance based on where you are. You can change this later."
          >
            <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold tracking-wider text-white/55">
                        Token address
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        Paste a Solana mint address.
                      </div>
                    </div>
                    <label className="inline-flex w-[200px] cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-cyan-300"
                        checked={model.isPrelaunch}
                        onChange={(e) =>
                          setModel((m) => ({
                            ...m,
                            isPrelaunch: e.target.checked,
                            tokenAddress: e.target.checked ? "" : m.tokenAddress,
                            devWallet: e.target.checked ? "" : m.devWallet,
                            marketingWallet: e.target.checked ? "" : m.marketingWallet,
                          }))
                        }
                      />
                      no token yet
                    </label>
                  </div>

                  <div className="mt-4">
                    <input
                      value={model.tokenAddress}
                      onChange={(e) =>
                        setModel((m) => ({ ...m, tokenAddress: e.target.value }))
                      }
                      disabled={model.isPrelaunch}
                      placeholder="e.g. 4k3Dyjzvzp8e... (Solana mint)"
                      className={cx(
                        "h-11 w-full rounded-2xl border bg-black/25 px-4 text-sm text-white outline-none transition",
                        model.isPrelaunch
                          ? "cursor-not-allowed border-white/10 opacity-50"
                          : "border-white/10 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15"
                      )}
                    />
                    {/* <div className="mt-2 text-xs text-white/50">
                      Under the hood (MVP): supply, decimals, mint authority, LP state, holders, dev wallet behavior.
                    </div> */}
                  </div>
                </div>

                {!model.isPrelaunch ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-white/55">
                          Wallet optics (MVP)
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          Dev wallet is required. Marketing wallet is optional.
                        </div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                        stage-aware
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input
                        value={model.devWallet}
                        onChange={(e) =>
                          setModel((m) => ({ ...m, devWallet: e.target.value }))
                        }
                        placeholder="Dev wallet address (required)"
                        className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15"
                      />
                      <input
                        value={model.marketingWallet}
                        onChange={(e) =>
                          setModel((m) => ({
                            ...m,
                            marketingWallet: e.target.value,
                          }))
                        }
                        placeholder="Marketing wallet (optional)"
                        className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15"
                      />
                    </div>

                    {intel.status === "ready" && intel.data.mintFacts.mintAuthority ? (
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                        Detected <span className="text-white/80">mint authority</span>:{" "}
                        <span className="font-semibold text-white/80">
                          {intel.data.mintFacts.mintAuthority.slice(0, 6)}…{intel.data.mintFacts.mintAuthority.slice(-6)}
                        </span>
                        <div className="mt-1 text-white/50">
                          Note: mint authority is a best-effort signal and may not be the true dev wallet. Edit if needed.
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/55">
                    <Icon name="spark" />
                    Mode
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-white/75">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-white/90">
                        {model.isPrelaunch ? "Assumptive modeling" : "On-chain observation"}
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        {model.isPrelaunch
                          ? "Simulations rely on founder inputs + category priors."
                          : "We ingest live facts and adapt advice continuously."}
                      </div>
                    </div>
                    {/* <div className="text-xs text-white/45">
                      This fork changes everything downstream.
                    </div> */}
                  </div>
                </div>

                {!model.isPrelaunch ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/55">
                        <Icon name="shield" />
                        Live facts
                      </div>
                      <div className="text-xs text-white/55">
                        {intel.status === "loading"
                          ? "fetching…"
                          : intel.status === "error"
                            ? "degraded"
                            : intel.status === "ready"
                              ? "ok"
                              : "idle"}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <Stat
                        label="Supply (ui)"
                        value={
                          intel.status === "ready"
                            ? fmtNum(intel.data.mintFacts.supplyUi)
                            : "—"
                        }
                      />
                      <Stat
                        label="Holders (best-effort)"
                        value={
                          intel.status === "ready"
                            ? typeof intel.data.holders.holderCount === "number"
                              ? intel.data.holders.holderCount.toLocaleString()
                              : "—"
                            : "—"
                        }
                        hint="Counts token accounts for this mint (no indexer)."
                      />
                      <Stat
                        label="Price (USD)"
                        value={
                          intel.status === "ready"
                            ? fmtMoney(intel.data.market?.priceUsd ?? null)
                            : "—"
                        }
                        hint="Source: DexScreener (best-effort)"
                      />
                      <Stat
                        label="Volume (1h)"
                        value={
                          intel.status === "ready"
                            ? fmtMoney(intel.data.market?.volumeH1 ?? null)
                            : "—"
                        }
                      />
                      <Stat
                        label="Volume (15m)"
                        value={
                          intel.status === "ready"
                            ? fmtMoney(intel.data.market?.volumeM15 ?? null)
                            : "—"
                        }
                      />
                      <Stat
                        label="Dev holdings"
                        value={
                          intel.status === "ready"
                            ? fmtPct(intel.data.devHoldingsPct)
                            : "—"
                        }
                        hint="Computed from dev wallet token accounts"
                      />
                    </div>

                    {intel.status === "error" ? (
                      <div className="mt-3 rounded-xl border border-pink-300/25 bg-pink-400/10 p-3 text-xs text-pink-100">
                        Intelligence fetch failed: {intel.error}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Back to landing
              </Link>
              <PrimaryButton disabled={!canContinue} onClick={goNext}>
                Continue <Icon name="arrow" />
              </PrimaryButton>
            </div>
          </GlassCard>
        ) : null}

        {STEPS[stepIdx].key === "stage" ? (
          <GlassCard
            title="Project stage classification"
            subtitle="This single choice activates or disables entire modules and changes alert sensitivity."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                title="Pre-launch"
                description="Checklist + simulations. Prevent mistakes before they are permanent."
                selected={model.stage === "pre-launch"}
                onClick={() => setModel((m) => ({ ...m, stage: "pre-launch" }))}
              />
              {/* <ChoiceCard
                title="Live (0–72h)"
                description="Real-time decay + intervention windows. Timing matters."
                selected={model.stage === "live"}
                onClick={() => setModel((m) => ({ ...m, stage: "live" }))}
              /> */}
              <ChoiceCard
                title="Post-launch"
                description="Sustainability + attention decay. Trust trajectories dominate."
                selected={model.stage === "post-launch"}
                onClick={() => setModel((m) => ({ ...m, stage: "post-launch" }))}
              />
              {/* <ChoiceCard
                title="Revival / Declining"
                description="Optional in MVP. Diagnose what failed and what still has signal."
                selected={model.stage === "revival"}
                onClick={() => setModel((m) => ({ ...m, stage: "revival" }))}
              /> */}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <SecondaryButton onClick={goBack}>Back</SecondaryButton>
              <PrimaryButton disabled={!canContinue} onClick={goNext}>
                Continue <Icon name="arrow" />
              </PrimaryButton>
            </div>
          </GlassCard>
        ) : null}

        {STEPS[stepIdx].key === "context" ? (
          <GlassCard
            title="Launch context"
            subtitle="This is model selection, not labeling. Dropdowns only."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <Select
                label="Launchpads"
                value={model.launchPlatform ?? ""}
                onChange={(v) =>
                  setModel((m) => ({
                    ...m,
                    launchPlatform: (v || null) as LaunchPlatform | null,
                  }))
                }
                options={[
                  {
                    value: "pumpfun",
                    label: "Pumpfun",
                  },
                  {
                    value: "bags",
                    label: "Bags",
                  },
                  {
                    value: "raydium",
                    label: "Raydium",
                  },
                  {
                    value: "moonshot",
                    label: "Moonshot",
                  },
                  {
                    value: "launchmytoken",
                    label: "Launchmytoken",
                  },
                ]}
              />
              <Select
                label="Launch type"
                value={model.launchType ?? ""}
                onChange={(v) =>
                  setModel((m) => ({
                    ...m,
                    launchType: (v || null) as LaunchType | null,
                  }))
                }
                options={[
                  { value: "meme", label: "Meme" },
                  { value: "liquidity", label: "Liquidity" },
                  { value: "ido", label: "IDO" },
                ]}
              />
              <Select
                label="Token category"
                value={model.category ?? ""}
                onChange={(v) =>
                  setModel((m) => ({
                    ...m,
                    category: (v || null) as Category | null,
                  }))
                }
                options={[
                  { value: "ai", label: "Ai" },
                  { value: "meme", label: "Meme" },
                  { value: "defi", label: "Defi" },
                  { value: "gamify", label: "Gamify" },
                  { value: "nft", label: "NFT" },
                  { value: "socialfi", label: "SocialFi" },
                  { value: "dao", label: "DAO" },
                  { value: "utility", label: "Utility" },
                ]}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/55">
                <Icon name="shield" />
                What the agent infers
              </div>
              <div className="mt-3 text-sm text-white/75">
                Default risk thresholds, expected holder behavior, and typical death patterns.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <SecondaryButton onClick={goBack}>Back</SecondaryButton>
              <PrimaryButton disabled={!canContinue} onClick={goNext}>
                Continue <Icon name="arrow" />
              </PrimaryButton>
            </div>
          </GlassCard>
        ) : null}

        {STEPS[stepIdx].key === "intent" ? (
          <GlassCard
            title="Founder intent"
            subtitle="You are not judged. We align incentives so the same data produces the right advice."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <ChoiceCard
                title="Fast flip"
                description="Earlier take-profit optics warnings. Aggressive decay alerts."
                selected={model.intent === "fast-flip"}
                onClick={() => setModel((m) => ({ ...m, intent: "fast-flip" }))}
              />
              <ChoiceCard
                title="Medium-term growth"
                description="Balance trust + momentum. Avoid the common mid-cycle stall."
                selected={model.intent === "medium"}
                onClick={() => setModel((m) => ({ ...m, intent: "medium" }))}
              />
              <ChoiceCard
                title="Long-term ecosystem"
                description="Trust trajectory emphasis. Dev wallet optics sensitivity."
                selected={model.intent === "long"}
                onClick={() => setModel((m) => ({ ...m, intent: "long" }))}
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <SecondaryButton onClick={goBack}>Back</SecondaryButton>
              <PrimaryButton
                disabled={!canContinue}
                onClick={() => {
                  persistProfile();
                  goNext();
                }}
              >
                Continue <Icon name="arrow" />
              </PrimaryButton>
            </div>
          </GlassCard>
        ) : null}

        {STEPS[stepIdx].key === "snapshot" ? (
          <GlassCard
            title="Instant classification"
            subtitle="Proof of intelligence."
          >
            <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
                  <div className="text-xs font-semibold tracking-wider text-white/55">
                    Project profile detected
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-white/80">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/55">Chain</span>
                      <span className="font-semibold text-white">{snapshot.chain}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/55">Category</span>
                      <span className="font-semibold text-white">
                        {model.category ? CategoryLabel(model.category) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/55">Launch Type</span>
                      <span className="font-semibold text-white">
                        {model.launchType ? LaunchTypeLabel(model.launchType) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/55">Launchpad</span>
                      <span className="font-semibold text-white">
                        {model.launchPlatform ? PlatformLabel(model.launchPlatform) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/55">Stage</span>
                      <span className="font-semibold text-white">
                        {model.stage ? StageLabel(model.stage) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/55">Founder Intent</span>
                      <span className="font-semibold text-white">
                        {model.intent ? IntentLabel(model.intent) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  {model.isPrelaunch || model.tokenAddress.trim().length < 10 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                      No token yet selected — we’ll skip diagnosis until you paste a token CA.
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold tracking-wider text-white/55">
                      Risk baseline{aiLoading ? " (analyzing…)" : ""}
                    </div>
                    <div
                      className={cx(
                        "rounded-full border px-3 py-1 text-xs font-semibold",
                        (aiDiagnosis?.riskBaseline ?? snapshot.riskBaseline) === "Critical"
                          ? "border-pink-300/40 bg-pink-400/10 text-pink-200"
                          : (aiDiagnosis?.riskBaseline ?? snapshot.riskBaseline) === "Elevated"
                            ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                            : "border-white/10 bg-white/5 text-white/75"
                      )}
                    >
                      {aiDiagnosis?.riskBaseline ?? snapshot.riskBaseline}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/60">
                    <span>Health</span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-semibold text-white/80">
                      {aiDiagnosis?.health ?? "—"}
                    </span>
                  </div>
                  <div className="mt-4 text-xs font-semibold tracking-wider text-white/55">
                    Primary failure modes
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {(aiDiagnosis?.primaryFailureModes ?? snapshot.primaryFailureModes).map((m) => (
                      <li key={m} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80 shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                  {aiDiagnosis?.rationale ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
                      <div className="font-semibold tracking-wider text-white/70">AI rationale</div>
                      <div className="mt-2">{aiDiagnosis.rationale}</div>
                    </div>
                  ) : null}

                  {aiDiagnosis?.cause ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(99,102,241,0.08),rgba(236,72,153,0.06))] p-5 text-xs text-white/70 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_30px_rgba(34,211,238,0.12)]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold tracking-wider text-white/80">
                          AI health cause + fix
                        </div>
                        <div className="text-[10px] font-semibold tracking-wider text-white/45">
                          {aiDiagnosis.model}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-white/80">
                        <span className="font-semibold text-white/90">Cause:</span> {aiDiagnosis.cause}
                      </div>
                      {aiDiagnosis.health !== "GREEN" ? (
                        <div className="mt-4">
                          <div className="text-xs font-semibold tracking-wider text-white/55">
                            Revival actions
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-white/80">
                            {aiDiagnosis.revivePlan.actions.slice(0, 5).map((a) => (
                              <li key={a} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80 shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                          {aiDiagnosis.revivePlan.avoid.length ? (
                            <div className="mt-4 rounded-2xl border border-pink-300/20 bg-pink-400/10 p-4 text-xs text-pink-100">
                              <div className="font-semibold tracking-wider text-pink-100/90">
                                Don’t do this
                              </div>
                              <ul className="mt-2 space-y-1">
                                {aiDiagnosis.revivePlan.avoid.slice(0, 3).map((d) => (
                                  <li key={d}>- {d}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-white/55">
                          Status is healthy — keep cadence steady and avoid unnecessary wallet optics risk.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <SecondaryButton onClick={goBack}>Back</SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  persistProfile();
                  goNext();
                }}
              >
                Continue <Icon name="arrow" />
              </PrimaryButton>
            </div>
          </GlassCard>
        ) : null}

        {STEPS[stepIdx].key === "next" ? (
          <GlassCard
            title="Lock in with your wallet"
            subtitle="Connect your Solana wallet to lock in this classification and open Manage Project."
          >
            <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
                  <div className="text-xs font-semibold tracking-wider text-white/55">
                    Your first action
                  </div>
                  <div className="mt-3 text-pretty text-xl font-semibold tracking-tight text-white">
                    “{snapshot.nextPrompt}”
                  </div>
                  <div className="mt-4 text-sm text-white/65">
                    We’ll route you into Manage Project immediately after wallet connect.
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-xs font-semibold tracking-wider text-white/55">
                    Wallet access
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    Save your classification and open your command center.
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!wallet.address) {
                          setWalletModalOpen(true);
                          return;
                        }
                        persistProfile();
                        router.push("/dashboard/overview");
                      }}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(90deg,rgba(34,211,238,0.22),rgba(99,102,241,0.18),rgba(236,72,153,0.14))] px-6 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.55)] transition hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_24px_80px_rgba(0,0,0,0.65)]"
                    >
                      Connect Wallet & Lock In <Icon name="arrow" />
                    </button>
                   
                  </div>
                </div>
              </div>
            </div>

            <WalletConnectModal
              open={walletModalOpen}
              onClose={() => setWalletModalOpen(false)}
              title="Connect wallet to lock in"
              subtitle="Connect your Solana wallet to continue. This replaces Google sign-in."
              allowedChains={["solana"]}
              autoCloseOnConnect={false}
              after={
                wallet.address ? (
                  <button
                    type="button"
                    onClick={() => {
                      setWalletModalOpen(false);
                      persistProfile();
                      router.push("/dashboard/overview");
                    }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Continue →
                  </button>
                ) : null
              }
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SecondaryButton onClick={goBack}>Back</SecondaryButton>
             
            </div>
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}

