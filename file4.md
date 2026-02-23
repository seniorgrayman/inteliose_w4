"use client";

import Link from "next/link";


const SOLANA_LOGO =
  "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png";
const BASE_LOGO =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFGBNsjmwFsBSrnABc7-V_lwFS_EtiIUsc0g&s";
const BLOCKCHAIN_HERO_IMG =
  "https://automationalley.com/wp-content/uploads/64ee0012ebc633f30aa49466_blockchain-technology-concept-2021-08-26-15-33-00-utc.jpg";

export default function Home() {
  
  return (
    <div className="relative min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-3 pb-24 pt-10 sm:px-6 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              Multi-chain token intelligence
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Analyze tokens on Solana + Base.
              {/* <span className="block bg-[linear-gradient(90deg,rgba(34,211,238,0.95),rgba(99,102,241,0.92),rgba(236,72,153,0.85))] bg-clip-text text-transparent">
                One input. Clear signals. No hype language.
              </span> */}
          </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/65">
              Inteliose helps you dyor faster: real-time market telemetry, liquidity signals, authority checks,
              and neutral AI summaries. Choose the chain first, then paste the token address.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold text-white/80">
                <img
                  src={SOLANA_LOGO}
                  alt="Solana"
                  className="h-5 w-5 object-contain"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                Solana DYOR (holders + BubbleMaps)
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold text-white/80">
                <img
                  src={BASE_LOGO}
                  alt="Base"
                  className="h-5 w-5 rounded-full object-contain"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                Base DYOR (Coinbase + Zerion fallback)
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dyor"
                prefetch={false}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(90deg,rgba(34,211,238,0.22),rgba(99,102,241,0.18),rgba(236,72,153,0.14))] px-6 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_70px_rgba(0,0,0,0.55)] transition hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_30px_90px_rgba(0,0,0,0.65)]"
              >
                DYOR Intelligence
                <span className="text-white/60 transition group-hover:text-white/90">
                  →
                </span>
              </Link>
              <Link
                href="/onboarding"
                prefetch={false}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Manage Project
              </Link>
            </div>

            

            <div className="mt-10 md:hidden -mx-3 sm:mx-0">
          <div className="overflow-hidden border-y border-white/10 bg-black/20 sm:rounded-3xl sm:border sm:border-white/10">
            <img
              src={BLOCKCHAIN_HERO_IMG}
              alt="Blockchain intelligence"
              className="h-auto w-full object-cover motion-safe:animate-float-slow"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

            <div className="mt-6 max-w-xl">
              {/* <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.65)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.14),transparent_55%)]" />
            <Image
                  src="/dao-intelligence-hero.PNG"
                  alt="INTELIOSE"
                  width={1200}
                  height={1200}
                  priority
                  className="h-auto w-full opacity-95"
                />
              </div> */}
            </div>
            {/* <div className="mt-3 text-xs text-white/55">
              No account required for onboarding. Monitoring uses Google sign-in.
            </div> */}
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.6)]">
              <div className="text-xs font-semibold tracking-wider text-white/60">
                What DYOR gives you
              </div>
              <div className="mt-4 space-y-4 text-sm text-white/75">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90">Market snapshot (best-effort)</div>
                  <div className="mt-2 text-xs text-white/55">
                    Price • Liquidity • Volume • Buy/Sell telemetry when available
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90">Distribution + supply signals (Solana)</div>
                  <div className="mt-2 text-xs text-white/55">
                    Top wallets (ex-LP) • Whale count • BubbleMaps clusters
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90">Neutral AI explanation</div>
                  <div className="mt-2 text-xs text-white/55">
                    Describes token properties + what they imply. Not trading advice.
                  </div>
                </div>
              </div>
              {/* <div className="mt-6 text-xs text-white/45">
                If analysis feels like a hassle, we failed.
              </div> */}
            </div>
          </div>
        </div>

        {/* Full-bleed image (mobile) */}
        <div className="mt-10 hidden md:block -mx-3 sm:mx-0">
          <div className="overflow-hidden border-y border-white/10 bg-black/20 sm:rounded-3xl sm:border sm:border-white/10">
            <img
              src={BLOCKCHAIN_HERO_IMG}
              alt="Blockchain intelligence"
              className="h-auto w-full object-cover motion-safe:animate-float-slow"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.55)] sm:p-10 lg:col-span-12">
            <div className="text-xs font-semibold tracking-wider text-white/55">How it works</div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold text-white">1) Choose chain</div>
                <div className="mt-2 text-xs text-white/60">Solana or Base — this routes to the correct analytics path.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold text-white">2) Paste token address</div>
                <div className="mt-2 text-xs text-white/60">We validate it first. If it’s not a real token, we stop.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold text-white">3) Read the signals</div>
                <div className="mt-2 text-xs text-white/60">Telemetry + distribution (Solana) + neutral AI summary.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
