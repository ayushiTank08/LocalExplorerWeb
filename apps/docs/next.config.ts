import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@nextforge/ui"],
  experimental: {
    typedRoutes: true,
  },
};

export default config; 