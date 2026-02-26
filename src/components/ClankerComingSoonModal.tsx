import { motion, AnimatePresence } from "framer-motion";
import { X, Radio, Zap, Sparkles } from "lucide-react";

interface ClankerComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClankerComingSoonModal = ({ isOpen, onClose }: ClankerComingSoonModalProps) => {
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
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-accent/20 blur-[80px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground z-10"
            >
              <X size={16} />
            </button>

            {/* Content - Scrollable */}
            <div className="relative z-10 text-center space-y-8 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
              {/* Icon with animation */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
                <div className="flex items-center gap-1">
                  <Radio size={28} className="text-primary" />
                  <Zap size={24} className="text-primary animate-pulse" />
                </div>
              </motion.div>

              {/* Heading */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-display font-bold text-foreground">Clanker</h2>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    ⚡
                  </motion.span>
                </div>
                <p className="text-sm text-muted-foreground/80">
                  Real-time blockchain exploration & memecoin tracking
                </p>
              </div>

              {/* Feature preview */}
              <div className="space-y-2 bg-secondary/40 border border-[hsl(var(--border)/0.3)] rounded-2xl p-4 text-left">
                <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">What's Coming</p>
                <ul className="space-y-2 text-sm text-muted-foreground/70">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    Live token discovery & analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    Real-time market signals
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    Advanced filtering & sorting
                  </li>
                </ul>
              </div>

              {/* Tech Update badge */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mx-auto"
              >
                <Sparkles size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">Tech Update Coming Soon</span>
              </motion.div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-display font-semibold transition-all shadow-[0_4px_15px_hsl(var(--primary)/0.3),0_1px_0_0_hsl(0_0%_100%/0.15)_inset] hover:shadow-[0_8px_30px_hsl(var(--primary)/0.4)]"
              >
                Got it, Thanks!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClankerComingSoonModal;
