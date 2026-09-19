import type { MetadataRoute } from "next";
import { locales } from "@/i18n/locales";
import { siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.marketingUrl.replace(/\/$/, "");

  const homeLanguageAlternates: Record<string, string> = {};
  const privacyLanguageAlternates: Record<string, string> = {};
  const termsLanguageAlternates: Record<string, string> = {};

  for (const loc of locales) {
    homeLanguageAlternates[loc] = `${baseUrl}/${loc}`;
    privacyLanguageAlternates[loc] = `${baseUrl}/${loc}/privacy`;
    termsLanguageAlternates[loc] = `${baseUrl}/${loc}/terms`;
  }

  homeLanguageAlternates["x-default"] = `${baseUrl}/en`;
  privacyLanguageAlternates["x-default"] = `${baseUrl}/en/privacy`;
  termsLanguageAlternates["x-default"] = `${baseUrl}/en/terms`;

  const now = new Date();

  const homeEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
    alternates: {
      languages: homeLanguageAlternates,
    },
  }));

  const privacyEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/privacy`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
    alternates: {
      languages: privacyLanguageAlternates,
    },
  }));

  const termsEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/terms`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
    alternates: {
      languages: termsLanguageAlternates,
    },
  }));

  return [...homeEntries, ...privacyEntries, ...termsEntries];
}
