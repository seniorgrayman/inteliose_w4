import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string;
}

const ComingSoonModal = ({ isOpen, onClose, date = "25th February 2026" }: ComingSoonModalProps) => {
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
            className="relative bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-xl border border-[hsl(var(--border)/0.4)] rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_20px_60px_-15px_hsl(0_0%_0%/0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="text-center space-y-6">
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto"
              >
                <Sparkles size={28} className="text-primary" />
              </motion.div>

              {/* Heading */}
              <div>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-2">Coming Soon</h2>
                <p className="text-sm text-muted-foreground">
                  The Manage Project feature will be available on
                </p>
              </div>

              {/* Date highlight */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 space-y-1">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">Launch Date</p>
                <p className="text-lg font-display font-semibold text-primary">{date}</p>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground/70 leading-relaxed">
                We're building something amazing. Stay tuned for advanced project management tools coming your way!
              </p>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-display font-semibold transition-all shadow-[0_4px_15px_hsl(var(--primary)/0.25),0_1px_0_0_hsl(0_0%_100%/0.15)_inset] hover:shadow-[0_8px_30px_hsl(var(--primary)/0.35)]"
              >
                Got it, thanks!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;
