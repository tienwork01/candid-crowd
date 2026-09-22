import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.88.218:3000",
    "192.168.88.218",
    "10.0.0.101",
    "10.0.0.101:3000",
  ],
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
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/register",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
