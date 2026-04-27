/**
 * Content Validation Schemas
 *
 * Zod validators for page content updates and creation.
 * Ensures data integrity for structured content system.
 */

import { z } from "zod";
import type { FieldValue } from "@/lib/content/types";

/**
 * Schema for updating a single field
 */
export const updatePageContentFieldSchema = z.object({
  sectionKey: z.string().min(1),
  fieldKey: z.string().min(1),
  value: z.string().nullable(),
});

export type UpdatePageContentField = z.infer<
  typeof updatePageContentFieldSchema
>;

/**
 * Schema for updating multiple fields in a section
 */
export const updatePageContentSectionSchema = z.object({
  sectionKey: z.string().min(1),
  fields: z.record(z.string(), z.string().nullable()),
});

export type UpdatePageContentSection = z.infer<
  typeof updatePageContentSectionSchema
>;

/**
 * Schema for updating entire page content
 */
export const updatePageContentSchema = z.object({
  pageKey: z.string().min(1),
  locale: z.enum(["en", "ar"]),
  title: z.string().min(1, "Title is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sections: z.record(z.string(), z.record(z.string(), z.string().nullable())),
});

export type UpdatePageContent = z.infer<typeof updatePageContentSchema>;

/**
 * Schema for hero section data
 */
export const heroSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  imageId: z.string().optional(),
});

export type HeroSectionData = z.infer<typeof heroSectionSchema>;

/**
 * Schema for metrics section (JSON array)
 */
export const metricsItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
});

export const metricsSectionSchema = z.object({
  title: z.string().optional(),
  items: z.array(metricsItemSchema).optional(),
});

export type MetricsSectionData = z.infer<typeof metricsSectionSchema>;

/**
 * Schema for capabilities section (JSON array)
 */
export const capabilityCardSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

export const capabilitiesSectionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  cards: z.array(capabilityCardSchema).optional(),
});

export type CapabilitiesSectionData = z.infer<typeof capabilitiesSectionSchema>;

/**
 * Schema for featured products section
 */
export const featuredProductsSectionSchema = z.object({
  title: z.string().optional(),
  productIds: z.array(z.string()).optional(),
});

export type FeaturedProductsSectionData = z.infer<
  typeof featuredProductsSectionSchema
>;

/**
 * Schema for CTA section
 */
export const ctaSectionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
});

export type CTASectionData = z.infer<typeof ctaSectionSchema>;

/**
 * Helper: Parse JSON field value
 */
export function parseFieldValue(
  value: string | null,
  fieldType: string,
): FieldValue {
  if (!value) return null;

  try {
    if (fieldType === "json") {
      const parsed = JSON.parse(value);

      // Backward compatibility: old records may contain stringified JSON inside JSON.
      if (typeof parsed === "string") {
        try {
          return JSON.parse(parsed);
        } catch {
          return parsed;
        }
      }

      return parsed;
    }
    if (fieldType === "number") {
      return parseFloat(value);
    }
    if (fieldType === "boolean") {
      return value === "true" || value === "1";
    }
    return value;
  } catch (error) {
    console.error("Error parsing field value:", error);
    return null;
  }
}

/**
 * Helper: Serialize field value to string for storage
 */
export function serializeFieldValue(
  value: unknown,
  fieldType: string,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (fieldType === "json") {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return null;
      }

      // If UI sends JSON text, validate and normalize it before storage.
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed);
    }

    return JSON.stringify(value);
  }
  if (fieldType === "boolean") {
    return value ? "true" : "false";
  }
  if (fieldType === "number") {
    return String(value);
  }
  return String(value);
}

/**
 * Helper: Validate JSON array format
 */
export const validateJsonArray = (
  value: string,
): { valid: boolean; error?: string } => {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return { valid: false, error: "Value must be a JSON array" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid JSON format" };
  }
};

/**
 * Helper: Validate JSON object format
 */
export const validateJsonObject = (
  value: string,
): { valid: boolean; error?: string } => {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      return { valid: false, error: "Value must be a JSON object" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid JSON format" };
  }
};
