import { cache } from "react";

import db from "@/lib/db";

export interface PublicSiteSettings {
  siteName: string | null;
  siteTagline: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  seoDefaultTitle: string | null;
  seoDefaultDescription: string | null;
}

const SITE_SETTING_KEYS = [
  "siteName",
  "siteTagline",
  "contactEmail",
  "contactPhone",
  "contactAddress",
  "seoDefaultTitle",
  "seoDefaultDescription",
] as const;

function toNullableString(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const getPublicSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  const defaults: PublicSiteSettings = {
    siteName: null,
    siteTagline: null,
    contactEmail: null,
    contactPhone: null,
    contactAddress: null,
    seoDefaultTitle: null,
    seoDefaultDescription: null,
  };

  const settings = await db.siteSetting.findMany({
    where: {
      key: {
        in: [...SITE_SETTING_KEYS],
      },
    },
    select: {
      key: true,
      value: true,
    },
  });

  for (const setting of settings) {
    if (setting.key in defaults) {
      const key = setting.key as keyof PublicSiteSettings;
      defaults[key] = toNullableString(setting.value);
    }
  }

  return defaults;
});
