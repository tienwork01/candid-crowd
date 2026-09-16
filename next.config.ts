import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { qualities: [75, 85, 90] },
  experimental: {
    // Keep production builds reliable on constrained developer/CI machines.
    cpus: 1,
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default withNextIntl(nextConfig);
