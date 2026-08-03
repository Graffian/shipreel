import type { NextConfig } from "next";

const EXPRESS_URL = process.env.EXPRESS_URL || 'http://localhost:4000'

const nextConfig: NextConfig = {
  transpilePackages: [
    "@shipreel/shared-types",
    "@shipreel/video-engine",
    "@shipreel/ai-pipeline",
  ],
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${EXPRESS_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${EXPRESS_URL}/uploads/:path*` },
      { source: '/output/:path*', destination: `${EXPRESS_URL}/output/:path*` },
    ]
  },
};

export default nextConfig;
