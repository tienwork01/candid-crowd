import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const apiUpstreamURL = process.env.API_UPSTREAM_URL;

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
    // Every app route renders dynamically, so without these the client router
    // throws away each prefetch and re-fetches the segment on every click.
    // `dynamic` lets a visited route be reused for 30s (the data itself still
    // revalidates through TanStack Query), and `dynamicOnHover` upgrades a
    // hovered link from its loading shell to the real content before the click.
    staleTimes: { dynamic: 30, static: 180 },
    dynamicOnHover: true,
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
  async rewrites() {
    if (!apiUpstreamURL) {
      // A frontend-only build (for example, a preview deployment) does not
      // require an API server. Do not make compilation depend on a runtime
      // proxy target; requests to /api/v1 will receive the normal Next.js 404
      // until API_UPSTREAM_URL is configured for that environment.
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUpstreamURL}/api/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
