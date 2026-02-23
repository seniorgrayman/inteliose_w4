import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Settings, Trash2, Clock, AlertCircle, Check } from "lucide-react";
import OnboardingWizard from "@/components/OnboardingWizard";
import { createProject, getUserProjects, deleteProject } from "@/lib/firebase/projects";
import type { ProfileModel, Project } from "@/types/profile";

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load projects on mount
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      // Get user ID from wallet or local storage - optional now
      const userId = localStorage.getItem("walletAddress");
      if (userId) {
        const userProjects = await getUserProjects(userId);
        setProjects(userProjects.sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        // Show empty state if no wallet connected
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (profile: ProfileModel) => {
    const userId = localStorage.getItem("walletAddress");
    if (!userId) {
      navigate("/");
      return;
    }
    try {
      const newProject = await createProject(userId, profile);
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

  const getRiskColor = (baseline: string) => {
    if (baseline === "Low") return "text-green-400 bg-green-400/10";
    if (baseline === "Moderate") return "text-yellow-400 bg-yellow-400/10";
    if (baseline === "Elevated") return "text-orange-400 bg-orange-400/10";
    return "text-red-400 bg-red-400/10";
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            Project Management
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">My Projects</h1>
          <p className="mt-2 text-white/60">Create and manage your token analysis projects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowOnboarding(true)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] transition hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
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
              <OnboardingWizard onComplete={handleCreateProject} />
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
            <div className="inline-flex items-center gap-2 text-white/60">
              <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Loading projects...
            </div>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl"
          >
            <AlertCircle size={48} className="mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold text-white">No projects yet</h3>
            <p className="mt-2 text-white/60">Create your first token analysis project to get started</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Create Project
            </button>
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
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 cursor-pointer transition hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
              >
                {/* Top gradient accent */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition" />

                <div className="space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Token</p>
                        <p className="mt-1 font-mono text-sm text-white truncate">
                          {project.profile.isPrelaunch ? "Pre-launch" : project.profile.tokenAddress}
                        </p>
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
                    <div className="rounded-lg bg-black/30 p-2">
                      <p className="text-white/50">Stage</p>
                      <p className="mt-0.5 font-medium text-white capitalize">
                        {project.profile.stage || "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/30 p-2">
                      <p className="text-white/50">Intent</p>
                      <p className="mt-0.5 font-medium text-white capitalize">
                        {project.profile.intent || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-white/50">
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
                      className="flex-1 rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
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
                      className="rounded-lg bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"
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
                    className="mt-4 space-y-3 border-t border-white/10 pt-4"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase">Platform</p>
                      <p className="mt-1 capitalize text-white">{project.profile.launchPlatform || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase">Type</p>
                      <p className="mt-1 capitalize text-white">{project.profile.launchType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase">Category</p>
                      <p className="mt-1 capitalize text-white">{project.profile.category || "—"}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
