import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: false,   // disable to avoid React version issues
  },
};

export default nextConfig;
