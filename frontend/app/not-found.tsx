import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F1F1EC] flex flex-col items-center justify-center p-6 font-mono text-xs">
      <div className="p-6 bg-[#11141A] border border-[rgba(255,255,255,0.06)] rounded max-w-md text-center space-y-4 shadow-xl">
        <div className="text-3xl font-bold text-[#E6C766]">404</div>
        <h1 className="text-sm uppercase tracking-wider text-[#A5A8AF] font-bold">
          Investigation Dossier Not Found
        </h1>
        <p className="text-[#747983] text-[11px]">
          The requested endpoint, case file, or route does not exist.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded bg-[#151920] hover:bg-[#20242C] text-[#E8E8E4] border border-[rgba(230,199,102,0.25)] transition-colors"
          >
            ← Landing Page
          </Link>
          <Link
            href="/app"
            className="px-3 py-1.5 rounded bg-[#E6C766] hover:bg-[#F1D98A] text-[#101116] font-semibold transition-colors"
          >
            Launch Console →
          </Link>
        </div>
      </div>
    </div>
  );
}
