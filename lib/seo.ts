import type { Metadata } from "next";

import { defaultLocale, locales, type Locale } from "@/i18n/config";

const FALLBACK_SITE_URL = "http://localhost:3000";
const DEFAULT_OG_IMAGE = "/og?title=Damira%20Pharma";

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL || FALLBACK_SITE_URL;

  try {
    return new URL(value);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export function getAbsoluteUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}

export function getLocalizedPath(locale: Locale, pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (locale === defaultLocale) {
    return normalizedPath;
  }

  return `/${locale}${normalizedPath}`;
}

export function buildLocaleAlternates(pathname: string) {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = getAbsoluteUrl(getLocalizedPath(locale, pathname));
  }

  return {
    canonical: getAbsoluteUrl(getLocalizedPath(defaultLocale, pathname)),
    languages,
  };
}

interface PublicMetadataInput {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
}

export function createPublicMetadata({
  locale,
  pathname,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: PublicMetadataInput): Metadata {
  const localizedPath = getLocalizedPath(locale, pathname);
  const url = getAbsoluteUrl(localizedPath);
  const imageUrl = getAbsoluteUrl(image);

  return {
    title,
    description,
    alternates: buildLocaleAlternates(pathname),
    openGraph: {
      type,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      url,
      title,
      description,
      siteName: "Damira Pharma",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildOgImageUrl(title: string, locale: Locale) {
  const query = new URLSearchParams({ title, locale });
  return `/og?${query.toString()}`;
}
