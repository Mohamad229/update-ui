import { z } from "zod";

/**
 * Page Form Validation Schemas
 * Comprehensive validation for page and section creation and editing
 */

// ============================================================================
// Utility Schemas
// ============================================================================

/**
 * Auto-generate slug from title if not provided
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
};

// ============================================================================
// Section Type Schema
// ============================================================================

export const SectionTypeSchema = z.enum([
  "HERO",
  "TEXT",
  "CARDS",
  "STATS",
  "FEATURES",
  "CTA",
  "IMAGE_TEXT",
] as const);

// ============================================================================
// Page Translation Schema
// ============================================================================

export const PageTranslationSchema = z.object({
  locale: z.enum(["en", "ar"]),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  metaTitle: z
    .string()
    .max(60, "Meta title must be 60 characters or less")
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional()
    .nullable(),
});

// ============================================================================
// Page Create Schema
// ============================================================================

export const PageCreateSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(1, "Page title is required")
    .max(255, "Page title must be 255 characters or less"),
  slug: z
    .string()
    .min(1, "Page slug is required")
    .max(255, "Page slug must be 255 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),

  // SEO
  metaTitle: z
    .string()
    .max(60, "Meta title must be 60 characters or less")
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional()
    .nullable(),

  // Publishing
  isPublished: z.boolean().optional().default(false),

  // Bilingual translations (optional)
  translations: z
    .object({
      en: z
        .object({
          title: z.string().optional(),
          metaTitle: z.string().optional().nullable(),
          metaDescription: z.string().optional().nullable(),
        })
        .optional(),
      ar: z
        .object({
          title: z.string().optional(),
          metaTitle: z.string().optional().nullable(),
          metaDescription: z.string().optional().nullable(),
        })
        .optional(),
    })
    .optional(),
});

// ============================================================================
// Page Update Schema
// ============================================================================

export const PageUpdateSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  title: z
    .string()
    .min(1, "Page title is required")
    .max(255, "Page title must be 255 characters or less")
    .optional(),
  slug: z
    .string()
    .min(1, "Page slug is required")
    .max(255, "Page slug must be 255 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
  metaTitle: z
    .string()
    .max(60, "Meta title must be 60 characters or less")
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional()
    .nullable(),
  isPublished: z.boolean().optional(),

  // Bilingual translations (optional)
  translations: z
    .object({
      en: z
        .object({
          title: z.string().optional(),
          metaTitle: z.string().optional().nullable(),
          metaDescription: z.string().optional().nullable(),
        })
        .optional(),
      ar: z
        .object({
          title: z.string().optional(),
          metaTitle: z.string().optional().nullable(),
          metaDescription: z.string().optional().nullable(),
        })
        .optional(),
    })
    .optional(),
});

// ============================================================================
// Section Create Schema
// ============================================================================

export const SectionCreateSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  type: SectionTypeSchema,
  order: z.number().int().nonnegative().optional().default(0),
  data: z.record(z.string(), z.any()).optional(),

  // Translation for creation (English by default)
  content: z.record(z.string(), z.any()).optional(),
  title: z.string().optional(),
});

// ============================================================================
// Section Update Schema
// ============================================================================

export const SectionUpdateSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  type: SectionTypeSchema.optional(),
  order: z.number().int().nonnegative().optional(),
  data: z.record(z.string(), z.any()).optional(),
  title: z.string().optional(),
});

// ============================================================================
// Section Reorder Schema
// ============================================================================

export const SectionReorderSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  sections: z.array(
    z.object({
      id: z.string().min(1, "Section ID is required"),
      order: z.number().int().nonnegative(),
    }),
  ),
});

// ============================================================================
// Section Translation Schema
// ============================================================================

export const SectionTranslationSchema = z.object({
  sectionId: z.string().min(1, "Section ID is required"),
  locale: z.enum(["en", "ar"] as const),
  content: z.record(z.string(), z.any()),
});

// ============================================================================
// Type Inferences
// ============================================================================

export type SectionTypeOption = z.infer<typeof SectionTypeSchema>;

export type PageTranslationInput = z.infer<typeof PageTranslationSchema>;

export type PageCreateInput = z.infer<typeof PageCreateSchema>;

export type PageUpdateInput = z.infer<typeof PageUpdateSchema>;

export type SectionCreateInput = z.infer<typeof SectionCreateSchema>;

export type SectionUpdateInput = z.infer<typeof SectionUpdateSchema>;

export type SectionReorderInput = z.infer<typeof SectionReorderSchema>;

export type SectionTranslationInput = z.infer<typeof SectionTranslationSchema>;

/**
 * Available section types as options for UI dropdowns
 */
export const SECTION_TYPE_OPTIONS: Array<{
  value: SectionTypeOption;
  label: string;
}> = [
  { value: "HERO", label: "Hero Banner" },
  { value: "TEXT", label: "Text Content" },
  { value: "CARDS", label: "Cards Grid" },
  { value: "STATS", label: "Statistics" },
  { value: "FEATURES", label: "Features" },
  { value: "CTA", label: "Call to Action" },
  { value: "IMAGE_TEXT", label: "Image + Text" },
];
