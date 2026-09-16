import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { qualities: [75, 85, 90] },
  experimental: {
    ...(process.env.BUILD_CPUS
      ? { cpus: parseInt(process.env.BUILD_CPUS, 10) }
      : {}),
    optimizePackageImports: [
      "@phosphor-icons/react",
      "@phosphor-icons/react/dist/ssr",
      "@base-ui/react",
    ],
  },
};

export default withNextIntl(nextConfig);
