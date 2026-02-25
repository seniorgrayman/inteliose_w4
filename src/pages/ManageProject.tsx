import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Settings, Trash2, Clock, AlertCircle, Check, Copy } from "lucide-react";
import OnboardingWizard from "@/components/OnboardingWizard";
import { useWallet } from "@/contexts/WalletContext";
import { createProject, getUserProjects, deleteProject } from "@/lib/firebase/projects";
import type { ProfileModel, Project } from "@/types/profile";

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const { isConnected, fullWalletAddress, openConnectModal } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedCA, setCopiedCA] = useState<string | null>(null);

  const checkWalletConnected = (): boolean => {
    if (!isConnected || !fullWalletAddress) {
      openConnectModal();
      return false;
    }
    return true;
  };

  // Load projects when wallet is connected
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      if (fullWalletAddress) {
        const userProjects = await getUserProjects(fullWalletAddress);
        setProjects(userProjects.sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [fullWalletAddress]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (profile: ProfileModel) => {
    if (!fullWalletAddress) {
      openConnectModal();
      return;
    }
    try {
      const newProject = await createProject(fullWalletAddress, profile);
      setProjects((prev) => [newProject, ...prev]);
      setShowOnboarding(false);
      navigate(`/manage-project/${newProject.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setDeleting(projectId);
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(null);
    }
  };

  const truncateAddress = (address: string, chars = 6): string => {
    if (!address) return "";
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

  const handleCopyCA = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedCA(address);
    setTimeout(() => setCopiedCA(null), 2000);
  };

  const getRiskColor = (baseline: string) => {
    if (baseline === "Low") return "text-green-700 bg-green-100";
    if (baseline === "Moderate") return "text-yellow-700 bg-yellow-100";
    if (baseline === "Elevated") return "text-orange-700 bg-orange-100";
    return "text-red-700 bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700 mb-3 font-semibold">
              <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              Project Management
            </div>
            <h1 className="text-4xl font-bold text-slate-900">My Projects</h1>
            <p className="mt-2 text-slate-600 font-medium">Create and manage your token analysis projects</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOnboarding(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
          >
            <Plus size={18} />
            New Project
          </motion.button>
        </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowOnboarding(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.65)]"
            >
              <OnboardingWizard onComplete={handleCreateProject} onWalletCheckNeeded={checkWalletConnected} />
              <button
                onClick={() => setShowOnboarding(false)}
                className="mt-8 text-sm text-white/50 hover:text-white/70 transition"
              >
                Close without saving
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-slate-600">
              <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              Loading projects...
            </div>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 text-center"
          >
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
           <div className="flex justify-center items-center my-4">
            <div className="border p-6 border-slate-200 rounded-xl md:max-w-[60%] bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">No projects yet</h3>
            <p className="mt-2 text-slate-600">Create your first token analysis project to get started</p>
           </div>
           </div>
            
            {/* <button
              onClick={() => setShowOnboarding(true)}
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Create Project
            </button> */}
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6 cursor-pointer"
              >
                {/* Top gradient accent */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition" />

                <div className="space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Token</p>
                        {project.profile.isPrelaunch ? (
                          <p className="mt-1 font-mono text-sm text-slate-900">Pre-launch</p>
                        ) : (
                          <div className="mt-1 flex items-center gap-2">
                            <p className="font-mono text-sm text-slate-900">
                              {truncateAddress(project.profile.tokenAddress, 4)}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCA(project.profile.tokenAddress);
                              }}
                              className="inline-flex items-center justify-center w-5 h-5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                              title="Copy contract address"
                            >
                              {copiedCA === project.profile.tokenAddress ? (
                                <Check size={12} className="text-green-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Risk Badge */}
                  {project.snapshot && (
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getRiskColor(project.snapshot.riskBaseline)}`}>
                      <AlertCircle size={12} />
                      {project.snapshot.riskBaseline}
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                      <p className="text-slate-600">Stage</p>
                      <p className="mt-0.5 font-medium text-slate-900 capitalize">
                        {project.profile.stage || "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                      <p className="text-slate-600">Intent</p>
                      <p className="mt-0.5 font-medium text-slate-900 capitalize">
                        {project.profile.intent || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock size={12} />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/manage-project/${project.id}`);
                      }}
                      className="flex-1 rounded-lg bg-blue-100 text-blue-700 px-3 py-2 text-xs font-semibold transition hover:bg-blue-200"
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        View <ArrowRight size={12} />
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      disabled={deleting === project.id}
                      className="rounded-lg bg-red-100 text-red-700 px-3 py-2 text-xs font-semibold transition hover:bg-red-200 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedProject?.id === project.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3 border-t border-slate-200 pt-4"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Platform</p>
                      <p className="mt-1 capitalize text-slate-900">{project.profile.launchPlatform || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Type</p>
                      <p className="mt-1 capitalize text-slate-900">{project.profile.launchType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Category</p>
                      <p className="mt-1 capitalize text-slate-900">{project.profile.category || "—"}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>

    </div>
  );
};

export default ProjectDashboard;
