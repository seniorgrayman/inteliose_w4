import { ArrowRight, Menu, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnectModal, { truncateAddress, type WalletType } from "./WalletConnectModal";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null);

  const handleConnected = (address: string, wallet: WalletType) => {
    setConnectedAddress(address);
    setConnectedWallet(wallet);
  };

  return (
    <>
      <div className="relative z-10 w-full flex justify-center">
        <nav className="bg-[hsl(var(--glass-bg))] backdrop-blur-md border border-[hsl(var(--glass-border))] rounded-full py-2 px-3 flex items-center gap-6 text-sm overflow-x-auto hide-scrollbar max-w-full">
          <a href="#" className="inline-flex items-center justify-center font-display font-bold text-xl tracking-tight text-white pr-2">
            inteliose™
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">Product</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">Intelligence Modules</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">Founder Dashboard</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="bg-transparent border border-[hsl(0_0%_100%/0.2)] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[hsl(0_0%_100%/0.1)] transition-colors whitespace-nowrap">
              Launch App
            </Link>
            {connectedAddress ? (
              <button className="bg-white text-foreground px-4 py-1.5 rounded-full text-sm hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2 font-display">
                <Wallet size={14} />
                {truncateAddress(connectedAddress)}
              </button>
            ) : (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="bg-white text-foreground px-4 py-1.5 rounded-full text-sm hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <Wallet size={14} />
                Connect Wallet
              </button>
            )}
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={20} />
          </button>
        </nav>
      </div>

      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnected={handleConnected}
      />
    </>
  );
};

export default Navbar;
