"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearProfile } from "@/lib/intel/storage";
import { useSolanaWallet } from "@/lib/solana/use-solana-wallet";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Icon({ name }: { name: "menu" | "close" | "grid" | "list" | "bell" | "pie" }) {
  const common = "h-4 w-4";
  if (name === "menu") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "grid") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "list") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  // pie
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none">
      <path d="M11 3a9 9 0 1 0 9 9h-9V3Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 3v8h8A8 8 0 0 0 13 3Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DashboardSidebar({
  nav,
  pathname,
  compact,
  onNavigate,
}: {
  nav: Array<{ href: string; label: string; icon: "grid" | "list" | "bell" | "pie"; disabled?: boolean }>;
  pathname: string;
  compact?: boolean;
  onNavigate: () => void;
}) {
  const wallet = useSolanaWallet();
  return (
    <aside
      className={cx(
        "h-full border-r border-white/10 bg-white/5",
        compact ? "w-full" : "w-[280px]"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="px-5 pb-4 pt-5">
          <div className="text-xs font-semibold tracking-wider text-white/55">
            Dashboard
          </div>
          <div className="mt-2 text-sm font-semibold text-white/90">
            Token monitoring
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
            <span className="ai-orb h-2.5 w-2.5 rounded-full" />
            Inference engine
            <span className="ai-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>

        <nav className="px-3">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (pathname === "/dashboard" && item.href === "/dashboard/overview");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cx(
                  "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  item.disabled && "pointer-events-none opacity-50",
                  active
                    ? "border-cyan-300/35 bg-cyan-300/10 text-white shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                    : "border-transparent text-white/75 hover:border-white/10 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-white/70">
                    <Icon name={item.icon} />
                  </span>
                  {item.label}
                </span>
                <span className="text-white/40">→</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-5 py-5">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold tracking-wider text-white/55">Account</div>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await wallet.disconnect();
                  } catch {
                    // ignore
                  }
                  clearProfile();
                  window.location.href = "/";
                }}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Log out
              </button>
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = useMemo(
    () => [
      { href: "/dashboard/overview", label: "Overview", icon: "grid" as const },
      // { href: "/dashboard/tokenomics", label: "Tokenomics", icon: "pie" as const },
      { href: "/dashboard/checklist", label: "Checklist", icon: "list" as const },
      // { href: "/dashboard/alerts", label: "Alerts", icon: "bell" as const, disabled: isPrelaunch },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-16 pt-8 sm:px-6 lg:pt-10">
      {/*
        Mobile hamburger lives in the persistent AppHeader.
        We listen for that click here and open the dashboard drawer.
      */}
      <DashboardMenuListener onOpen={() => setOpen(true)} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <DashboardSidebar nav={nav} pathname={pathname} onNavigate={() => setOpen(false)} />
        </div>
        <main className="min-w-0">{children}</main>
      </div>

      {/* Mobile drawer */}
      <div className={cx("fixed inset-0 z-[70] lg:hidden", open ? "" : "pointer-events-none")}>
        <div
          className={cx(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cx(
            "absolute left-0 top-0 h-full w-[86vw] max-w-[360px] transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.70))] shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="text-xs font-semibold tracking-wider text-white/55">
                Dashboard menu
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close dashboard menu"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <DashboardSidebar
                nav={nav}
                pathname={pathname}
                compact
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMenuListener({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener("dao-intel:dashboard-menu", handler);
    return () => window.removeEventListener("dao-intel:dashboard-menu", handler);
  }, [onOpen]);
  return null;
}

