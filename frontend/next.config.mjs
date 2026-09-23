/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double-render issues with cytoscape canvas in dev
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: '/docs.html',
      },
      {
        source: '/docs/:path*',
        destination: '/docs.html',
      },
    ];
  },
};

export default nextConfig;
