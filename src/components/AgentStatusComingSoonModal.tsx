import { motion, AnimatePresence } from "framer-motion";
import { X, Fingerprint, Brain, Shield, TrendingUp } from "lucide-react";

interface AgentStatusComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgentStatusComingSoonModal = ({ isOpen, onClose }: AgentStatusComingSoonModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-gradient-to-br from-card/95 via-card/85 to-card/80 backdrop-blur-xl border border-[hsl(var(--border)/0.5)] rounded-3xl max-w-md w-full mx-4 shadow-[0_20px_60px_-15px_hsl(0_0%_0%/0.3)] max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-500/20 blur-[80px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground z-10"
            >
              <X size={16} />
            </button>

            {/* Content - Scrollable */}
            <div className="relative z-10 text-center space-y-8 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/40">
              {/* Icon with animation - Multiple icons */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 border-2 border-purple-500/30 flex items-center justify-center mx-auto relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-transparent animate-pulse" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="flex items-center justify-center"
                >
                  <Fingerprint size={28} className="text-purple-400" />
                </motion.div>
              </motion.div>

              {/* Heading */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-display font-bold text-foreground">Agent Status</h2>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🤖
                  </motion.span>
                </div>
                <p className="text-sm text-muted-foreground/80">
                  Monitor AI agent performance & health metrics
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 border border-[hsl(var(--border)/0.3)] rounded-2xl p-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10"
                >
                  <Brain size={20} className="text-purple-700" />
                  <span className="text-xs font-semibold text-purple-800">Intelligence</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10"
                >
                  <TrendingUp size={20} className="text-blue-700" />
                  <span className="text-xs font-semibold text-blue-800">Performance</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 col-span-2"
                >
                  <Shield size={20} className="text-cyan-700" />
                  <span className="text-xs font-semibold text-cyan-800">Health Metrics</span>
                </motion.div>
              </div>

              {/* Feature list */}
              <div className="text-left space-y-2 bg-secondary/40 border border-[hsl(var(--border)/0.3)] rounded-2xl p-4">
                <p className="text-xs font-semibold text-purple-400/80 uppercase tracking-wider">Upcoming Features</p>
                <ul className="space-y-2 text-sm text-muted-foreground/70">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50" />
                    Real-time agent health dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50" />
                    Performance metrics & analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50" />
                    Automated alert system
                  </li>
                </ul>
              </div>

              {/* Tech Update badge */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mx-auto"
              >
                <Brain size={14} className="text-purple-400" />
                <span className="text-xs font-semibold text-purple-400">Tech Update Coming Soon</span>
              </motion.div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700/80 text-white text-sm font-display font-semibold transition-all shadow-[0_4px_15px_hsl(279_50%_50%/0.3),0_1px_0_0_hsl(0_0%_100%/0.15)_inset] hover:shadow-[0_8px_30px_hsl(279_50%_50%/0.4)]"
              >
                Exciting! I'll Stay Tuned
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentStatusComingSoonModal;
