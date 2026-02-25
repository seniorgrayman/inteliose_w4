import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";

type ChecklistSection = {
  id: string;
  title: string;
  subtitle?: string;
  warning?: string;
  items: Array<{
    id: string;
    label: string;
    note?: string;
  }>;
};

const SECTIONS: ChecklistSection[] = [
  {
    id: "token-safety",
    title: "1️⃣ Token Safety & Setup",
    subtitle: "Verify the token contract is secure",
    items: [
      { id: "verified-contract", label: "Contract verified on block explorer" },
      { id: "supply-fixed", label: "Supply is fixed (no mint)" },
      { id: "no-pausable", label: "Trading cannot be paused" },
      { id: "ownership-renounced", label: "Ownership renounced or multisig" },
    ],
  },
  {
    id: "liquidity",
    title: "2️⃣ Liquidity & Lock Status",
    warning: "⚠️ Liquidity lock is critical for trust",
    items: [
      { id: "liquidity-exists", label: "Adequate liquidity exists" },
      { id: "lp-locked", label: "LP tokens locked for 6+ months" },
      { id: "lp-burn-confirmed", label: "LP burn confirmed or verified" },
      { id: "slippage-acceptable", label: "Slippage is acceptable (<5%)" },
    ],
  },
  {
    id: "distribution",
    title: "3️⃣ Holder Distribution",
    items: [
      { id: "top-holder-check", label: "Top holder <20% of supply" },
      { id: "whale-count", label: "Reasonable whale count" },
      { id: "community-owned", label: "Community distributed fairly" },
      { id: "no-suspicious-wallets", label: "No obvious suspicious wallets" },
    ],
  },
  {
    id: "market",
    title: "4️⃣ Market Metrics",
    items: [
      { id: "volume-healthy", label: "24h volume is healthy" },
      { id: "price-stable", label: "Price action is stable" },
      { id: "market-cap-reasonable", label: "Market cap seems reasonable" },
      { id: "no-flash-crash", label: "No recent flash crashes" },
    ],
  },
  {
    id: "team",
    title: "5️⃣ Team & Community",
    subtitle: "Verify team presence and community health",
    items: [
      { id: "team-identified", label: "Team members identified" },
      { id: "social-active", label: "Active social media presence" },
      { id: "community-engaged", label: "Community engaged and responsive" },
      { id: "roadmap-clear", label: "Roadmap is clear and realistic" },
    ],
  },
  {
    id: "risk-assessment",
    title: "6️⃣ Final Risk Assessment",
    warning: "⚠️ Complete all previous sections first",
    items: [
      { id: "low-red-flags", label: "Minimal red flags identified" },
      { id: "trust-score-high", label: "Overall trust score is high" },
      { id: "ready-to-invest", label: "Ready for investment decision" },
    ],
  },
];

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`checklist:${id}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleItem = (itemId: string) => {
    const next = { ...done, [itemId]: !done[itemId] };
    setDone(next);
    try {
      localStorage.setItem(`checklist:${id}`, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const calculateScore = () => {
    const allItems = SECTIONS.flatMap((s) => s.items);
    const completed = allItems.filter((i) => done[i.id]).length;
    return Math.round((completed / allItems.length) * 100);
  };

  const sectionProgress = (section: ChecklistSection) => {
    const completed = section.items.filter((i) => done[i.id]).length;
    return {
      completed,
      total: section.items.length,
      percentage: Math.round((completed / section.items.length) * 100),
    };
  };

  const overallScore = calculateScore();
  const scoreColor =
    overallScore >= 80
      ? "bg-green-100 text-green-900"
      : overallScore >= 60
      ? "bg-yellow-100 text-yellow-900"
      : "bg-red-100 text-red-900";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/manage-project/${id}`)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Token Readiness Checklist</h1>
            <p className="text-slate-600 mt-1">Verify token safety and market conditions</p>
          </div>
        </div>

        {/* Score Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase">Overall Readiness</p>
              <p className="text-slate-700 mt-2">
                {overallScore >= 80
                  ? "🟢 Excellent - Very safe to proceed"
                  : overallScore >= 60
                  ? "🟡 Good - Address concerns before proceeding"
                  : "🔴 Caution - Multiple issues to resolve"}
              </p>
            </div>
            <div className={`rounded-full px-6 py-3 text-center ${scoreColor}`}>
              <p className="text-3xl font-bold">{overallScore}</p>
              <p className="text-xs font-semibold">Score</p>
            </div>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section, idx) => {
            const progress = sectionProgress(section);
            const allPreviousComplete = idx === 0 || SECTIONS.slice(0, idx).every((s) => sectionProgress(s).percentage === 100);
            const locked = !allPreviousComplete;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-6 ${locked ? "opacity-50" : ""}`}
              >
                {/* Section Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                    {section.subtitle && <p className="text-sm text-slate-600 mt-1">{section.subtitle}</p>}
                    {section.warning && (
                      <div className="mt-3 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
                        {section.warning}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{progress.percentage}%</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {progress.completed}/{progress.total} done
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                {/* Items */}
                <div className={`space-y-3 ${locked ? "pointer-events-none" : ""}`}>
                  {section.items.map((item) => {
                    const isChecked = done[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => !locked && toggleItem(item.id)}
                        disabled={locked}
                        className={`w-full flex items-start justify-between gap-4 rounded-lg border p-4 text-left transition ${
                          isChecked
                            ? "border-green-300 bg-green-50"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        } ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex-1">
                          <p className={`font-medium ${isChecked ? "text-green-900" : "text-slate-900"}`}>
                            {item.label}
                          </p>
                          {item.note && (
                            <p className="text-xs text-slate-600 mt-1">{item.note}</p>
                          )}
                        </div>
                        <div className="text-lg flex-shrink-0 mt-1">
                          {isChecked ? (
                            <CheckCircle2 size={20} className="text-green-600" />
                          ) : locked ? (
                            <Lock size={20} className="text-slate-400" />
                          ) : (
                            <div className="w-5 h-5 rounded border-2 border-slate-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-3">✅ Next Steps</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Complete all sections to get a comprehensive risk assessment</li>
            <li>• Use this checklist to guide your investment decision</li>
            <li>• Return to the project detail page for full analysis</li>
            <li>• Share findings with your team before making moves</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
