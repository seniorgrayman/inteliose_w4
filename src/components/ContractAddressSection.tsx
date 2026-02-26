import { useState } from "react";
import { Copy, Check } from "lucide-react";

const ContractAddressSection = () => {
  const [copied, setCopied] = useState(false);
  const contractAddress = "0xEd1d2D01735FED519e3e566dd8F26068E0d21B07";

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl px-6 md:px-8 py-5 md:py-6 backdrop-blur-sm max-w-2xl w-full">
        <p className="text-xs text-muted-foreground mb-3 font-display font-semibold uppercase tracking-wider text-center">
          Inteliose Token on Base
        </p>
        <button
          onClick={handleCopy}
          className="
            w-full flex items-center justify-between gap-3
            bg-card/60 hover:bg-card/80
            border border-border/50 hover:border-primary/30
            px-5 py-3 rounded-xl
            transition-all
            group
          "
        >
          <span className="font-mono text-sm md:text-base text-foreground/90 group-hover:text-foreground">
            {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
          </span>
          <div className="flex-shrink-0 flex items-center gap-2">
            {copied ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <>
                <Copy size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </>
            )}
          </div>
        </button>
        <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
          {copied ? "✓ Copied to clipboard" : "Click to copy"}
        </p>
      </div>
    </div>
  );
};

export default ContractAddressSection;
