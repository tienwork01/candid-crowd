import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.marketingUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/en",
          "/vi",
          "/es",
          "/fr",
          "/de",
          "/it",
          "/pt-BR",
          "/en/privacy",
          "/vi/privacy",
          "/es/privacy",
          "/fr/privacy",
          "/de/privacy",
          "/it/privacy",
          "/pt-BR/privacy",
          "/en/terms",
          "/vi/terms",
          "/es/terms",
          "/fr/terms",
          "/de/terms",
          "/it/terms",
          "/pt-BR/terms",
        ],
        disallow: [
          "/api/",
          "/events",
          "/events/",
          "/billing",
          "/billing/",
          "/profile",
          "/profile/",
          "/create",
          "/create/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/events",
          "/events/",
          "/billing",
          "/profile",
          "/create",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
