import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Download, Share2, AlertCircle, CheckCircle } from "lucide-react";
import { getProject, updateProject, deleteProject } from "@/lib/firebase/projects";
import type { Project } from "@/types/profile";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadProject = async () => {
      try {
        setLoading(true);
        const proj = await getProject(id);
        if (!proj) {
          navigate("/manage-project");
          return;
        }
        setProject(proj);
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      navigate("/manage-project");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const getRiskColor = (baseline: string) => {
    if (baseline === "Low") return "text-green-400 bg-green-400/10 border-green-400/30";
    if (baseline === "Moderate") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    if (baseline === "Elevated") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    return "text-red-400 bg-red-400/10 border-red-400/30";
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14 flex items-center justify-center min-h-screen">
        <div className="inline-flex items-center gap-2 text-white/60">
          <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Loading project...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
        <button
          onClick={() => navigate("/manage-project")}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to Projects
        </button>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <AlertCircle size={48} className="mx-auto mb-4 text-white/40" />
          <h3 className="text-lg font-semibold text-white">Project not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate("/manage-project")}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-white/70 hover:bg-white/10 transition">
            <Download size={16} />
          </button>
          <button className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-white/70 hover:bg-white/10 transition">
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-white/70 hover:bg-white/10 transition"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 px-3 text-red-400 hover:bg-red-400/20 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Main Project Card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-xl">
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                Project Details
              </div>
              <h1 className="text-3xl font-bold text-white">
                {project.profile.isPrelaunch ? "Pre-launch Project" : "Token Analysis"}
              </h1>
              <p className="mt-2 font-mono text-white/60">{project.profile.tokenAddress || "Pre-launch"}</p>
            </div>

            {/* Risk & Status */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
              {project.snapshot && (
                <div className={`rounded-xl border px-4 py-3 ${getRiskColor(project.snapshot.riskBaseline)}`}>
                  <p className="text-xs font-semibold uppercase opacity-80">Risk Level</p>
                  <p className="mt-1 text-lg font-bold">{project.snapshot.riskBaseline}</p>
                </div>
              )}
              <div className={`rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-cyan-300`}>
                <p className="text-xs font-semibold uppercase opacity-80">Created</p>
                <p className="mt-1 font-mono text-sm">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Configuration */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Token Configuration</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase">Stage</p>
                <p className="mt-2 rounded-lg bg-black/30 px-3 py-2 text-white capitalize">
                  {project.profile.stage || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase">Intent</p>
                <p className="mt-2 rounded-lg bg-black/30 px-3 py-2 text-white capitalize">
                  {project.profile.intent || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Mechanics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase">Launch Platform</p>
                <p className="mt-2 rounded-lg bg-black/30 px-3 py-2 text-white capitalize">
                  {project.profile.launchPlatform || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase">Launch Type</p>
                <p className="mt-2 rounded-lg bg-black/30 px-3 py-2 text-white capitalize">
                  {project.profile.launchType || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Wallets */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Additional Info</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase">Category</p>
              <p className="mt-2 rounded-lg bg-black/30 px-3 py-2 text-white capitalize">
                {project.profile.category || "Not specified"}
              </p>
            </div>
            {project.profile.devWallet && (
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase">Dev Wallet</p>
                <p className="mt-2 rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-white truncate">
                  {project.profile.devWallet}
                </p>
              </div>
            )}
            {project.profile.marketingWallet && (
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase">Marketing Wallet</p>
                <p className="mt-2 rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-white truncate">
                  {project.profile.marketingWallet}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Analysis */}
        {project.snapshot && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Risk Assessment</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-2">Primary Failure Modes:</p>
                <div className="flex flex-wrap gap-2">
                  {project.snapshot.primaryFailureModes.map((mode) => (
                    <span
                      key={mode}
                      className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs text-orange-300"
                    >
                      <AlertCircle size={12} />
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
              {project.snapshot.nextPrompt && (
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-200">
                  {project.snapshot.nextPrompt}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Diagnosis */}
        {project.aiDiagnosis && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">AI Analysis</h2>
            <div className="space-y-4">
              <p className="text-white/80">{project.aiDiagnosis.summary}</p>
              {project.aiDiagnosis.riskFactors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">Risk Factors:</p>
                  <ul className="space-y-1">
                    {project.aiDiagnosis.riskFactors.map((factor) => (
                      <li key={factor} className="flex items-start gap-2 text-sm text-white/60">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {project.aiDiagnosis.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {project.aiDiagnosis.recommendations.map((rec) => (
                      <li key={rec} className="flex items-start gap-2 text-sm text-white/60">
                        <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectDetail;
