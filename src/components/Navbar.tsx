import { ArrowRight, Menu, Wallet, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WalletConnectModal, { truncateAddress, type WalletType } from "./WalletConnectModal";

const navLinks = [
  { label: "Product", target: "context" },
  { label: "Intelligence", target: "technology" },
  { label: "Modules", target: "modules" },
  { label: "How It Works", target: "how-it-works" },
  { label: "FAQ", target: "faq" },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null);

  // Restore wallet connection from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    const savedWallet = localStorage.getItem("walletType") as WalletType | null;
    if (savedAddress && savedWallet) {
      setConnectedAddress(savedAddress);
      setConnectedWallet(savedWallet);
    }
  }, []);

  const handleConnected = (address: string, wallet: WalletType) => {
    setConnectedAddress(address);
    setConnectedWallet(wallet);
  };

  return (
    <>
      <div className="relative z-10 w-full flex justify-center">
        <nav className="bg-[hsl(var(--glass-bg))] backdrop-blur-md border border-[hsl(var(--glass-border))] rounded-full py-2 px-3 flex items-center text-white gap-4 md:gap-6 text-sm max-w-full">
          <Link to="/" className="inline-flex items-center justify-center font-display font-bold text-lg md:text-xl tracking-tight pr-1 md:pr-2 whitespace-nowrap">
            inteliose™
          </Link>
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="text-white/80 hover:text-white transition-colors whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="hidden sm:inline-flex bg-transparent border border-[hsl(0_0%_100%/0.2)] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[hsl(0_0%_100%/0.1)] transition-colors whitespace-nowrap">
              Launch App
            </Link>
            {connectedAddress ? (
              <button className="bg-white text-foreground px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2 font-display">
                <Wallet size={14} />
                {truncateAddress(connectedAddress)}
              </button>
            ) : (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="bg-white text-foreground px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <Wallet size={14} />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
          </div>
          {/* <button className="lg:hidden ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button> */}
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-72 h-full bg-card border-l border-border p-6 flex flex-col gap-2 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="font-display font-bold text-lg text-foreground">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => {
                  scrollTo(link.target);
                  setMobileOpen(false);
                }}
                className="text-left text-foreground hover:text-primary transition-colors py-3 border-b border-border text-base"
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/dashboard"
              className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-full text-center text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Launch App
            </Link>
          </div>
        </div>
      )}

      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnected={handleConnected}
      />
    </>
  );
};

export default Navbar;
