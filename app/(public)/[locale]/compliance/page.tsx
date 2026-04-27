import type { Metadata } from "next";

import { HeroSectionV2 } from "@/components/public/sections/v2/hero-section-v2";
import { CtaSection as CtaSectionV2 } from "@/components/public/sections/v2/CtaSection-v2";
import {
  CertificationsSection,
  ComplianceDetailsSection,
} from "@/components/public/sections/quality";
import { getManagedPublicPageData } from "@/lib/content/public-ui";
import { buildOgImageUrl, createPublicMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

type CompliancePageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 900;

export async function generateMetadata({
  params,
}: CompliancePageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("quality", currentLocale);

  const title = pageData.metadata.title;
  const description = pageData.metadata.description;

  return createPublicMetadata({
    locale: currentLocale,
    pathname: "/compliance",
    title,
    description,
    image: buildOgImageUrl(title, currentLocale),
  });
}

export default async function CompliancePage({ params }: CompliancePageProps) {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("quality", currentLocale);

  return (
    <>
      <HeroSectionV2 data={pageData.hero} />
      <CertificationsSection data={pageData.certifications} />
      <ComplianceDetailsSection data={pageData.complianceDetails} />
      <CtaSectionV2 data={pageData.cta} />
    </>
  );
}
