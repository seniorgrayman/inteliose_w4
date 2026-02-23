"use client";

import { useMemo, useState } from "react";

type LaunchMode = "manual" | "launchpad";

type ChecklistItem = {
  id: string;
  label: string;
  note?: string;
};

type ChecklistSection = {
  id: string;
  title: string;
  subtitle?: string;
  warning?: string;
  items: ChecklistItem[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const MODE_KEY = "dao-intel:launch-mode";

function doneKey(mode: LaunchMode) {
  return `dao-intel:launch-checklist:${mode}`;
}

function readMode(): LaunchMode {
  try {
    const raw = window.localStorage.getItem(MODE_KEY);
    if (raw === "manual" || raw === "launchpad") return raw;
    return "manual";
  } catch {
    return "manual";
  }
}

function writeMode(mode: LaunchMode) {
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function readDone(mode: LaunchMode): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(doneKey(mode));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeDone(mode: LaunchMode, next: Record<string, boolean>) {
  try {
    window.localStorage.setItem(doneKey(mode), JSON.stringify(next));
  } catch {
    // ignore
  }
}

function score(sections: ChecklistSection[], done: Record<string, boolean>) {
  const items = sections.flatMap((s) => s.items);
  const max = items.length || 1;
  const raw = items.reduce((acc, i) => acc + (done[i.id] ? 1 : 0), 0);
  return Math.round((raw / max) * 100);
}

function sectionCompletion(section: ChecklistSection, done: Record<string, boolean>) {
  const max = section.items.length || 1;
  const raw = section.items.reduce((acc, i) => acc + (done[i.id] ? 1 : 0), 0);
  return { raw, max, pct: Math.round((raw / max) * 100) };
}

function buildSections(mode: LaunchMode): ChecklistSection[] {
  if (mode === "manual") {
    return [
      {
        id: "manual-prelaunch",
        title: "1️⃣ Pre-Launch Setup",
        subtitle: "Founder-controlled, higher responsibility",
        items: [
          { id: "manual-token-created", label: "Token created & verified" },
          { id: "manual-authorities", label: "Mint & freeze authority revoked" },
          { id: "manual-lp-wallet", label: "LP wallet prepared" },
          { id: "manual-wallets-separated", label: "Dev & treasury wallets separated" },
          { id: "manual-multisig", label: "Multisig (recommended)" },
        ],
      },
      {
        id: "manual-hype",
        title: "2️⃣ Pre-Shill & Hype (CRITICAL)",
        warning: "⚠️ Manual launch without pre-shill = low survival odds",
        items: [
          { id: "manual-narrative", label: "Narrative finalized (1 sentence)" },
          { id: "manual-x-active", label: "X (Twitter) account active" },
          { id: "manual-pinned-post", label: "Pinned launch post ready" },
          { id: "manual-raiders", label: "Raider community onboarded" },
          { id: "manual-kols", label: "Influencer / KOL alignment" },
          { id: "manual-countdown", label: "Countdown or teaser posts" },
          { id: "manual-no-fake", label: "No fake engagement (AI checks this)" },
        ],
      },
      {
        id: "manual-paid",
        title: "3️⃣ Paid Visibility (Optional but Powerful)",
        items: [
          { id: "manual-dex-ads", label: "DEX ads (Jupiter / Raydium)" },
          { id: "manual-x-promoted", label: "X promoted posts" },
          { id: "manual-banners", label: "Banner placements" },
          { id: "manual-call-group", label: "Call group agreements disclosed" },
        ],
      },
      {
        id: "manual-liquidity",
        title: "4️⃣ Liquidity & Market Control",
        items: [
          { id: "manual-lp-size", label: "Initial LP size defined" },
          { id: "manual-lp-lock", label: "LP lock or burn confirmed" },
          { id: "manual-antisnipe", label: "Anti-snipe strategy (or honesty)" },
          { id: "manual-slippage", label: "Slippage tested" },
          { id: "manual-sync", label: "Trading start time synced with hype" },
        ],
      },
      {
        id: "manual-exec",
        title: "5️⃣ Launch Execution",
        items: [
          { id: "manual-deployed", label: "Contract deployed" },
          { id: "manual-lp-added", label: "LP added" },
          { id: "manual-trading-enabled", label: "Trading enabled" },
          { id: "manual-ca-published", label: "CA published" },
          { id: "manual-community-alerted", label: "Community alerted immediately" },
        ],
      },
      {
        id: "manual-post",
        title: "6️⃣ Post-Launch Support",
        items: [
          { id: "manual-present", label: "Founder present first 24–72h" },
          { id: "manual-x-posting", label: "Continuous X posting" },
          { id: "manual-defense", label: "Chart defense (if promised)" },
          { id: "manual-moderation", label: "Community moderation active" },
          { id: "manual-transparency", label: "Transparency updates" },
        ],
      },
    ];
  }

  return [
    {
      id: "lp-config",
      title: "1️⃣ Platform Configuration",
      subtitle: "Pump.fun, Moonshot, Bags — simpler, faster",
      items: [
        { id: "lp-selected", label: "Launchpad selected" },
        { id: "lp-details", label: "Token details entered" },
        { id: "lp-curve", label: "Supply & curve understood" },
        { id: "lp-fees", label: "Fees acknowledged" },
        { id: "lp-time", label: "Launch time selected" },
      ],
    },
    {
      id: "lp-preshill",
      title: "2️⃣ Minimal Pre-Shill (Still Matters)",
      warning: "⚠️ Launchpads reduce friction, not responsibility",
      items: [
        { id: "lp-x-live", label: "X account live" },
        { id: "lp-announcement", label: "Launch announcement post" },
        { id: "lp-raiders-light", label: "Raider alerts (light)" },
        { id: "lp-memes", label: "Organic memes prepared" },
      ],
    },
    {
      id: "lp-exec",
      title: "3️⃣ Launch Execution",
      items: [
        { id: "lp-launched", label: "Token launched on platform" },
        { id: "lp-ca-shared", label: "CA shared" },
        { id: "lp-directed", label: "Community directed to launchpad" },
        { id: "lp-no-conflict", label: "No conflicting liquidity actions" },
      ],
    },
    {
      id: "lp-momentum",
      title: "4️⃣ Momentum Management",
      items: [
        { id: "lp-posting", label: "X posting during bonding phase" },
        { id: "lp-cta", label: "Community calls to action" },
        { id: "lp-holders", label: "Holder encouragement" },
        { id: "lp-reinforce", label: "Narrative reinforcement" },
      ],
    },
    {
      id: "lp-grad",
      title: "5️⃣ Post-Bonding / Graduation",
      items: [
        { id: "lp-migration", label: "Liquidity migration confirmed" },
        { id: "lp-dex-verified", label: "DEX listing verified" },
        { id: "lp-lp-status", label: "LP status clear" },
        { id: "lp-next", label: "Next steps communicated" },
      ],
    },
  ];
}

export function LaunchModeChecklist() {
  const [mode, setMode] = useState<LaunchMode>(() => readMode());
  const sections = useMemo(() => buildSections(mode), [mode]);
  const [done, setDone] = useState<Record<string, boolean>>(() => readDone(mode));

  // keep per-mode done isolated when switching
  const switchMode = (next: LaunchMode) => {
    setMode(next);
    writeMode(next);
    setDone(readDone(next));
  };

  const readiness = useMemo(() => score(sections, done), [sections, done]);
  const readinessChip =
    readiness >= 80
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
      : readiness >= 55
        ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
        : "border-pink-300/25 bg-pink-400/10 text-pink-100";

  const hypeSectionId = mode === "manual" ? "manual-hype" : "lp-preshill";
  const hypeSection = sections.find((s) => s.id === hypeSectionId) ?? sections[0];
  const hypeScore = useMemo(() => sectionCompletion(hypeSection, done).pct, [hypeSection, done]);

  const liquiditySection = sections.find((s) => s.id === "manual-liquidity") ?? null;
  const paidSection = sections.find((s) => s.id === "manual-paid") ?? null;
  const paidChecked = useMemo(() => {
    if (!paidSection) return 0;
    return paidSection.items.reduce((acc, i) => acc + (done[i.id] ? 1 : 0), 0);
  }, [paidSection, done]);
  const liqCoreDone = useMemo(() => {
    if (!liquiditySection) return false;
    const core = ["manual-lp-size", "manual-lp-lock", "manual-slippage"];
    return core.every((id) => !!done[id]);
  }, [liquiditySection, done]);

  const capitalEfficiencyWarning =
    mode === "manual" && paidChecked >= 2 && !liqCoreDone
      ? "❌ Paid visibility is checked, but your liquidity plan isn’t locked in. This burns budget with low retention."
      : mode === "manual" && paidChecked >= 2
        ? "⚠️ Paid visibility can work—ensure slippage + LP sizing are aligned to the hype window."
        : "—";

  const lifecycle =
    mode === "manual"
      ? hypeScore >= 75
        ? "days / weeks"
        : "minutes / hours"
      : hypeScore >= 60
        ? "hours / days"
        : "minutes / hours";

  const modeFit =
    mode === "manual"
      ? hypeScore >= 70
        ? "Good"
        : "Poor"
      : hypeScore >= 50
        ? "Good"
        : "Risky";

  const toggleItem = (itemId: string) => {
    const next = { ...done, [itemId]: !done[itemId] };
    setDone(next);
    writeDone(mode, next);
  };

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Launch Mode Selection</div>
            <div className="mt-2 text-sm text-white/65">Select your launch mode. Checklist adapts instantly.</div>
          </div>
          <div className={cx("rounded-full border px-3 py-1 text-xs font-semibold", readinessChip)}>
            Score: {readiness}/100
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(
            [
              { id: "manual", label: "Manual Launch", desc: "Founder-controlled, higher responsibility" },
              { id: "launchpad", label: "Launchpad Launch", desc: "Pump.fun, Moonshot, Bags, etc." },
            ] as const
          ).map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => switchMode(m.id)}
                className={cx(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  active
                    ? "border-cyan-300/35 bg-cyan-300/10 text-white shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-xs text-white/55">{active ? "✓ Selected" : "Select →"}</div>
                </div>
                <div className="mt-1 text-xs text-white/55">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {sections.map((s, idx) => {
          const prevComplete = idx === 0 ? true : sections.slice(0, idx).every((ps) => sectionCompletion(ps, done).pct === 100);
          const locked = !prevComplete;
          const comp = sectionCompletion(s, done);
          return (
            <div
              key={s.id}
              className={cx(
                "rounded-2xl border border-white/10 bg-black/20 p-6 transition",
                locked && "opacity-50"
              )}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {s.title} {locked ? <span className="text-white/55">· 🔒 Complete previous steps to unlock</span> : null}
                  </div>
                  {s.subtitle ? <div className="mt-1 text-xs text-white/55">{s.subtitle}</div> : null}
                  {s.warning ? (
                    <div className="mt-3 rounded-2xl border border-pink-300/20 bg-pink-400/10 p-4 text-xs text-pink-100">
                      {s.warning}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
                  {comp.raw}/{comp.max} ({comp.pct}%)
                </div>
              </div>

              <div className={cx("mt-4 grid gap-2", locked && "pointer-events-none")}>
                {s.items.map((it) => {
                  const checked = !!done[it.id];
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => toggleItem(it.id)}
                      className={cx(
                        "flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition",
                        checked
                          ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-50"
                          : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <div>
                        <div className="text-sm font-semibold">{it.label}</div>
                        {it.note ? <div className="mt-1 text-xs text-white/55">{it.note}</div> : null}
                      </div>
                      <div className="text-sm">{checked ? "✅" : "☐"}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
        <div className="text-sm font-semibold text-white">🧠 DAO Intelligence Logic Layer</div>
        <div className="mt-2 text-sm text-white/65">We’ll convert your checklist state into clear risk flags + outputs.</div>

        <div className="mt-4 grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold tracking-wider text-white/55">AI Flags (examples)</div>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>❌ Manual Launch + No Pre-Shill</li>
                <li>❌ DEX Ads + No Liquidity Plan</li>
                <li>❌ Raiders + No Post-Launch Presence</li>
                <li>⚠️ Pump.fun + “Long-Term Vision” intent</li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold tracking-wider text-white/55">🎯 Output to Founder</div>
              <div className="mt-3 grid gap-2 text-sm text-white/80">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/65">Launch Mode Fit Score</span>
                  <span className="font-semibold text-white">{modeFit}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/65">Hype Readiness Score</span>
                  <span className="font-semibold text-white">{hypeScore}/100</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/65">Expected Lifecycle</span>
                  <span className="font-semibold text-white">{lifecycle}</span>
                </div>
              </div>

              {/* <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-white/60">
                <div className="font-semibold text-white/75">Capital Efficiency Warning</div>
                <div className="mt-2">{capitalEfficiencyWarning}</div>
              </div> */}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          UX tip: Use the launch mode toggle above. Green checks unlock the next steps. Red warnings explain <span className="font-semibold text-white/85">why</span>, not just what.
        </div>
      </div>
    </div>
  );
}

