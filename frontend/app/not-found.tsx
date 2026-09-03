import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060A12] text-slate-100 flex flex-col items-center justify-center p-6 font-mono text-xs">
      <div className="p-6 bg-[#0E1626] border border-[#1A2436] rounded max-w-md text-center space-y-4 shadow-xl">
        <div className="text-3xl font-bold text-[#38BDF8]">404</div>
        <h1 className="text-sm uppercase tracking-wider text-slate-300 font-bold">
          Investigation Dossier Not Found
        </h1>
        <p className="text-slate-500 text-[11px]">
          The requested endpoint, case file, or route does not exist.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded bg-[#131E32] hover:bg-[#18243D] text-[#7DD3FC] border border-[#2A3A55] transition-colors"
          >
            ← Landing Page
          </Link>
          <Link
            href="/app"
            className="px-3 py-1.5 rounded bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#061018] font-semibold transition-colors"
          >
            Launch Console →
          </Link>
        </div>
      </div>
    </div>
  );
}
