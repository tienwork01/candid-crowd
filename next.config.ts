import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { qualities: [75, 85, 90] },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
