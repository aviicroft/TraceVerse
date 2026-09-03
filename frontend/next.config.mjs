/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double-render issues with cytoscape canvas in dev
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/landing.html',
      },
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
