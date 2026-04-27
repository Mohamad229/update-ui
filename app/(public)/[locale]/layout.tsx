import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteFooterV2 } from "@/components/public/v2/site-footer-v2";
import { SiteHeaderV2 } from "@/components/public/v2/site-header-v2";
import { locales, localeDirection, type Locale } from "@/i18n/config";
import { getAbsoluteUrl } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function PublicLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();
  const direction = localeDirection[locale as Locale];
  const currentLocale = locale as Locale;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Damira Pharma",
    url: getAbsoluteUrl(currentLocale === "ar" ? "/ar" : "/"),
    logo: getAbsoluteUrl("/favicon.ico"),
    description:
      currentLocale === "ar"
        ? "شركة داميرا فارما تقدم حلول دوائية موثوقة في مصر والمنطقة."
        : "Damira Pharma delivers trusted pharmaceutical solutions across Egypt and the MENA region.",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@damirapharma.com",
        telephone: "+20-2-2390-2200",
        areaServed: "MENA",
      },
    ],
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <div
        lang={locale}
        dir={direction}
        className="min-h-screen bg-background text-foreground"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <SiteHeaderV2 />
        <main className="flex-1">{children}</main>
        <SiteFooterV2 locale={currentLocale} />
      </div>
    </NextIntlClientProvider>
  );
}
