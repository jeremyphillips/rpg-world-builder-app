import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source, so Next must transpile them.
  transpilePackages: ["@rpg/ui", "@rpg/contracts"],
};

export default nextConfig;
