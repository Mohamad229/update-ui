/**
 * Content Loader Functions
 *
 * Server-side functions to load page content from the database.
 * These are used by frontend components to fetch structured content.
 *
 * Pattern: Server Components → Call loader → Get typed data → Render
 */

import db from "@/lib/db";
import { parseFieldValue } from "@/lib/content/validators";
import type {
  PageData,
  SectionData,
  GetPageContentResponse,
  HomePageContent,
  AboutPageContent,
  ServicesPageContent,
} from "@/lib/content/types";
import type { Locale } from "@/i18n/config";

interface PageContentFieldRecord {
  fieldKey: string;
  fieldType: string;
  value: string | null;
}

interface PageSectionWithFields {
  sectionKey: string;
  fields: PageContentFieldRecord[];
}

/**
 * Extract a single section's data from PageContent
 */
function extractSectionData(
  sections: PageSectionWithFields[] | undefined,
  sectionKey: string,
): SectionData | null {
  if (!sections) return null;

  const section = sections.find((s) => s.sectionKey === sectionKey);
  if (!section || !section.fields) return null;

  const data: SectionData = {};
  for (const field of section.fields) {
    data[field.fieldKey] = parseFieldValue(field.value, field.fieldType);
  }

  return data;
}

/**
 * Load page content from database
 * Generic function to load any page
 */
export async function getPageContent(
  pageKey: string,
  locale: Locale,
): Promise<GetPageContentResponse | null> {
  try {
    const content = await db.pageContent.findUnique({
      where: {
        pageKey_locale: { pageKey, locale },
      },
      include: {
        sections: {
          include: { fields: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!content) {
      return null;
    }

    const sections: Record<string, SectionData> = {};
    for (const section of content.sections) {
      const data = extractSectionData([section], section.sectionKey);
      if (data) {
        sections[section.sectionKey] = data;
      }
    }

    return {
      pageKey: content.pageKey,
      locale: content.locale,
      title: content.title,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
      sections,
    };
  } catch (error) {
    console.error(`Error loading page content: ${pageKey}/${locale}`, error);
    return null;
  }
}

/**
 * Load home page content
 * Typed version returns HomePageContent
 */
export async function getHomePageContent(
  locale: Locale = "en" as Locale,
): Promise<HomePageContent | null> {
  const content = await getPageContent("home", locale);
  if (!content) return null;

  return {
    title: content.title,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    hero: content.sections.hero,
    trustMetrics: content.sections.trustMetrics,
    capabilities: content.sections.capabilities,
    featuredProducts: content.sections.featuredProducts,
    cta: content.sections.cta,
  };
}

/**
 * Load about page content
 */
export async function getAboutPageContent(
  locale: Locale = "en" as Locale,
): Promise<AboutPageContent | null> {
  const content = await getPageContent("about", locale);
  if (!content) return null;

  return {
    title: content.title,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    hero: content.sections.hero,
    story: content.sections.story,
    missionVision: content.sections.missionVision,
    values: content.sections.values,
  };
}

/**
 * Load services page content
 */
export async function getServicesPageContent(
  locale: Locale = "en" as Locale,
): Promise<ServicesPageContent | null> {
  const content = await getPageContent("services", locale);
  if (!content) return null;

  return {
    title: content.title,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    hero: content.sections.hero,
    serviceBlocks: content.sections.serviceBlocks,
    infrastructure: content.sections.infrastructure,
  };
}

/**
 * Load products page content
 */
export async function getProductsPageContent(
  locale: Locale = "en" as Locale,
): Promise<PageData | null> {
  const content = await getPageContent("products", locale);
  if (!content) return null;

  return {
    title: content.title,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    hero: content.sections.hero,
    introduction: content.sections.introduction,
  };
}

/**
 * Load contact page content
 */
export async function getContactPageContent(
  locale: Locale = "en" as Locale,
): Promise<PageData | null> {
  const content = await getPageContent("contact", locale);
  if (!content) return null;

  return {
    title: content.title,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    hero: content.sections.hero,
    contactInfo: content.sections.contactInfo,
  };
}

/**
 * Load all pages for a locale
 * Used in admin dashboard
 */
export async function getAllPageContents(
  locale: Locale,
): Promise<GetPageContentResponse[]> {
  try {
    const contents = await db.pageContent.findMany({
      where: { locale },
      include: {
        sections: {
          include: { fields: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return contents.map((content) => {
      const sections: Record<string, SectionData> = {};
      for (const section of content.sections) {
        const data = extractSectionData([section], section.sectionKey);
        if (data) {
          sections[section.sectionKey] = data;
        }
      }

      return {
        pageKey: content.pageKey,
        locale: content.locale,
        title: content.title,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        sections,
      };
    });
  } catch (error) {
    console.error("Error loading all page contents", error);
    return [];
  }
}

/**
 * Get sections for a page
 * Useful in admin for rendering section editors
 */
export async function getPageSections(
  pageKey: string,
  locale: Locale,
): Promise<PageSectionWithFields[]> {
  try {
    const content = await db.pageContent.findUnique({
      where: { pageKey_locale: { pageKey, locale } },
      include: {
        sections: {
          include: { fields: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return content?.sections || [];
  } catch (error) {
    console.error(`Error loading page sections: ${pageKey}/${locale}`, error);
    return [];
  }
}

/**
 * Get a specific section's data
 */
export async function getPageSection(
  pageKey: string,
  sectionKey: string,
  locale: Locale,
): Promise<SectionData | null> {
  try {
    const content = await db.pageContent.findUnique({
      where: { pageKey_locale: { pageKey, locale } },
      include: {
        sections: {
          where: { sectionKey },
          include: { fields: true },
        },
      },
    });

    if (!content || content.sections.length === 0) {
      return null;
    }

    return extractSectionData(content.sections, sectionKey);
  } catch (error) {
    console.error(
      `Error loading section: ${pageKey}/${sectionKey}/${locale}`,
      error,
    );
    return null;
  }
}
