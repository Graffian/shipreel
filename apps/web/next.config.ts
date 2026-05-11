import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@shipreel/shared-types",
    "@shipreel/video-engine",
    "@shipreel/ai-pipeline",
  ],
  experimental: {
    proxyClientMaxBodySize: '200mb',
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:4001/api/:path*' },
      { source: '/uploads/:path*', destination: 'http://localhost:4001/uploads/:path*' },
      { source: '/output/:path*', destination: 'http://localhost:4001/output/:path*' },
    ]
  },
};

export default nextConfig;
