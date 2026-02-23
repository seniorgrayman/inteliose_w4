import Link from "next/link";

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error;
  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-20 pt-10 sm:px-6 lg:pt-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(0,0,0,0.65)] sm:p-10">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-white/55">
            <span className="ai-orb h-2.5 w-2.5 rounded-full" />
            INTELIOSE — Monitoring Access
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Monitoring access has moved to wallet connect
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-white/65">
            We no longer use Google sign-in. Connect your Solana wallet from the header, then continue in Manage Project / Dashboard.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Back
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-pink-300/25 bg-pink-400/10 p-4 text-xs text-pink-100">
            <div className="font-semibold">Sign-in error</div>
            <div className="mt-1 opacity-90">Code: {error}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

