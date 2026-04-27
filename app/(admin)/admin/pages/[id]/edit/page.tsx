import { notFound } from "next/navigation";

import { PageEditorClient } from "./page-editor-client";
import { StructuredPageEditorClient } from "./structured-page-editor-client";
import { getPageContent } from "@/lib/content/loaders";
import { getManagedPublicPageData } from "@/lib/content/public-ui";
import type { PublicUiData } from "@/lib/content/public-ui";
import { getPageDefinition } from "@/lib/content/page-definitions";
import type { Locale } from "@/i18n/config";

/**
 * Edit Page
 *
 * Server component that fetches page data and passes it to the editor.
 * Uses async params per Next.js 16+ requirements.
 */
export const metadata = {
  title: "Edit Page | Damira Admin",
  description: "Edit website page content and sections",
};

interface EditPagePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string | string[] }>;
}

function sanitizeTemplateValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeTemplateValue(item))
      .filter((item) => item !== undefined);
  }

  if (typeof value === "object" && value !== null) {
    const candidate = value as Record<string, unknown> & {
      render?: unknown;
      $$typeof?: unknown;
    };

    // React component references (for example Lucide icons) are not serializable.
    if (
      typeof candidate.render === "function" ||
      candidate.$$typeof !== undefined
    ) {
      return undefined;
    }

    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(candidate)) {
      const sanitizedChild = sanitizeTemplateValue(child);
      if (sanitizedChild !== undefined) {
        output[key] = sanitizedChild;
      }
    }

    return output;
  }

  return undefined;
}

export default async function EditPagePage({
  params,
  searchParams,
}: EditPagePageProps) {
  const { id } = await params;
  const query = await searchParams;

  const localeParam = Array.isArray(query.locale)
    ? query.locale[0]
    : query.locale;
  const locale: Locale = localeParam === "ar" ? "ar" : "en";

  const pageDef = getPageDefinition(id);

  if (pageDef) {
    const [content, managedPageData] = await Promise.all([
      getPageContent(id, locale),
      getManagedPublicPageData(id as keyof PublicUiData, locale).catch(
        () => null,
      ),
    ]);

    const sectionTemplates: Record<string, unknown> = {};

    if (managedPageData) {
      const pageDataRecord = managedPageData as unknown as Record<
        string,
        unknown
      >;

      for (const section of pageDef.sections) {
        sectionTemplates[section.sectionKey] =
          sanitizeTemplateValue(pageDataRecord[section.sectionKey]) ?? {};
      }
    }

    return (
      <StructuredPageEditorClient
        pageKey={id}
        locale={locale}
        pageDefinition={pageDef}
        initialContent={content}
        sectionTemplates={sectionTemplates}
      />
    );
  }

  // Dynamically import to avoid Prisma initialization at build time
  const { getPageById } = await import("@/lib/actions/pages");
  const result = await getPageById(id);

  if (result.error || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageEditorClient page={result.data} />
    </div>
  );
}
