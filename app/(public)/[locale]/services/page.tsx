import type { Metadata } from "next";


import { CardGridV2 } from "@/components/public/sections/v2/CardGrid-v2";
import { HeroSectionV2 } from "@/components/public/sections/v2/hero-section-v2";

import { CtaSection } from "@/components/public/sections/v2/CtaSection-v2";
import {
  ColdChainSection,
  InfrastructureSection,
  LogisticsDistributionSection,
  MarketAccessSection,
  MedicalSupportSection,
  RegulatoryServicesSection,
  SafetyVigilanceSection,
} from "@/components/public/sections/services";
import { getManagedPublicPageData } from "@/lib/content/public-ui";
import { buildOgImageUrl, createPublicMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 900;

export async function generateMetadata({
  params,
}: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("services", currentLocale);

  const title = pageData.metadata.title;
  const description = pageData.metadata.description;

  return createPublicMetadata({
    locale: currentLocale,
    pathname: "/services",
    title,
    description,
    image: buildOgImageUrl(title, currentLocale),
  });
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("services", currentLocale);

  return (
    <>
      <section id="services-overview" className="scroll-mt-32">
        <HeroSectionV2 data={pageData.hero} />
      </section>
      <section id="services-infrastructure" className="scroll-mt-32">
        <InfrastructureSection data={pageData.infrastructure} />
      </section>
      <section id="services-cold-chain" className="scroll-mt-32">
        <ColdChainSection data={pageData.coldChain} />
      </section>
      <section id="services-regulatory" className="scroll-mt-32">
        <RegulatoryServicesSection data={pageData.regulatory} />
      </section>
      <section id="services-safety" className="scroll-mt-32">
        <SafetyVigilanceSection data={pageData.safetyVigilance} />
      </section>
      <section id="services-medical" className="scroll-mt-32">
        <MedicalSupportSection data={pageData.medicalSupport} />
      </section>
      <section id="services-logistics" className="scroll-mt-32">
        <LogisticsDistributionSection data={pageData.logisticsDistribution} />
      </section>
      <section id="services-market-access" className="scroll-mt-32">
        <MarketAccessSection data={pageData.marketAccess} />
      </section>
    </>
  );
}
