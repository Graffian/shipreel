import type { NextConfig } from "next";

const API_UPSTREAM = process.env.API_UPSTREAM || 'http://localhost:4000'

const nextConfig: NextConfig = {
  transpilePackages: [
    "@shipreel/shared-types",
    "@shipreel/video-engine",
    "@shipreel/ai-pipeline",
  ],
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_UPSTREAM}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_UPSTREAM}/uploads/:path*` },
      { source: '/output/:path*', destination: `${API_UPSTREAM}/output/:path*` },
    ]
  },
};

export default nextConfig;
