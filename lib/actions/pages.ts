"use server";

import { revalidatePath } from "next/cache";
import { Prisma, SectionType } from "@prisma/client";

import db from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  PageCreateSchema,
  PageUpdateSchema,
  SectionCreateSchema,
  SectionUpdateSchema,
  SectionReorderSchema,
  generateSlug,
  SECTION_TYPE_OPTIONS,
  type PageCreateInput,
  type PageUpdateInput,
  type SectionCreateInput,
  type SectionUpdateInput,
  type SectionReorderInput,
  type SectionTypeOption,
} from "@/lib/schemas/page-form";

// ============================================================================
// Constants
// ============================================================================

const ADMIN_PAGES_PATH = "/admin/pages";
const REVALIDATE_PAGES_PATHS = [ADMIN_PAGES_PATH, "/"];

// ============================================================================
// Type Definitions
// ============================================================================

export type ActionState<T = unknown> = {
  error?: string;
  success?: boolean;
  data?: T;
};

/**
 * Page with translations and section count
 */
export type PageListItem = {
  id: string;
  slug: string;
  isPublished: boolean;
  translationCount: number;
  sectionCount: number;
  createdAt: Date;
  updatedAt: Date;
  translations: {
    locale: string;
    title: string;
  }[];
};

/**
 * Full page with sections and all translations
 */
export type PageDetail = {
  id: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: {
    locale: string;
    title: string;
    metaTitle: string | null;
    metaDescription: string | null;
  }[];
  sections: Array<{
    id: string;
    type: SectionType;
    order: number;
    data: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    translations: {
      locale: string;
      content: Prisma.JsonValue;
    }[];
  }>;
};

/**
 * Section detail with translations
 */
export type SectionDetail = {
  id: string;
  type: SectionType;
  order: number;
  data: Prisma.JsonValue;
  pageId: string;
  createdAt: Date;
  updatedAt: Date;
  translations: {
    locale: string;
    content: Prisma.JsonValue;
  }[];
};

// ============================================================================
// Page CRUD Operations
// ============================================================================

/**
 * Get paginated list of all pages with translations
 */
export async function getPages(
  page: number = 1,
  pageSize: number = 20,
): Promise<
  ActionState<{
    pages: PageListItem[];
    total: number;
    pageCount: number;
  }>
> {
  try {
    await requireAuth();

    const skip = (page - 1) * pageSize;

    const [pages, total] = await Promise.all([
      db.page.findMany({
        skip,
        take: pageSize,
        include: {
          translations: {
            select: {
              locale: true,
              title: true,
            },
          },
          sections: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.page.count(),
    ]);

    const pageList: PageListItem[] = pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      isPublished: p.isPublished,
      translationCount: p.translations.length,
      sectionCount: p.sections.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      translations: p.translations,
    }));

    return {
      success: true,
      data: {
        pages: pageList,
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return { error: "Failed to fetch pages" };
  }
}

/**
 * Get single page with all sections and translations
 */
export async function getPageById(
  id: string,
): Promise<ActionState<PageDetail>> {
  try {
    await requireAuth();

    const page = await db.page.findUnique({
      where: { id },
      include: {
        translations: {
          select: {
            locale: true,
            title: true,
            metaTitle: true,
            metaDescription: true,
          },
        },
        sections: {
          include: {
            translations: {
              select: {
                locale: true,
                content: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!page) {
      return { error: "Page not found" };
    }

    return { success: true, data: page as PageDetail };
  } catch (error) {
    console.error("Failed to fetch page:", error);
    return { error: "Failed to fetch page" };
  }
}

/**
 * Create new page with English translation
 */
export async function createPage(
  input: PageCreateInput,
): Promise<ActionState<PageDetail>> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = PageCreateSchema.parse(input);

    // Auto-generate slug if not provided
    const slug = validatedInput.slug || generateSlug(validatedInput.title);

    // Check if slug already exists
    const existingPage = await db.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return { error: "A page with this slug already exists" };
    }

    // Create page with transaction
    const page = await db.$transaction(async (tx) => {
      const newPage = await tx.page.create({
        data: {
          slug,
          isPublished: validatedInput.isPublished ?? false,
        },
      });

      // Create English translation
      await tx.pageTranslation.create({
        data: {
          pageId: newPage.id,
          locale: "en",
          title: validatedInput.translations?.en?.title || validatedInput.title,
          metaTitle:
            validatedInput.translations?.en?.metaTitle ||
            validatedInput.metaTitle,
          metaDescription:
            validatedInput.translations?.en?.metaDescription ||
            validatedInput.metaDescription,
        },
      });

      // Create Arabic translation if provided
      if (validatedInput.translations?.ar?.title) {
        await tx.pageTranslation.create({
          data: {
            pageId: newPage.id,
            locale: "ar",
            title: validatedInput.translations.ar.title,
            metaTitle: validatedInput.translations.ar.metaTitle || null,
            metaDescription:
              validatedInput.translations.ar.metaDescription || null,
          },
        });
      }

      // Return full page with translations
      return tx.page.findUniqueOrThrow({
        where: { id: newPage.id },
        include: {
          translations: {
            select: {
              locale: true,
              title: true,
              metaTitle: true,
              metaDescription: true,
            },
          },
          sections: {
            include: {
              translations: {
                select: {
                  locale: true,
                  content: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    revalidatePath(ADMIN_PAGES_PATH);

    return { success: true, data: page as PageDetail };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "A page with this slug already exists" };
      }
    }
    console.error("Failed to create page:", error);
    return { error: "Failed to create page" };
  }
}

/**
 * Update page metadata (title, slug, published status)
 */
export async function updatePage(
  input: PageUpdateInput,
): Promise<ActionState<PageDetail>> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = PageUpdateSchema.parse(input);

    // Check if page exists
    const page = await db.page.findUnique({
      where: { id: validatedInput.id },
    });

    if (!page) {
      return { error: "Page not found" };
    }

    // If slug is being changed, check for duplicates
    if (validatedInput.slug && validatedInput.slug !== page.slug) {
      const existingPage = await db.page.findUnique({
        where: { slug: validatedInput.slug },
      });

      if (existingPage) {
        return { error: "A page with this slug already exists" };
      }
    }

    // Update page with transaction
    const updatedPage = await db.$transaction(async (tx) => {
      // Update page metadata
      await tx.page.update({
        where: { id: validatedInput.id },
        data: {
          slug: validatedInput.slug,
          isPublished: validatedInput.isPublished,
        },
      });

      // Update English translation
      const enTranslation = await tx.pageTranslation.findFirst({
        where: {
          pageId: validatedInput.id,
          locale: "en",
        },
      });

      if (enTranslation) {
        await tx.pageTranslation.update({
          where: { id: enTranslation.id },
          data: {
            title:
              validatedInput.translations?.en?.title ||
              validatedInput.title ||
              enTranslation.title,
            metaTitle:
              validatedInput.translations?.en?.metaTitle !== undefined
                ? validatedInput.translations.en.metaTitle
                : validatedInput.metaTitle !== undefined
                  ? validatedInput.metaTitle
                  : enTranslation.metaTitle,
            metaDescription:
              validatedInput.translations?.en?.metaDescription !== undefined
                ? validatedInput.translations.en.metaDescription
                : validatedInput.metaDescription !== undefined
                  ? validatedInput.metaDescription
                  : enTranslation.metaDescription,
          },
        });
      }

      // Update or create Arabic translation
      if (validatedInput.translations?.ar?.title) {
        const arTranslation = await tx.pageTranslation.findFirst({
          where: {
            pageId: validatedInput.id,
            locale: "ar",
          },
        });

        if (arTranslation) {
          await tx.pageTranslation.update({
            where: { id: arTranslation.id },
            data: {
              title: validatedInput.translations.ar.title,
              metaTitle: validatedInput.translations.ar.metaTitle || null,
              metaDescription:
                validatedInput.translations.ar.metaDescription || null,
            },
          });
        } else {
          await tx.pageTranslation.create({
            data: {
              pageId: validatedInput.id,
              locale: "ar",
              title: validatedInput.translations.ar.title,
              metaTitle: validatedInput.translations.ar.metaTitle || null,
              metaDescription:
                validatedInput.translations.ar.metaDescription || null,
            },
          });
        }
      }

      // Return full page
      return tx.page.findUniqueOrThrow({
        where: { id: validatedInput.id },
        include: {
          translations: {
            select: {
              locale: true,
              title: true,
              metaTitle: true,
              metaDescription: true,
            },
          },
          sections: {
            include: {
              translations: {
                select: {
                  locale: true,
                  content: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    revalidatePath(ADMIN_PAGES_PATH);
    revalidatePath("/");

    return { success: true, data: updatedPage as PageDetail };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "A page with this slug already exists" };
      }
    }
    console.error("Failed to update page:", error);
    return { error: "Failed to update page" };
  }
}

/**
 * Soft delete page and all its sections
 */
export async function deletePage(id: string): Promise<ActionState> {
  try {
    await requireAuth();

    // Check if page exists
    const page = await db.page.findUnique({
      where: { id },
    });

    if (!page) {
      return { error: "Page not found" };
    }

    // Delete page and cascade delete sections and translations
    await db.page.delete({
      where: { id },
    });

    revalidatePath(ADMIN_PAGES_PATH);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete page:", error);
    return { error: "Failed to delete page" };
  }
}

/**
 * Reorder sections within a page
 */
export async function reorderSections(
  input: SectionReorderInput,
): Promise<ActionState> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = SectionReorderSchema.parse(input);

    // Verify page exists
    const page = await db.page.findUnique({
      where: { id: validatedInput.pageId },
    });

    if (!page) {
      return { error: "Page not found" };
    }

    // Update all section orders in transaction
    await db.$transaction(
      validatedInput.sections.map((section) =>
        db.pageSection.update({
          where: { id: section.id },
          data: { order: section.order },
        }),
      ),
    );

    revalidatePath(ADMIN_PAGES_PATH);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder sections:", error);
    return { error: "Failed to reorder sections" };
  }
}

// ============================================================================
// Section CRUD Operations
// ============================================================================

/**
 * Get single section with translations
 */
export async function getSectionById(
  id: string,
): Promise<ActionState<SectionDetail>> {
  try {
    await requireAuth();

    const section = await db.pageSection.findUnique({
      where: { id },
      include: {
        translations: {
          select: {
            locale: true,
            content: true,
          },
        },
      },
    });

    if (!section) {
      return { error: "Section not found" };
    }

    return { success: true, data: section as SectionDetail };
  } catch (error) {
    console.error("Failed to fetch section:", error);
    return { error: "Failed to fetch section" };
  }
}

/**
 * Create section with initial content
 */
export async function createSection(
  pageId: string,
  input: SectionCreateInput,
): Promise<ActionState<SectionDetail>> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = SectionCreateSchema.parse({
      ...input,
      pageId,
    });

    // Verify page exists
    const page = await db.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return { error: "Page not found" };
    }

    // Get next order number
    const lastSection = await db.pageSection.findFirst({
      where: { pageId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastSection?.order ?? -1) + 1;

    // Create section with transaction
    const section = await db.$transaction(async (tx) => {
      const newSection = await tx.pageSection.create({
        data: {
          pageId,
          type: validatedInput.type,
          order: validatedInput.order ?? nextOrder,
          data: (validatedInput.data ?? {}) as Prisma.InputJsonValue,
        },
      });

      // Create English translation
      await tx.pageSectionTranslation.create({
        data: {
          sectionId: newSection.id,
          locale: "en",
          content: (validatedInput.content ?? {
            title: validatedInput.title ?? "",
          }) as Prisma.InputJsonValue,
        },
      });

      // Return full section
      return tx.pageSection.findUniqueOrThrow({
        where: { id: newSection.id },
        include: {
          translations: {
            select: {
              locale: true,
              content: true,
            },
          },
        },
      });
    });

    revalidatePath(ADMIN_PAGES_PATH);
    revalidatePath("/");

    return { success: true, data: section as SectionDetail };
  } catch (error) {
    console.error("Failed to create section:", error);
    return { error: "Failed to create section" };
  }
}

/**
 * Update section content and translations
 */
export async function updateSection(
  id: string,
  input: SectionUpdateInput,
): Promise<ActionState<SectionDetail>> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = SectionUpdateSchema.parse(input);

    // Check if section exists
    const section = await db.pageSection.findUnique({
      where: { id },
    });

    if (!section) {
      return { error: "Section not found" };
    }

    // Update section with transaction
    const updatedSection = await db.$transaction(async (tx) => {
      // Update section metadata
      await tx.pageSection.update({
        where: { id },
        data: {
          type: validatedInput.type,
          order: validatedInput.order,
          data: (validatedInput.data ?? {}) as
            | Prisma.InputJsonValue
            | undefined,
        },
      });

      // Update English translation if content provided
      if (validatedInput.title || validatedInput.data) {
        const translation = await tx.pageSectionTranslation.findFirst({
          where: {
            sectionId: id,
            locale: "en",
          },
        });

        if (translation) {
          const currentContent =
            (translation.content as Record<string, unknown> | null) ?? {};
          const newContent: Record<string, unknown> = {
            ...currentContent,
            title:
              validatedInput.title ??
              (currentContent as Record<string, unknown>)?.title,
          };
          await tx.pageSectionTranslation.update({
            where: { id: translation.id },
            data: {
              content: newContent as Prisma.InputJsonValue,
            },
          });
        }
      }

      // Return full section
      return tx.pageSection.findUniqueOrThrow({
        where: { id },
        include: {
          translations: {
            select: {
              locale: true,
              content: true,
            },
          },
        },
      });
    });

    revalidatePath(ADMIN_PAGES_PATH);
    revalidatePath("/");

    return { success: true, data: updatedSection as SectionDetail };
  } catch (error) {
    console.error("Failed to update section:", error);
    return { error: "Failed to update section" };
  }
}

/**
 * Delete section from page
 */
export async function deleteSection(id: string): Promise<ActionState> {
  try {
    await requireAuth();

    // Check if section exists
    const section = await db.pageSection.findUnique({
      where: { id },
    });

    if (!section) {
      return { error: "Section not found" };
    }

    // Delete section and cascade delete translations
    await db.pageSection.delete({
      where: { id },
    });

    revalidatePath(ADMIN_PAGES_PATH);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete section:", error);
    return { error: "Failed to delete section" };
  }
}

/**
 * Duplicate section and append to same page
 */
export async function duplicateSection(
  id: string,
): Promise<ActionState<SectionDetail>> {
  try {
    await requireAuth();

    // Fetch section to duplicate
    const section = await db.pageSection.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!section) {
      return { error: "Section not found" };
    }

    // Get next order number
    const lastSection = await db.pageSection.findFirst({
      where: { pageId: section.pageId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastSection?.order ?? -1) + 1;

    // Duplicate section with transaction
    const duplicatedSection = await db.$transaction(async (tx) => {
      const newSection = await tx.pageSection.create({
        data: {
          pageId: section.pageId,
          type: section.type,
          order: nextOrder,
          data: (section.data ?? {}) as Prisma.InputJsonValue,
        },
      });

      // Duplicate translations
      const translationPromises = section.translations.map((translation) =>
        tx.pageSectionTranslation.create({
          data: {
            sectionId: newSection.id,
            locale: translation.locale,
            content: (translation.content ?? {}) as Prisma.InputJsonValue,
          },
        }),
      );

      await Promise.all(translationPromises);

      // Return full section
      return tx.pageSection.findUniqueOrThrow({
        where: { id: newSection.id },
        include: {
          translations: {
            select: {
              locale: true,
              content: true,
            },
          },
        },
      });
    });

    revalidatePath(ADMIN_PAGES_PATH);
    revalidatePath("/");

    return { success: true, data: duplicatedSection as SectionDetail };
  } catch (error) {
    console.error("Failed to duplicate section:", error);
    return { error: "Failed to duplicate section" };
  }
}

// ============================================================================
// Lookup Functions
// ============================================================================

/**
 * Get available section types
 */
export async function getSectionTypes(): Promise<
  ActionState<typeof SECTION_TYPE_OPTIONS>
> {
  try {
    return { success: true, data: SECTION_TYPE_OPTIONS };
  } catch (error) {
    console.error("Failed to fetch section types:", error);
    return { error: "Failed to fetch section types" };
  }
}
