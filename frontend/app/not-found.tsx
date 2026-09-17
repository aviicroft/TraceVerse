import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 font-mono text-xs">
      <div className="p-8 bg-surface border border-border rounded-xl max-w-md w-full text-center space-y-5 shadow-vercel">
        <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center mx-auto text-text-muted">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <div className="text-3xl font-bold tracking-tight text-text">404</div>
          <h1 className="text-sm font-semibold tracking-wide text-text-muted mt-1 uppercase">
            Investigation Record Not Found
          </h1>
          <p className="text-text-dim text-xs mt-2 font-sans leading-relaxed">
            The requested forensic route, case file, or target workspace does not exist or has been archived.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-2.5 font-sans">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-medium flex items-center space-x-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Landing Page</span>
          </Link>
          <Link
            href="/app"
            className="px-3.5 py-1.5 rounded-md bg-text text-bg hover:opacity-90 font-medium transition-opacity"
          >
            Launch Console →
          </Link>
        </div>
      </div>
    </div>
  );
}
