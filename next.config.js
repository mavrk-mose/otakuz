/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*', // Proxy to PostHog cloud service
      },
    ];
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
