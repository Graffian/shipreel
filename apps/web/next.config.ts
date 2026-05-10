import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@shipreel/shared-types",
    "@shipreel/video-engine",
    "@shipreel/ai-pipeline",
  ],
};

export default nextConfig;
