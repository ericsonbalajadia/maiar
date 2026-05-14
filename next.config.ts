import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,   // disable to avoid React version issues
};

export default nextConfig;
