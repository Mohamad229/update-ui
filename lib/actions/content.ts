"use server";

/**
 * Server Actions for Structured Page Content
 *
 * Handles all CRUD operations for the new page content system.
 * All operations are validated and require authentication.
 */

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { requireAuth, isAdmin } from "@/lib/auth-utils";
import {
  updatePageContentFieldSchema,
  updatePageContentSchema,
  serializeFieldValue,
} from "@/lib/content/validators";
import {
  getPageDefinition,
  getSectionDefinition,
} from "@/lib/content/page-definitions";
import type { UpdatePageContent } from "@/lib/content/validators";
import type { UpdatePageContentResponse } from "@/lib/content/types";
import type { Locale } from "@/i18n/config";

/**
 * Update a single field value
 */
export async function updatePageContentField(
  pageKey: string,
  locale: Locale,
  sectionKey: string,
  fieldKey: string,
  value: string | null,
): Promise<UpdatePageContentResponse> {
  try {
    await requireAuth();

    if (!(await isAdmin())) {
      return {
        success: false,
        message: "Unauthorized: Admin role required",
      };
    }

    // Validate input
    updatePageContentFieldSchema.parse({
      sectionKey,
      fieldKey,
      value,
    });

    // Get page definition to verify section/field exists
    const pagedef = getPageDefinition(pageKey);
    if (!pagedef) {
      return {
        success: false,
        message: `Page '${pageKey}' not found`,
      };
    }

    const sectionDef = getSectionDefinition(pageKey, sectionKey);
    if (!sectionDef) {
      return {
        success: false,
        message: `Section '${sectionKey}' not found on page '${pageKey}'`,
      };
    }

    if (!sectionDef.fields[fieldKey]) {
      return {
        success: false,
        message: `Field '${fieldKey}' not found in section '${sectionKey}'`,
      };
    }

    // Get or create page content
    const content = await db.pageContent.findUnique({
      where: { pageKey_locale: { pageKey, locale } },
      include: {
        sections: {
          include: { fields: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!content) {
      return {
        success: false,
        message: `Page content for '${pageKey}/${locale}' not initialized`,
      };
    }

    // Get or create section
    let section = content.sections.find((s) => s.sectionKey === sectionKey);
    if (!section) {
      section = await db.pageContentSection.create({
        data: {
          contentId: content.id,
          sectionKey,
          order: content.sections.length + 1,
        },
        include: { fields: true },
      });
    }

    // Get field definition to determine field type
    const fieldDef = sectionDef.fields[fieldKey];
    const fieldType = fieldDef.type;

    // Serialize the value according to field type
    const serializedValue = serializeFieldValue(value, fieldType);

    // Update or create field
    await db.pageContentField.upsert({
      where: {
        sectionId_fieldKey: {
          sectionId: section.id,
          fieldKey,
        },
      },
      create: {
        sectionId: section.id,
        fieldKey,
        fieldType,
        value: serializedValue,
      },
      update: {
        value: serializedValue,
      },
    });

    // Revalidate cache
    revalidatePath(`/[locale]/${pageKey}`, "page");
    revalidatePath("/admin/pages");

    return {
      success: true,
      message: `Field updated successfully`,
    };
  } catch (error) {
    console.error("Error updating page content field:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update entire page content
 */
export async function updatePageContent(
  data: UpdatePageContent,
): Promise<UpdatePageContentResponse> {
  try {
    await requireAuth();

    if (!(await isAdmin())) {
      return {
        success: false,
        message: "Unauthorized: Admin role required",
      };
    }

    // Validate input
    const validated = updatePageContentSchema.parse(data);

    // Get page definition
    const pagedef = getPageDefinition(validated.pageKey);
    if (!pagedef) {
      return {
        success: false,
        message: `Page '${validated.pageKey}' not found`,
      };
    }

    // Get or create page content
    const content = await db.pageContent.upsert({
      where: {
        pageKey_locale: {
          pageKey: validated.pageKey,
          locale: validated.locale,
        },
      },
      create: {
        pageKey: validated.pageKey,
        locale: validated.locale,
        title: validated.title,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
      },
      update: {
        title: validated.title,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
      },
      include: {
        sections: {
          include: { fields: true },
        },
      },
    });

    // Update sections
    for (const [sectionKey, fields] of Object.entries(validated.sections)) {
      const sectionDef = getSectionDefinition(validated.pageKey, sectionKey);
      if (!sectionDef) {
        console.warn(
          `Section '${sectionKey}' not defined for page '${validated.pageKey}'`,
        );
        continue;
      }

      // Get or create section
      let section = content.sections.find((s) => s.sectionKey === sectionKey);
      if (!section) {
        section = await db.pageContentSection.create({
          data: {
            contentId: content.id,
            sectionKey,
            order: content.sections.length + 1,
          },
          include: { fields: true },
        });
      }

      // Update fields
      for (const [fieldKey, value] of Object.entries(fields)) {
        const fieldDef = sectionDef.fields[fieldKey];
        if (!fieldDef) {
          console.warn(
            `Field '${fieldKey}' not defined in section '${sectionKey}'`,
          );
          continue;
        }

        const serializedValue = serializeFieldValue(value, fieldDef.type);

        await db.pageContentField.upsert({
          where: {
            sectionId_fieldKey: {
              sectionId: section.id,
              fieldKey,
            },
          },
          create: {
            sectionId: section.id,
            fieldKey,
            fieldType: fieldDef.type,
            value: serializedValue,
          },
          update: {
            value: serializedValue,
          },
        });
      }
    }

    // Revalidate cache
    revalidatePath(`/[locale]/${validated.pageKey}`, "page");
    revalidatePath("/admin/pages");

    return {
      success: true,
      message: "Page content updated successfully",
    };
  } catch (error) {
    console.error("Error updating page content:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize page content for a locale
 * Creates the PageContent entry with all sections initialized
 */
export async function initializePageContent(
  pageKey: string,
  locale: Locale,
): Promise<UpdatePageContentResponse> {
  try {
    await requireAuth();

    if (!(await isAdmin())) {
      return {
        success: false,
        message: "Unauthorized: Admin role required",
      };
    }

    const pagedef = getPageDefinition(pageKey);
    if (!pagedef) {
      return {
        success: false,
        message: `Page '${pageKey}' not found`,
      };
    }

    // Check if already exists
    const existing = await db.pageContent.findUnique({
      where: { pageKey_locale: { pageKey, locale } },
    });

    if (existing) {
      return {
        success: false,
        message: `Page content for '${pageKey}/${locale}' already initialized`,
      };
    }

    // Create page content
    await db.pageContent.create({
      data: {
        pageKey,
        locale,
        title: pagedef.label,
        sections: {
          create: pagedef.sections.map((section, index) => ({
            sectionKey: section.sectionKey,
            order: index + 1,
            fields: {
              create: Object.entries(section.fields).map(
                ([fieldKey, fieldDef]) => ({
                  fieldKey,
                  fieldType: fieldDef.type,
                  value: null,
                }),
              ),
            },
          })),
        },
      },
      include: {
        sections: {
          include: { fields: true },
        },
      },
    });

    revalidatePath("/admin/pages");

    return {
      success: true,
      message: `Page content initialized for '${pageKey}/${locale}'`,
    };
  } catch (error) {
    console.error("Error initializing page content:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete page content
 */
export async function deletePageContent(
  pageKey: string,
  locale: Locale,
): Promise<UpdatePageContentResponse> {
  try {
    await requireAuth();

    if (!(await isAdmin())) {
      return {
        success: false,
        message: "Unauthorized: Admin role required",
      };
    }

    await db.pageContent.delete({
      where: {
        pageKey_locale: { pageKey, locale },
      },
    });

    revalidatePath("/admin/pages");

    return {
      success: true,
      message: "Page content deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting page content:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
