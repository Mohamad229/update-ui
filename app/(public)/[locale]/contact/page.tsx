import type { Metadata } from "next";

import { HeroSectionV2 } from "@/components/public/sections/v2/hero-section-v2";
import { ContactInfoSectionV2 } from "@/components/public/sections/v2/contact-info-section-v2";
import { ContactFormSection as ContactFormSectionV2 } from "@/components/public/sections/v2/contact-form-section-v2";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";
import type { Locale } from "@/i18n/config";
import { getManagedPublicPageData } from "@/lib/content/public-ui";
import { buildOgImageUrl, createPublicMetadata } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 900;

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("contact", currentLocale);

  const title = pageData.metadata.title;
  const description = pageData.metadata.description;

  return createPublicMetadata({
    locale: currentLocale,
    pathname: "/contact",
    title,
    description,
    image: buildOgImageUrl(title, currentLocale),
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const [pageData, siteSettings] = await Promise.all([
    getManagedPublicPageData("contact", currentLocale),
    getPublicSiteSettings(),
  ]);

  const contactItems = pageData.contactInfo.items.map((item, index) => {
    if (index === 0 && siteSettings.contactAddress) {
      return {
        ...item,
        value: siteSettings.contactAddress,
      };
    }

    if (index === 1 && siteSettings.contactPhone) {
      const phoneHref = `tel:${siteSettings.contactPhone.replace(/\s+/g, "")}`;
      return {
        ...item,
        value: siteSettings.contactPhone,
        href: phoneHref,
      };
    }

    if (index === 2 && siteSettings.contactEmail) {
      return {
        ...item,
        value: siteSettings.contactEmail,
        href: `mailto:${siteSettings.contactEmail}`,
      };
    }

    return item;
  });

  const contactInfo = {
    ...pageData.contactInfo,
    items: contactItems,
  };

  return (
    <>
      <section id="contact-overview" className="scroll-mt-32">
        <HeroSectionV2 data={pageData.hero} />
      </section>
      <section id="contact-info" className="scroll-mt-32">
        <ContactInfoSectionV2 data={contactInfo} />
      </section>
      <section id="contact-form" className="scroll-mt-32">
        <ContactFormSectionV2 data={pageData.contactForm} locale={currentLocale} />
      </section>
      {/* <section id="contact-identity" className="scroll-mt-32">
        <ContentSectionV2 data={pageData.companyIdentity} />
      </section> */}
    </>
  );
}
