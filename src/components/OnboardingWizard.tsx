"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfileModel, Stage, Intent, LaunchPlatform, Category, LaunchType } from "@/types/profile";

const STEPS = [
  { key: "token", label: "Token" },
  { key: "stage", label: "Stage" },
  { key: "context", label: "Context" },
  { key: "intent", label: "Intent" },
  { key: "snapshot", label: "Summary" },
] as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ name }: { name: "spark" | "shield" | "link" | "arrow" }) {
  const common = "h-4 w-4";
  if (name === "spark") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    );
  }
  if (name === "link") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 7l5 5-5 5" />
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
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.65)] sm:p-8 backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.35),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.30),transparent_60%),radial-gradient(circle_at_40%_80%,rgba(236,72,153,0.16),transparent_60%)] blur-2xl" />
      <div className="relative">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
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
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
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
        "relative w-full rounded-2xl border p-4 transition text-left",
        selected
          ? "border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-white/60">{description}</p>
        </div>
        <div className={cx("mt-1 h-5 w-5 rounded-full border-2 transition", selected ? "border-cyan-400 bg-cyan-400" : "border-white/30")} />
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
  modalMode = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
  placeholder?: string;
  modalMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  
  if (modalMode) {
    return (
      <div className="block">
        <div className="mb-2 text-xs font-semibold tracking-wider text-white/55 uppercase">{label}</div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full rounded-2xl border border-black/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/8 flex items-center justify-between"
          >
            <span>{value ? options.find((o) => o.value === value)?.label || placeholder : placeholder}</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          
          {/* Full-screen Modal Mode */}
          {open && (
            <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              
              {/* Modal */}
              <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.65)] max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header with Close Button */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10">
                  <h3 className="text-xl font-bold text-white">{label}</h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-white/50 hover:text-white/70 transition"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Options List */}
                <div className="overflow-y-auto flex-1">
                  {options.map((opt, idx) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={cx(
                        "w-full px-6 md:px-8 py-4 md:py-5 text-left text-sm transition hover:bg-white/10 border-b border-white/5 last:border-b-0",
                        opt.value === value && "bg-cyan-400/20"
                      )}
                    >
                      <p className={opt.value === value ? "font-bold text-cyan-300" : "font-medium text-white"}>{opt.label}</p>
                      {opt.hint && <p className="mt-1 text-xs text-white/50">{opt.hint}</p>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Regular dropdown mode
  return (
    <div className="block">
      <div className="mb-2 text-xs font-semibold tracking-wider text-white/55 uppercase">{label}</div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/8 flex items-center justify-between"
        >
          <span>{value ? options.find((o) => o.value === value)?.label || placeholder : placeholder}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full z-10 mt-2 w-full rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl max-h-64 overflow-y-auto">
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cx(
                  "w-full px-4 py-3 text-left text-sm transition hover:bg-white/10",
                  opt.value === value && "bg-cyan-400/20 text-cyan-300",
                  idx === options.length - 1 && "pb-4"
                )}
              >
                <p className="font-medium">{opt.label}</p>
                {opt.hint && <p className="mt-0.5 text-xs text-white/50">{opt.hint}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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

interface OnboardingWizardProps {
  onComplete: (model: ProfileModel) => void;
  initialModel?: ProfileModel;
}

export default function OnboardingWizard({ onComplete, initialModel }: OnboardingWizardProps) {
  const [model, setModel] = useState<ProfileModel>(
    initialModel || {
      tokenAddress: "",
      isPrelaunch: false,
      stage: null,
      launchPlatform: null,
      launchType: null,
      category: null,
      intent: null,
      devWallet: "",
      marketingWallet: "",
    }
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  // Calculate actual steps based on whether token is pre-launch
  const actualSteps = useMemo(() => {
    if (model.isPrelaunch) {
      // Skip the "stage" step for pre-launch tokens
      return [
        { key: "token", label: "Token" },
        { key: "context", label: "Context" },
        { key: "intent", label: "Intent" },
        { key: "snapshot", label: "Summary" },
      ] as const;
    }
    return STEPS;
  }, [model.isPrelaunch]);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [stepIdx]);

  const canContinue = useMemo(() => {
    const step = actualSteps[stepIdx]?.key;
    if (step === "token") return model.isPrelaunch || model.tokenAddress.trim().length >= 10;
    if (step === "stage") return model.stage !== null;
    if (step === "context")
      return model.launchPlatform !== null && model.launchType !== null && model.category !== null;
    if (step === "intent") return model.intent !== null;
    return true;
  }, [model, stepIdx, actualSteps]);

  const goNext = () => setStepIdx((i) => Math.min(i + 1, actualSteps.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));

  const handleComplete = () => {
    onComplete(model);
  };

  const header = (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/55 uppercase">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          Project Setup
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/50">
        Step {stepIdx + 1} of {actualSteps.length}
      </div>
    </div>
  );

  const renderStep = () => {
    const step = actualSteps[stepIdx]?.key;

    if (step === "token") {
      return (
        <GlassCard
          title="Let's start with your token"
          subtitle="Are you launching something new, or analyzing an existing token?"
        >
          <div className="space-y-4">
            <ChoiceCard
              title="I have a token address"
              description="Analyze an existing or pre-deployed token"
              selected={!model.isPrelaunch}
              onClick={() => setModel((m) => ({ ...m, isPrelaunch: false, tokenAddress: "" }))}
            />
            <ChoiceCard
              title="I'm pre-launching"
              description="Haven't deployed yet; I need onboarding guidance"
              selected={model.isPrelaunch}
              onClick={() => setModel((m) => ({ ...m, isPrelaunch: true }))}
            />

            {!model.isPrelaunch && (
              <div className="mt-4">
                <label className="block text-xs font-semibold tracking-wider text-white/55 uppercase mb-2">
                  Token Address
                </label>
                <input
                  type="text"
                  placeholder="Paste token contract address..."
                  value={model.tokenAddress}
                  onChange={(e) => setModel((m) => ({ ...m, tokenAddress: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition placeholder:text-white/40 hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
              </div>
            )}
          </div>
        </GlassCard>
      );
    }

    if (step === "stage") {
      return (
        <GlassCard
          title="What stage is the token at?"
          subtitle="This helps us tailor the analysis"
        >
          <div className="space-y-3">
            {(["pre-launch", "live", "post-launch", "revival"] as Stage[]).map((s) => (
              <ChoiceCard
                key={s}
                title={StageLabel(s)}
                description={
                  s === "pre-launch"
                    ? "Not yet listed on DEX"
                    : s === "live"
                    ? "Just launched or trading actively"
                    : s === "post-launch"
                    ? "Established presence"
                    : "Was active, now dormant"
                }
                selected={model.stage === s}
                onClick={() => setModel((m) => ({ ...m, stage: s }))}
              />
            ))}
          </div>
        </GlassCard>
      );
    }

    if (step === "context") {
      return (
        <GlassCard title="Token context" subtitle="Help us understand the mechanics">
          <div className="space-y-4">
            <Select
              label="Launch Platform"
              value={model.launchPlatform || ""}
              onChange={(v) => setModel((m) => ({ ...m, launchPlatform: v as LaunchPlatform }))}
              options={[
                { value: "pumpfun", label: PlatformLabel("pumpfun"), hint: "Pump.fun meme launchpad" },
                { value: "bags", label: PlatformLabel("bags"), hint: "Bags" },
                { value: "raydium", label: PlatformLabel("raydium"), hint: "Raydium AcceleRaytor" },
                { value: "moonshot", label: PlatformLabel("moonshot"), hint: "Moonshot community launch" },
                { value: "launchmytoken", label: PlatformLabel("launchmytoken"), hint: "LaunchMyToken" },
              ]}
              placeholder="Choose launch platform"
              modalMode={true}
            />

            <Select
              label="Launch Type"
              value={model.launchType || ""}
              onChange={(v) => setModel((m) => ({ ...m, launchType: v as LaunchType }))}
              options={[
                { value: "meme", label: LaunchTypeLabel("meme"), hint: "Meme-style (emphasis on culture)" },
                { value: "liquidity", label: LaunchTypeLabel("liquidity"), hint: "Liquidity launch with LP" },
                { value: "ido", label: LaunchTypeLabel("ido"), hint: "IDO or presale-backed launch" },
              ]}
              placeholder="Choose launch type"
              modalMode={true}
            />

            <Select
              label="Category"
              value={model.category || ""}
              onChange={(v) => setModel((m) => ({ ...m, category: v as Category }))}
              options={[
                { value: "ai", label: CategoryLabel("ai"), hint: "AI / ML related" },
                { value: "meme", label: CategoryLabel("meme"), hint: "Meme / culture-driven" },
                { value: "defi", label: CategoryLabel("defi"), hint: "DeFi protocol" },
                { value: "gamify", label: CategoryLabel("gamify"), hint: "Gamification / Play-to-earn" },
                { value: "nft", label: CategoryLabel("nft"), hint: "NFT ecosystem" },
                { value: "socialfi", label: CategoryLabel("socialfi"), hint: "Social Finance" },
                { value: "dao", label: CategoryLabel("dao"), hint: "DAO / Governance" },
                { value: "utility", label: CategoryLabel("utility"), hint: "Utility / Other" },
              ]}
              placeholder="Choose category"
              modalMode={true}
            />
          </div>
        </GlassCard>
      );
    }

    if (step === "intent") {
      return (
        <GlassCard
          title="What's your intent with this token?"
          subtitle="How are you approaching this investment?"
        >
          <div className="space-y-3">
            {(["fast-flip", "medium", "long"] as Intent[]).map((i) => (
              <ChoiceCard
                key={i}
                title={IntentLabel(i)}
                description={
                  i === "fast-flip"
                    ? "Quick profit + exit within hours/days"
                    : i === "medium"
                    ? "1–12 week timeframe"
                    : "Belief in long-term utility"
                }
                selected={model.intent === i}
                onClick={() => setModel((m) => ({ ...m, intent: i }))}
              />
            ))}
          </div>
        </GlassCard>
      );
    }

    if (step === "snapshot") {
      return (
        <GlassCard title="Project summary" subtitle="Ready to create your project">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold text-white/60 uppercase">Token</p>
              <p className="mt-1 font-mono text-sm text-white break-all">{model.isPrelaunch ? "Pre-launch" : model.tokenAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold text-white/60 uppercase">Stage</p>
                <p className="mt-1 text-sm text-white">{model.stage ? StageLabel(model.stage) : "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold text-white/60 uppercase">Intent</p>
                <p className="mt-1 text-sm text-white">{model.intent ? IntentLabel(model.intent) : "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold text-white/60 uppercase">Platform</p>
                <p className="mt-1 text-xs text-white">{model.launchPlatform ? PlatformLabel(model.launchPlatform) : "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold text-white/60 uppercase">Type</p>
                <p className="mt-1 text-xs text-white">{model.launchType ? LaunchTypeLabel(model.launchType) : "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold text-white/60 uppercase">Category</p>
                <p className="mt-1 text-xs text-white">{model.category ? CategoryLabel(model.category) : "—"}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      );
    }
  };

  return (
    <div>
      {header}
      <AnimatePresence mode="wait">
        <motion.div key={animKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {stepIdx > 0 && (
          <SecondaryButton onClick={goBack}>← Back</SecondaryButton>
        )}
        {stepIdx < actualSteps.length - 1 ? (
          <PrimaryButton onClick={goNext} disabled={!canContinue}>
            Next <ArrowRight size={16} />
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={handleComplete} disabled={!canContinue}>
            scrola <Sparkles size={16} />
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
