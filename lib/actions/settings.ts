"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { z } from "zod";

import { requireRole } from "@/lib/auth-utils";
import db from "@/lib/db";

const ADMIN_SETTINGS_PATH = "/admin/settings";
const ADMIN_PRODUCTS_PATH = "/admin/products";

const LOOKUP_CREATE_SCHEMA = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name is too long"),
    nameAr: z
      .string()
      .trim()
      .max(255, "Arabic name is too long")
      .optional()
      .nullable(),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(255, "Slug is too long")
      .optional(),
  })
  .strict();

const LOOKUP_UPDATE_SCHEMA = z
  .object({
    id: z.string().min(1, "ID is required"),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name is too long")
      .optional(),
    nameAr: z
      .string()
      .trim()
      .max(255, "Arabic name is too long")
      .optional()
      .nullable(),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(255, "Slug is too long")
      .optional(),
  })
  .strict()
  .refine(
    (input) =>
      input.name !== undefined ||
      input.nameAr !== undefined ||
      input.slug !== undefined,
    "At least one field must be provided for update",
  );

const MANUFACTURER_CREATE_SCHEMA = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name is too long"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(255, "Slug is too long")
      .optional(),
    country: z
      .string()
      .trim()
      .max(255, "Country is too long")
      .optional()
      .nullable(),
  })
  .strict();

const MANUFACTURER_UPDATE_SCHEMA = z
  .object({
    id: z.string().min(1, "ID is required"),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name is too long")
      .optional(),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(255, "Slug is too long")
      .optional(),
    country: z
      .string()
      .trim()
      .max(255, "Country is too long")
      .optional()
      .nullable(),
  })
  .strict()
  .refine(
    (input) =>
      input.name !== undefined ||
      input.slug !== undefined ||
      input.country !== undefined,
    "At least one field must be provided for update",
  );

const DELETE_LOOKUP_SCHEMA = z
  .object({
    id: z.string().min(1, "ID is required"),
  })
  .strict();

const SITE_SETTING_KEYS = [
  "siteName",
  "siteTagline",
  "contactEmail",
  "contactPhone",
  "contactAddress",
  "seoDefaultTitle",
  "seoDefaultDescription",
] as const;

const SITE_SETTING_KEY_SCHEMA = z.enum(SITE_SETTING_KEYS);

const SITE_SETTING_CREATE_SCHEMA = z
  .object({
    key: SITE_SETTING_KEY_SCHEMA,
    value: z
      .string()
      .trim()
      .min(1, "Setting value is required")
      .max(5000, "Setting value is too long"),
  })
  .strict();

const SITE_SETTING_UPDATE_SCHEMA = z
  .object({
    key: SITE_SETTING_KEY_SCHEMA,
    value: z
      .string()
      .trim()
      .min(1, "Setting value is required")
      .max(5000, "Setting value is too long"),
  })
  .strict();

const SITE_SETTING_DELETE_SCHEMA = z
  .object({
    key: SITE_SETTING_KEY_SCHEMA,
  })
  .strict();

const SITE_SETTINGS_SCHEMA = z
  .object({
    siteName: z
      .string()
      .trim()
      .max(255, "Site name is too long")
      .optional()
      .nullable(),
    siteTagline: z
      .string()
      .trim()
      .max(255, "Site tagline is too long")
      .optional()
      .nullable(),
    contactEmail: z
      .union([
        z.string().trim().email("Invalid contact email"),
        z.literal(""),
        z.null(),
      ])
      .optional(),
    contactPhone: z
      .string()
      .trim()
      .max(50, "Contact phone is too long")
      .optional()
      .nullable(),
    contactAddress: z
      .string()
      .trim()
      .max(500, "Contact address is too long")
      .optional()
      .nullable(),
    seoDefaultTitle: z
      .string()
      .trim()
      .max(255, "SEO title is too long")
      .optional()
      .nullable(),
    seoDefaultDescription: z
      .string()
      .trim()
      .max(500, "SEO description is too long")
      .optional()
      .nullable(),
  })
  .strict();

const SITE_SETTINGS_UPDATE_SCHEMA = SITE_SETTINGS_SCHEMA.refine(
  (input) => Object.values(input).some((value) => value !== undefined),
  "At least one setting must be provided",
);

export type ActionState<T = unknown> = {
  error?: string;
  success?: boolean;
  data?: T;
};

export type CategoryLookupItem = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  productCount: number;
};

export type TherapeuticAreaLookupItem = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  productCount: number;
};

export type ManufacturerLookupItem = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  productCount: number;
};

export type SiteSettings = {
  siteName: string | null;
  siteTagline: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  seoDefaultTitle: string | null;
  seoDefaultDescription: string | null;
};

export type SiteSettingKey = z.infer<typeof SITE_SETTING_KEY_SCHEMA>;

export type SiteSettingItem = {
  key: SiteSettingKey;
  value: string;
};

export type CreateLookupInput = z.infer<typeof LOOKUP_CREATE_SCHEMA>;
export type UpdateLookupInput = z.infer<typeof LOOKUP_UPDATE_SCHEMA>;
export type CreateManufacturerInput = z.infer<
  typeof MANUFACTURER_CREATE_SCHEMA
>;
export type UpdateManufacturerInput = z.infer<
  typeof MANUFACTURER_UPDATE_SCHEMA
>;
export type UpdateSiteSettingsInput = z.infer<
  typeof SITE_SETTINGS_UPDATE_SCHEMA
>;
export type CreateSiteSettingInput = z.infer<typeof SITE_SETTING_CREATE_SCHEMA>;
export type UpdateSiteSettingInput = z.infer<typeof SITE_SETTING_UPDATE_SCHEMA>;

function shouldRethrowNextError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("NEXT_REDIRECT");
}

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureUniqueCategorySlug(
  baseSlug: string,
  categoryId?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (categoryId && existing.id === categoryId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function ensureUniqueTherapeuticAreaSlug(
  baseSlug: string,
  therapeuticAreaId?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.therapeuticArea.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (therapeuticAreaId && existing.id === therapeuticAreaId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function ensureUniqueManufacturerSlug(
  baseSlug: string,
  manufacturerId?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.manufacturer.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (manufacturerId && existing.id === manufacturerId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function normalizeNullableString(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function revalidateAdminSettingsPaths(): void {
  revalidatePath(ADMIN_SETTINGS_PATH);
  revalidatePath(ADMIN_PRODUCTS_PATH);
}

export async function listCategories(): Promise<
  ActionState<CategoryLookupItem[]>
> {
  try {
    await requireRole([UserRole.ADMIN]);

    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: categories.map((category) => ({
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        slug: category.slug,
        productCount: category._count.products,
      })),
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error fetching categories:", error);
    return { error: "Failed to fetch categories" };
  }
}

export async function createCategory(
  input: CreateLookupInput,
): Promise<ActionState<{ id: string }>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = LOOKUP_CREATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.name?.[0] ||
        errors.nameAr?.[0] ||
        errors.slug?.[0] ||
        "Invalid category data";
      return { error: errorMessage };
    }

    const rawSlug = validatedInput.data.slug || validatedInput.data.name;
    const baseSlug = generateSlug(rawSlug);

    if (!baseSlug) {
      return { error: "Unable to generate a valid slug" };
    }

    const slug = await ensureUniqueCategorySlug(baseSlug);

    const category = await db.category.create({
      data: {
        name: validatedInput.data.name,
        nameAr: normalizeNullableString(validatedInput.data.nameAr),
        slug,
      },
      select: { id: true },
    });

    revalidateAdminSettingsPaths();

    return { success: true, data: { id: category.id } };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error creating category:", error);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(
  input: UpdateLookupInput,
): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = LOOKUP_UPDATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.id?.[0] ||
        errors.name?.[0] ||
        errors.nameAr?.[0] ||
        errors.slug?.[0] ||
        "Invalid category data";
      return { error: errorMessage };
    }

    const existingCategory = await db.category.findUnique({
      where: { id: validatedInput.data.id },
      select: { id: true },
    });

    if (!existingCategory) {
      return { error: "Category not found" };
    }

    let slug: string | undefined;

    if (validatedInput.data.slug !== undefined) {
      const baseSlug = generateSlug(validatedInput.data.slug);

      if (!baseSlug) {
        return { error: "Unable to generate a valid slug" };
      }

      slug = await ensureUniqueCategorySlug(baseSlug, validatedInput.data.id);
    }

    await db.category.update({
      where: { id: validatedInput.data.id },
      data: {
        ...(validatedInput.data.name !== undefined && {
          name: validatedInput.data.name,
        }),
        ...(validatedInput.data.nameAr !== undefined && {
          nameAr: normalizeNullableString(validatedInput.data.nameAr),
        }),
        ...(slug !== undefined && { slug }),
      },
    });

    revalidateAdminSettingsPaths();

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedId = DELETE_LOOKUP_SCHEMA.safeParse({ id });

    if (!validatedId.success) {
      return {
        error:
          validatedId.error.flatten().fieldErrors.id?.[0] ||
          "Invalid category ID",
      };
    }

    const existingCategory = await db.category.findUnique({
      where: { id: validatedId.data.id },
      select: { id: true },
    });

    if (!existingCategory) {
      return { error: "Category not found" };
    }

    const productCount = await db.product.count({
      where: { categoryId: validatedId.data.id },
    });

    if (productCount > 0) {
      return {
        error: `Cannot delete category. It is used by ${productCount} product(s).`,
      };
    }

    await db.category.delete({
      where: { id: validatedId.data.id },
    });

    revalidateAdminSettingsPaths();

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error deleting category:", error);
    return { error: "Failed to delete category" };
  }
}

export async function listTherapeuticAreas(): Promise<
  ActionState<TherapeuticAreaLookupItem[]>
> {
  try {
    await requireRole([UserRole.ADMIN]);

    const areas = await db.therapeuticArea.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: areas.map((area) => ({
        id: area.id,
        name: area.name,
        nameAr: area.nameAr,
        slug: area.slug,
        productCount: area._count.products,
      })),
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error fetching therapeutic areas:", error);
    return { error: "Failed to fetch therapeutic areas" };
  }
}

export async function createTherapeuticArea(
  input: CreateLookupInput,
): Promise<ActionState<{ id: string }>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = LOOKUP_CREATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.name?.[0] ||
        errors.nameAr?.[0] ||
        errors.slug?.[0] ||
        "Invalid therapeutic area data";
      return { error: errorMessage };
    }

    const rawSlug = validatedInput.data.slug || validatedInput.data.name;
    const baseSlug = generateSlug(rawSlug);

    if (!baseSlug) {
      return { error: "Unable to generate a valid slug" };
    }

    const slug = await ensureUniqueTherapeuticAreaSlug(baseSlug);

    const area = await db.therapeuticArea.create({
      data: {
        name: validatedInput.data.name,
        nameAr: normalizeNullableString(validatedInput.data.nameAr),
        slug,
      },
      select: { id: true },
    });

    revalidateAdminSettingsPaths();

    return { success: true, data: { id: area.id } };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error creating therapeutic area:", error);
    return { error: "Failed to create therapeutic area" };
  }
}

export async function updateTherapeuticArea(
  input: UpdateLookupInput,
): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = LOOKUP_UPDATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.id?.[0] ||
        errors.name?.[0] ||
        errors.nameAr?.[0] ||
        errors.slug?.[0] ||
        "Invalid therapeutic area data";
      return { error: errorMessage };
    }

    const existingArea = await db.therapeuticArea.findUnique({
      where: { id: validatedInput.data.id },
      select: { id: true },
    });

    if (!existingArea) {
      return { error: "Therapeutic area not found" };
    }

    let slug: string | undefined;

    if (validatedInput.data.slug !== undefined) {
      const baseSlug = generateSlug(validatedInput.data.slug);

      if (!baseSlug) {
        return { error: "Unable to generate a valid slug" };
      }

      slug = await ensureUniqueTherapeuticAreaSlug(
        baseSlug,
        validatedInput.data.id,
      );
    }

    await db.therapeuticArea.update({
      where: { id: validatedInput.data.id },
      data: {
        ...(validatedInput.data.name !== undefined && {
          name: validatedInput.data.name,
        }),
        ...(validatedInput.data.nameAr !== undefined && {
          nameAr: normalizeNullableString(validatedInput.data.nameAr),
        }),
        ...(slug !== undefined && { slug }),
      },
    });

    revalidateAdminSettingsPaths();

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error updating therapeutic area:", error);
    return { error: "Failed to update therapeutic area" };
  }
}

export async function deleteTherapeuticArea(id: string): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedId = DELETE_LOOKUP_SCHEMA.safeParse({ id });

    if (!validatedId.success) {
      return {
        error:
          validatedId.error.flatten().fieldErrors.id?.[0] ||
          "Invalid therapeutic area ID",
      };
    }

    const existingArea = await db.therapeuticArea.findUnique({
      where: { id: validatedId.data.id },
      select: { id: true },
    });

    if (!existingArea) {
      return { error: "Therapeutic area not found" };
    }

    const productCount = await db.product.count({
      where: { therapeuticAreaId: validatedId.data.id },
    });

    if (productCount > 0) {
      return {
        error: `Cannot delete therapeutic area. It is used by ${productCount} product(s).`,
      };
    }

    await db.therapeuticArea.delete({
      where: { id: validatedId.data.id },
    });

    revalidateAdminSettingsPaths();

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error deleting therapeutic area:", error);
    return { error: "Failed to delete therapeutic area" };
  }
}

export async function listManufacturers(): Promise<
  ActionState<ManufacturerLookupItem[]>
> {
  try {
    await requireRole([UserRole.ADMIN]);

    const manufacturers = await db.manufacturer.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: manufacturers.map((manufacturer) => ({
        id: manufacturer.id,
        name: manufacturer.name,
        slug: manufacturer.slug,
        country: manufacturer.country,
        productCount: manufacturer._count.products,
      })),
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error fetching manufacturers:", error);
    return { error: "Failed to fetch manufacturers" };
  }
}

export async function createManufacturer(
  input: CreateManufacturerInput,
): Promise<ActionState<{ id: string }>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = MANUFACTURER_CREATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.name?.[0] ||
        errors.slug?.[0] ||
        errors.country?.[0] ||
        "Invalid manufacturer data";
      return { error: errorMessage };
    }

    const rawSlug = validatedInput.data.slug || validatedInput.data.name;
    const baseSlug = generateSlug(rawSlug);

    if (!baseSlug) {
      return { error: "Unable to generate a valid slug" };
    }

    const slug = await ensureUniqueManufacturerSlug(baseSlug);

    const manufacturer = await db.manufacturer.create({
      data: {
        name: validatedInput.data.name,
        slug,
        country: normalizeNullableString(validatedInput.data.country),
      },
      select: { id: true },
    });

    revalidateAdminSettingsPaths();

    return { success: true, data: { id: manufacturer.id } };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error creating manufacturer:", error);
    return { error: "Failed to create manufacturer" };
  }
}

export async function updateManufacturer(
  input: UpdateManufacturerInput,
): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = MANUFACTURER_UPDATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.id?.[0] ||
        errors.name?.[0] ||
        errors.slug?.[0] ||
        errors.country?.[0] ||
        "Invalid manufacturer data";
      return { error: errorMessage };
    }

    const existingManufacturer = await db.manufacturer.findUnique({
      where: { id: validatedInput.data.id },
      select: { id: true },
    });

    if (!existingManufacturer) {
      return { error: "Manufacturer not found" };
    }

    let slug: string | undefined;

    if (validatedInput.data.slug !== undefined) {
      const baseSlug = generateSlug(validatedInput.data.slug);

      if (!baseSlug) {
        return { error: "Unable to generate a valid slug" };
      }

      slug = await ensureUniqueManufacturerSlug(
        baseSlug,
        validatedInput.data.id,
      );
    }

    await db.manufacturer.update({
      where: { id: validatedInput.data.id },
      data: {
        ...(validatedInput.data.name !== undefined && {
          name: validatedInput.data.name,
        }),
        ...(slug !== undefined && { slug }),
        ...(validatedInput.data.country !== undefined && {
          country: normalizeNullableString(validatedInput.data.country),
        }),
      },
    });

    revalidateAdminSettingsPaths();

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error updating manufacturer:", error);
    return { error: "Failed to update manufacturer" };
  }
}

export async function deleteManufacturer(id: string): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedId = DELETE_LOOKUP_SCHEMA.safeParse({ id });

    if (!validatedId.success) {
      return {
        error:
          validatedId.error.flatten().fieldErrors.id?.[0] ||
          "Invalid manufacturer ID",
      };
    }

    const existingManufacturer = await db.manufacturer.findUnique({
      where: { id: validatedId.data.id },
      select: { id: true },
    });

    if (!existingManufacturer) {
      return { error: "Manufacturer not found" };
    }

    const productCount = await db.product.count({
      where: { manufacturerId: validatedId.data.id },
    });

    if (productCount > 0) {
      return {
        error: `Cannot delete manufacturer. It is used by ${productCount} product(s).`,
      };
    }

    await db.manufacturer.delete({
      where: { id: validatedId.data.id },
    });

    revalidateAdminSettingsPaths();

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error deleting manufacturer:", error);
    return { error: "Failed to delete manufacturer" };
  }
}

export async function getSiteSettings(): Promise<ActionState<SiteSettings>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const settings = await db.siteSetting.findMany({
      where: {
        key: {
          in: [...SITE_SETTING_KEYS],
        },
      },
      select: {
        key: true,
        value: true,
      },
    });

    const defaults: SiteSettings = {
      siteName: null,
      siteTagline: null,
      contactEmail: null,
      contactPhone: null,
      contactAddress: null,
      seoDefaultTitle: null,
      seoDefaultDescription: null,
    };

    for (const setting of settings) {
      if (setting.key in defaults) {
        const key = setting.key as keyof SiteSettings;
        defaults[key] = setting.value;
      }
    }

    return { success: true, data: defaults };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error fetching site settings:", error);
    return { error: "Failed to fetch site settings" };
  }
}

export async function listSiteSettings(): Promise<
  ActionState<SiteSettingItem[]>
> {
  try {
    await requireRole([UserRole.ADMIN]);

    const settings = await db.siteSetting.findMany({
      where: {
        key: {
          in: [...SITE_SETTING_KEYS],
        },
      },
      select: {
        key: true,
        value: true,
      },
      orderBy: {
        key: "asc",
      },
    });

    return {
      success: true,
      data: settings.map((setting) => ({
        key: setting.key as SiteSettingKey,
        value: setting.value,
      })),
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error listing site settings:", error);
    return { error: "Failed to list site settings" };
  }
}

export async function getSiteSettingByKey(
  key: string,
): Promise<ActionState<string | null>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedKey = SITE_SETTING_DELETE_SCHEMA.safeParse({ key });

    if (!validatedKey.success) {
      return {
        error:
          validatedKey.error.flatten().fieldErrors.key?.[0] ||
          "Invalid site setting key",
      };
    }

    const setting = await db.siteSetting.findUnique({
      where: { key: validatedKey.data.key },
      select: { value: true },
    });

    return { success: true, data: setting?.value ?? null };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error fetching site setting:", error);
    return { error: "Failed to fetch site setting" };
  }
}

export async function createSiteSetting(
  input: CreateSiteSettingInput,
): Promise<ActionState<SiteSettingItem>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = SITE_SETTING_CREATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.key?.[0] || errors.value?.[0] || "Invalid site setting data";
      return { error: errorMessage };
    }

    const normalizedValue = normalizeNullableString(validatedInput.data.value);

    if (!normalizedValue) {
      return { error: "Setting value is required" };
    }

    const existing = await db.siteSetting.findUnique({
      where: { key: validatedInput.data.key },
      select: { key: true },
    });

    if (existing) {
      return { error: "Site setting already exists" };
    }

    const created = await db.siteSetting.create({
      data: {
        key: validatedInput.data.key,
        value: normalizedValue,
      },
      select: {
        key: true,
        value: true,
      },
    });

    revalidateAdminSettingsPaths();

    return {
      success: true,
      data: {
        key: created.key as SiteSettingKey,
        value: created.value,
      },
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error creating site setting:", error);
    return { error: "Failed to create site setting" };
  }
}

export async function updateSiteSetting(
  input: UpdateSiteSettingInput,
): Promise<ActionState<SiteSettingItem>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = SITE_SETTING_UPDATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.key?.[0] || errors.value?.[0] || "Invalid site setting data";
      return { error: errorMessage };
    }

    const normalizedValue = normalizeNullableString(validatedInput.data.value);

    if (!normalizedValue) {
      return { error: "Setting value is required" };
    }

    const existing = await db.siteSetting.findUnique({
      where: { key: validatedInput.data.key },
      select: { key: true },
    });

    if (!existing) {
      return { error: "Site setting not found" };
    }

    const updated = await db.siteSetting.update({
      where: { key: validatedInput.data.key },
      data: { value: normalizedValue },
      select: {
        key: true,
        value: true,
      },
    });

    revalidateAdminSettingsPaths();

    return {
      success: true,
      data: {
        key: updated.key as SiteSettingKey,
        value: updated.value,
      },
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error updating site setting:", error);
    return { error: "Failed to update site setting" };
  }
}

export async function deleteSiteSetting(key: string): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedKey = SITE_SETTING_DELETE_SCHEMA.safeParse({ key });

    if (!validatedKey.success) {
      return {
        error:
          validatedKey.error.flatten().fieldErrors.key?.[0] ||
          "Invalid site setting key",
      };
    }

    const existing = await db.siteSetting.findUnique({
      where: { key: validatedKey.data.key },
      select: { key: true },
    });

    if (!existing) {
      return { error: "Site setting not found" };
    }

    await db.siteSetting.delete({
      where: { key: validatedKey.data.key },
    });

    revalidateAdminSettingsPaths();

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error deleting site setting:", error);
    return { error: "Failed to delete site setting" };
  }
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
): Promise<ActionState<SiteSettings>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const validatedInput = SITE_SETTINGS_UPDATE_SCHEMA.safeParse(input);

    if (!validatedInput.success) {
      const fieldErrors = validatedInput.error.flatten().fieldErrors;
      const firstFieldError = Object.values(fieldErrors).find(
        (messages) => messages?.[0],
      )?.[0];
      return { error: firstFieldError || "Invalid site settings data" };
    }

    const entries = Object.entries(validatedInput.data).filter(
      ([, value]) => value !== undefined,
    ) as [keyof SiteSettings, string | null][];

    await db.$transaction(async (tx) => {
      for (const [key, value] of entries) {
        const normalizedValue = normalizeNullableString(value);
        const existing = await tx.siteSetting.findUnique({
          where: { key },
          select: { id: true },
        });

        if (!normalizedValue) {
          if (existing) {
            await tx.siteSetting.delete({
              where: { key },
            });
          }
          continue;
        }

        if (existing) {
          await tx.siteSetting.update({
            where: { key },
            data: { value: normalizedValue },
          });
        } else {
          await tx.siteSetting.create({
            data: {
              key,
              value: normalizedValue,
            },
          });
        }
      }
    });

    revalidatePath(ADMIN_SETTINGS_PATH);

    const updatedSettings = await getSiteSettings();

    if (!updatedSettings.success || !updatedSettings.data) {
      return {
        error: updatedSettings.error || "Failed to load updated site settings",
      };
    }

    return { success: true, data: updatedSettings.data };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }

    console.error("Error updating site settings:", error);
    return { error: "Failed to update site settings" };
  }
}
