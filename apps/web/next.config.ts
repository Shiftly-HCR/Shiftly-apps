import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@shiftly/ui", "@shiftly/data"],
};

export default nextConfig;
