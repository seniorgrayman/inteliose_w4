import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Download, Share2, AlertCircle, CheckCircle, Menu, X } from "lucide-react";
import { getProject, updateProject, deleteProject } from "@/lib/firebase/projects";
import type { Project } from "@/types/profile";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 z-40 h-full w-80 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Checklist</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-slate-600 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 flex-shrink-0 mt-1">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Token Analyzed</p>
                  <p className="text-xs text-slate-600 mt-1">Project data loaded successfully</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Risk Assessment</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {project.snapshot ? "Completed" : "Pending"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">AI Analysis</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {project.aiDiagnosis ? "Available" : "Not generated"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Configuration</p>
                  <p className="text-xs text-slate-600 mt-1">Complete</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-slate-200 space-y-2">
            <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm">
              Export Report
            </button>
            <button className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition text-sm">
              Share Project
            </button>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/manage-project")}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                <Menu size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition px-3">
                <Download size={16} />
              </button>
              <button className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition px-3">
                <Share2 size={16} />
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition px-3"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition px-3"
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
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-8">
              <div className="space-y-6">
                {/* Title Section */}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700 mb-4 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Project Details
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900">
                    {project.profile.isPrelaunch ? "Pre-launch Project" : "Token Analysis"}
                  </h1>
                  <p className="mt-3 font-mono text-slate-600">{project.profile.tokenAddress || "Pre-launch"}</p>
                </div>

                {/* Risk & Status */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
                  {project.snapshot && (
                    <div className={`rounded-xl border px-4 py-3 ${
                      project.snapshot.riskBaseline === "Low"
                        ? "border-green-300 bg-green-50"
                        : project.snapshot.riskBaseline === "Moderate"
                        ? "border-yellow-300 bg-yellow-50"
                        : project.snapshot.riskBaseline === "Elevated"
                        ? "border-orange-300 bg-orange-50"
                        : "border-red-300 bg-red-50"
                    }`}>
                      <p className={`text-xs font-semibold uppercase ${
                        project.snapshot.riskBaseline === "Low"
                          ? "text-green-700"
                          : project.snapshot.riskBaseline === "Moderate"
                          ? "text-yellow-700"
                          : project.snapshot.riskBaseline === "Elevated"
                          ? "text-orange-700"
                          : "text-red-700"
                      }`}>Risk Level</p>
                      <p className={`mt-1 text-lg font-bold ${
                        project.snapshot.riskBaseline === "Low"
                          ? "text-green-700"
                          : project.snapshot.riskBaseline === "Moderate"
                          ? "text-yellow-700"
                          : project.snapshot.riskBaseline === "Elevated"
                          ? "text-orange-700"
                          : "text-red-700"
                      }`}>{project.snapshot.riskBaseline}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-blue-700">Created</p>
                    <p className="mt-1 font-mono text-sm text-blue-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Configuration */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Token Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Stage</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.stage || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Intent</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.intent || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Mechanics</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Launch Platform</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.launchPlatform || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Launch Type</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.launchType || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Wallets */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Additional Info</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</p>
                  <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                    {project.profile.category || "Not specified"}
                  </p>
                </div>
                {project.profile.devWallet && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Dev Wallet</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 truncate">
                      {project.profile.devWallet}
                    </p>
                  </div>
                )}
                {project.profile.marketingWallet && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Marketing Wallet</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 truncate">
                      {project.profile.marketingWallet}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Analysis */}
            {project.snapshot && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Risk Assessment</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-3">Primary Failure Modes:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.snapshot.primaryFailureModes.map((mode) => (
                        <span
                          key={mode}
                          className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs text-orange-700 font-medium"
                        >
                          <AlertCircle size={12} />
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                  {project.snapshot.nextPrompt && (
                    <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900 font-medium">
                      {project.snapshot.nextPrompt}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Diagnosis */}
            {project.aiDiagnosis && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">AI Analysis</h2>
                <div className="space-y-4">
                  <p className="text-slate-800">{project.aiDiagnosis.summary}</p>
                  {project.aiDiagnosis.riskFactors.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-3">Risk Factors:</p>
                      <ul className="space-y-2">
                        {project.aiDiagnosis.riskFactors.map((factor) => (
                          <li key={factor} className="flex items-start gap-2 text-sm text-slate-700">
                            <AlertCircle size={14} className="mt-1 flex-shrink-0 text-red-600" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.aiDiagnosis.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-3">Recommendations:</p>
                      <ul className="space-y-2">
                        {project.aiDiagnosis.recommendations.map((rec) => (
                          <li key={rec} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle size={14} className="mt-1 flex-shrink-0 text-green-600" />
                            <span>{rec}</span>
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
      </div>
    </div>
  );
};

export default ProjectDetail;
