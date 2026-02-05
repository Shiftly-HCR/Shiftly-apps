import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@shiftly/ui", "@shiftly/data"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
