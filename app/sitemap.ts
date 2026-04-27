import type { MetadataRoute } from "next";

import { getPublishedProductSlugs } from "@/lib/actions/public-products";
import { defaultLocale, locales } from "@/i18n/config";
import { getPublishedPageSlugs } from "@/lib/public-pages";
import { getSiteUrl } from "@/lib/seo";

const STATIC_PUBLIC_PATHS = ["/contact", "/partnerships"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl().toString().replace(/\/$/, "");
  const [pages, products] = await Promise.all([
    getPublishedPageSlugs(),
    getPublishedProductSlugs(),
  ]);

  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  const addUrl = (entry: MetadataRoute.Sitemap[number]) => {
    if (seen.has(entry.url)) {
      return;
    }

    seen.add(entry.url);
    urls.push(entry);
  };

  for (const locale of locales) {
    const localePrefix = locale === defaultLocale ? "" : `/${locale}`;

    addUrl({
      url: `${baseUrl}${localePrefix || "/"}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    });

    for (const path of STATIC_PUBLIC_PATHS) {
      addUrl({
        url: `${baseUrl}${localePrefix}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const page of pages) {
      if (page.slug === "home") {
        continue;
      }

      const path = page.slug === "home" ? "" : `/${page.slug}`;
      addUrl({
        url: `${baseUrl}${localePrefix}${path || "/"}`,
        lastModified: page.updatedAt,
        changeFrequency: "weekly",
        priority: page.slug === "home" ? 1 : 0.85,
      });
    }

    for (const product of products) {
      addUrl({
        url: `${baseUrl}${localePrefix}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  }

  return urls;
}
