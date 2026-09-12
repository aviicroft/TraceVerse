import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIH TRACEVERSE - Automated Wallet to VASP Attribution Engine',
  description: 'Automated attribution of unknown cryptocurrency wallets to nearest Virtual Asset Service Providers (VASPs) through real blockchain intelligence APIs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" async></script>
      </head>
      <body className="bg-[#0B0D11] text-[#F1F1EC] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

