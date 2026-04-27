import { z } from "zod";

/**
 * Product Form Validation Schemas
 * Comprehensive validation for product creation and editing
 */

// ============================================================================
// Advanced Details Schema
// ============================================================================

const AdvancedDetailsSchema = z
  .object({
    storageConditions: z.string().optional().nullable(),
    regulatoryInfo: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

// ============================================================================
// Main Product Form Schema
// ============================================================================

export const ProductFormSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be 200 characters or less"),
  shortDescription: z
    .string()
    .max(150, "Short description cannot exceed 150 characters")
    .optional()
    .or(z.literal("")),
  fullDescription: z
    .string()
    .max(5000, "Full description cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),

  // Classification
  type: z.enum(["SIMPLE", "ADVANCED"]),
  status: z.enum(["AVAILABLE", "PIPELINE"]),
  categoryId: z.string().min(1, "Category is required").optional(),
  therapeuticAreaId: z.string().optional().nullable(),
  manufacturerId: z.string().min(1, "Manufacturer is required").optional(),

  // Media
  coverImageId: z.string().optional().nullable(),
  attachmentIds: z.array(z.string()).optional().default([]),

  // Advanced Details (only required if type === ADVANCED)
  advancedDetails: AdvancedDetailsSchema,

  // Multi-language Support
  englishName: z
    .string()
    .max(200, "English name must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  englishDescription: z
    .string()
    .max(5000, "English description cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),
  arabicName: z
    .string()
    .max(200, "Arabic name must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  arabicDescription: z
    .string()
    .max(5000, "Arabic description cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),
});

// ============================================================================
// Create Product Schema
// ============================================================================

export const CreateProductFormSchema = ProductFormSchema.extend({
  categoryId: z.string().min(1, "Category is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be 200 characters or less"),
  type: z.enum(["SIMPLE", "ADVANCED"]),
  status: z.enum(["AVAILABLE", "PIPELINE"]),
});

// ============================================================================
// Update Product Schema
// ============================================================================

export const UpdateProductFormSchema = ProductFormSchema.extend({
  id: z.string().min(1, "Product ID is required"),
})
  .partial()
  .required({ id: true });

// ============================================================================
// Type Inferences
// ============================================================================

export type ProductFormInput = z.infer<typeof ProductFormSchema>;
export type CreateProductFormInput = z.infer<typeof CreateProductFormSchema>;
export type UpdateProductFormInput = z.infer<typeof UpdateProductFormSchema>;

/**
 * Infer types for form handling with nullable/optional support
 */
export type ProductFormFieldValues = {
  name: string;
  shortDescription?: string;
  fullDescription?: string;
  type: "SIMPLE" | "ADVANCED";
  status: "AVAILABLE" | "PIPELINE";
  categoryId?: string;
  therapeuticAreaId?: string | null;
  manufacturerId?: string;
  coverImageId?: string | null;
  attachmentIds?: string[];
  advancedDetails?: {
    storageConditions?: string | null;
    regulatoryInfo?: string | null;
  } | null;
  englishName?: string;
  englishDescription?: string;
  arabicName?: string;
  arabicDescription?: string;
};
