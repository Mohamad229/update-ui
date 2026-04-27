import type { Metadata } from "next";

import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";
import { CtaSection as CtaSectionV2 } from "@/components/public/sections/v2/CtaSection-v2";
import { HeroSectionV2 } from "@/components/public/sections/v2/hero-section-v2";
import { StatsSectionV2 } from "@/components/public/sections/v2/stats-section-v2";
import { PartnershipInquirySectionV2 } from "@/components/public/sections/v2/partnership-inquiry-section-v2";
import { WhyPartnerSectionV2 } from "@/components/public/sections/v2/why-partner-section-v2";

import type { Locale } from "@/i18n/config";
import { getManagedPublicPageData } from "@/lib/content/public-ui";
import { buildOgImageUrl, createPublicMetadata } from "@/lib/seo";

type PartnershipsPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 900;

export async function generateMetadata({
  params,
}: PartnershipsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("partnerships", currentLocale);

  const title = pageData.metadata.title;
  const description = pageData.metadata.description;

  return createPublicMetadata({
    locale: currentLocale,
    pathname: "/partnerships",
    title,
    description,
    image: buildOgImageUrl(title, currentLocale),
  });
}

export default async function PartnershipsPage({
  params,
}: PartnershipsPageProps) {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("partnerships", currentLocale);

  return (
    <>
      <section id="partners-overview" className="scroll-mt-32">
        <HeroSectionV2 data={pageData.hero} />
      </section>
      <section id="partners-why" className="scroll-mt-32">
        <WhyPartnerSectionV2 data={pageData.whyPartner} />
      </section>
      <section id="partners-inquiry" className="scroll-mt-32">
        <PartnershipInquirySectionV2
          data={pageData.partnershipForm}
          locale={currentLocale}
        />
      </section>
      {/* <section id="partners-market-access" className="scroll-mt-32">
        <ContentSectionV2 data={pageData.marketAccess} />
      </section> */}
      {/* <section id="partners-infrastructure" className="scroll-mt-32">
        <ContentSectionV2 data={pageData.infrastructureStrength} />
      </section> */}
      {/* <section id="partners-reach" className="scroll-mt-32">
        <StatsSectionV2 data={pageData.commercialReach} />
      </section> */}
      {/* <section id="partners-proven-success" className="scroll-mt-32">
        <ContentSectionV2 data={pageData.provenSuccess} />
      </section> */}
      {/* <section id="partners-cta" className="scroll-mt-32">
        <CtaSectionV2 data={pageData.cta} />
      </section> */}
    </>
  );
}
