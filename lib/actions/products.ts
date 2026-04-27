"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma, ProductStatus, ProductType } from "@prisma/client";

import db from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// ============================================================================
// Constants
// ============================================================================

const ADMIN_PRODUCTS_PATH = "/admin/products";
const PUBLIC_PRODUCTS_PATHS = ["/products", "/ar/products"] as const;

// ============================================================================
// Zod Schemas
// ============================================================================

const ProductFilterSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
  type: z.enum(["SIMPLE", "ADVANCED"]).optional(),
  status: z.enum(["AVAILABLE", "PIPELINE"]).optional(),
  category: z.string().optional(),
  therapeuticArea: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["name", "createdAt", "status"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const CreateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name is too long"),
  description: z
    .string()
    .min(1, "Product description is required")
    .max(2000, "Description is too long"),
  type: z.enum(["SIMPLE", "ADVANCED"]).optional().default("SIMPLE"),
  status: z.enum(["AVAILABLE", "PIPELINE"]).optional().default("PIPELINE"),
  categoryId: z.string().optional().nullable(),
  therapeuticAreaId: z.string().optional().nullable(),
  manufacturerId: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  isPublished: z.boolean().optional().default(true),
  shortDescription: z.string().max(2000).optional().nullable(),
  fullDescription: z.string().max(10000).optional().nullable(),
  englishName: z.string().max(255).optional().nullable(),
  englishDescription: z.string().max(10000).optional().nullable(),
  arabicName: z.string().max(255).optional().nullable(),
  arabicDescription: z.string().max(10000).optional().nullable(),
  storageConditions: z.string().max(500).optional().nullable(),
  regulatoryInfo: z.string().max(10000).optional().nullable(),
});

const UpdateProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name is too long")
    .optional(),
  description: z
    .string()
    .min(1, "Product description is required")
    .max(2000, "Description is too long")
    .optional(),
  type: z.enum(["SIMPLE", "ADVANCED"]).optional(),
  status: z.enum(["AVAILABLE", "PIPELINE"]).optional(),
  categoryId: z.string().optional().nullable(),
  therapeuticAreaId: z.string().optional().nullable(),
  manufacturerId: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  shortDescription: z.string().max(2000).optional().nullable(),
  fullDescription: z.string().max(10000).optional().nullable(),
  englishName: z.string().max(255).optional().nullable(),
  englishDescription: z.string().max(10000).optional().nullable(),
  arabicName: z.string().max(255).optional().nullable(),
  arabicDescription: z.string().max(10000).optional().nullable(),
  storageConditions: z.string().max(500).optional().nullable(),
  regulatoryInfo: z.string().max(10000).optional().nullable(),
});

// ============================================================================
// Types
// ============================================================================

export type ActionState = {
  error?: string;
  success?: boolean;
  data?: unknown;
};

export type ProductFilterOptions = z.infer<typeof ProductFilterSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export type ProductListItem = {
  id: string;
  name: string;
  type: ProductType;
  status: ProductStatus;
  isPublished: boolean;
  category: { id: string; name: string } | null;
  therapeuticArea: { id: string; name: string } | null;
  manufacturer: { id: string; name: string } | null;
  coverImage: string | null;
  createdAt: Date;
};

export type ProductDetail = {
  id: string;
  name: string;
  type: ProductType;
  status: ProductStatus;
  description: string | null;
  coverImage: string | null;
  isPublished: boolean;
  category: { id: string; name: string; nameAr: string | null } | null;
  therapeuticArea: { id: string; name: string; nameAr: string | null } | null;
  manufacturer: { id: string; name: string; country: string | null } | null;
  translations: {
    locale: string;
    name: string;
    shortDescription: string | null;
    fullDescription: string | null;
  }[];
  advancedDetails: {
    storageConditions: string | null;
    regulatoryInfo: string | null;
  } | null;
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedProducts = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a slug from a product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Ensure slug uniqueness by appending a number if needed
 */
async function ensureUniqueSlug(
  baseSlug: string,
  productId?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    // If no existing product or it's the same product being updated, slug is unique
    if (!existing || (productId && existing.id === productId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Check if a product is being used in pages, forms, or other content
 */
async function getProductUsageCount(productId: string): Promise<number> {
  try {
    const formSubmissions = await db.formSubmission.count({
      where: { productId },
    });

    // Check if product is referenced in page sections (stored in JSON)
    const pageSections = await db.pageSection.findMany({
      select: { id: true, data: true },
    });

    const pageReferences = pageSections.filter((section) => {
      const dataStr = JSON.stringify(section.data);
      return dataStr.includes(productId);
    }).length;

    return formSubmissions + pageReferences;
  } catch (error) {
    console.error("Error checking product usage:", error);
    return 0;
  }
}

function revalidatePublicProductPaths(slug?: string) {
  for (const path of PUBLIC_PRODUCTS_PATHS) {
    revalidatePath(path);
    if (slug) {
      revalidatePath(`${path}/${slug}`);
    }
  }
}

// ============================================================================
// Public Server Actions
// ============================================================================

/**
 * Get paginated list of products with filtering, searching, and sorting
 *
 * @param options - Pagination, filtering, and sorting options
 * @returns Paginated products list with total count
 */
export async function getProducts(
  options?: Partial<ProductFilterOptions>,
): Promise<ActionState & { data?: PaginatedProducts }> {
  try {
    await requireAuth();

    // Validate options
    const validatedOptions = ProductFilterSchema.safeParse(options);

    if (!validatedOptions.success) {
      return { error: "Invalid filter options provided" };
    }

    const {
      page,
      pageSize,
      type,
      status,
      category,
      therapeuticArea,
      search,
      sortBy,
      sortOrder,
    } = validatedOptions.data;

    const skip = (page - 1) * pageSize;

    // Build where clause for filtering
    const where: Prisma.ProductWhereInput = {};

    // Filter by type
    if (type) {
      where.type = type as ProductType;
    }

    // Filter by status
    if (status) {
      where.status = status as ProductStatus;
    }

    // Filter by category
    if (category) {
      where.categoryId = category;
    }

    // Filter by therapeutic area
    if (therapeuticArea) {
      where.therapeuticAreaId = therapeuticArea;
    }

    // Search by name or description
    if (search && search.trim().length > 0) {
      where.OR = [
        {
          translations: {
            some: {
              name: {
                contains: search.trim(),
                mode: "insensitive",
              },
            },
          },
        },
        {
          translations: {
            some: {
              shortDescription: {
                contains: search.trim(),
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    // Determine sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput;

    if (sortBy === "name") {
      orderBy = {
        translations: {
          _count: sortOrder,
        },
      };
    } else if (sortBy === "status") {
      orderBy = { status: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          type: true,
          status: true,
          isPublished: true,
          coverImage: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          therapeuticArea: {
            select: {
              id: true,
              name: true,
            },
          },
          manufacturer: {
            select: {
              id: true,
              name: true,
            },
          },
          translations: {
            where: { locale: "en" },
            select: { name: true },
            take: 1,
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const mediaIds = items
      .map((product) => product.coverImage)
      .filter(
        (value): value is string =>
          typeof value === "string" &&
          value.length > 0 &&
          !value.startsWith("/") &&
          !value.startsWith("http://") &&
          !value.startsWith("https://"),
      )
      .filter((value, index, values) => values.indexOf(value) === index);

    const mediaMap = new Map<string, string>();
    if (mediaIds.length > 0) {
      const mediaRecords = await db.media.findMany({
        where: {
          id: {
            in: mediaIds,
          },
        },
        select: {
          id: true,
          url: true,
        },
      });

      for (const media of mediaRecords) {
        mediaMap.set(media.id, media.url);
      }
    }

    // Transform results to include name from translations
    const formattedItems: ProductListItem[] = items.map((product) => ({
      id: product.id,
      name: product.translations[0]?.name || "Untitled Product",
      type: product.type,
      status: product.status,
      isPublished: product.isPublished,
      category: product.category,
      therapeuticArea: product.therapeuticArea,
      manufacturer: product.manufacturer,
      coverImage:
        product.coverImage && mediaMap.has(product.coverImage)
          ? mediaMap.get(product.coverImage) || null
          : product.coverImage,
      createdAt: product.createdAt,
    }));

    return {
      success: true,
      data: {
        items: formattedItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products" };
  }
}

/**
 * Get a single product with all details
 *
 * @param id - The product ID
 * @returns Product with all details or null if not found
 */
export async function getProductById(
  id: string,
): Promise<ActionState & { data?: ProductDetail | null }> {
  try {
    await requireAuth();

    if (!id || typeof id !== "string") {
      return { error: "Invalid product ID" };
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        therapeuticArea: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
        translations: {
          select: {
            locale: true,
            name: true,
            shortDescription: true,
            fullDescription: true,
          },
        },
        advancedDetails: {
          select: {
            storageConditions: true,
            regulatoryInfo: true,
          },
        },
        attachments: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            size: true,
          },
        },
      },
    });

    if (!product) {
      return { success: true, data: null };
    }

    const detail: ProductDetail = {
      id: product.id,
      name:
        product.translations.find((t) => t.locale === "en")?.name || "Untitled",
      type: product.type,
      status: product.status,
      description:
        product.translations.find((t) => t.locale === "en")?.shortDescription ||
        null,
      coverImage: product.coverImage,
      isPublished: product.isPublished,
      category: product.category,
      therapeuticArea: product.therapeuticArea,
      manufacturer: product.manufacturer,
      translations: product.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        shortDescription: t.shortDescription,
        fullDescription: t.fullDescription,
      })),
      advancedDetails: product.advancedDetails,
      attachments: product.attachments,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return { success: true, data: detail };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching product:", error);
    return { error: "Failed to fetch product" };
  }
}

/**
 * Create a new product
 *
 * @param input - Product creation data
 * @returns Success with product ID or error
 */
export async function createProduct(
  input: CreateProductInput,
): Promise<ActionState & { data?: { productId: string } }> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = CreateProductSchema.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(errors)
          .flatMap((e) => e || [])
          .join(", ") || "Invalid product data provided";
      return { error: errorMessage };
    }

    const {
      name,
      description,
      type,
      status,
      categoryId,
      therapeuticAreaId,
      manufacturerId,
      coverImageId,
      isPublished,
      shortDescription,
      fullDescription,
      englishName,
      englishDescription,
      arabicName,
      arabicDescription,
      storageConditions,
      regulatoryInfo,
    } = validatedInput.data;

    const normalizedShortDescription =
      shortDescription?.trim() || description.trim();
    const normalizedFullDescription =
      fullDescription?.trim() ||
      englishDescription?.trim() ||
      normalizedShortDescription;
    const normalizedEnglishName = englishName?.trim() || name.trim();
    const normalizedArabicName = arabicName?.trim() || normalizedEnglishName;
    const normalizedArabicDescription =
      arabicDescription?.trim() || normalizedFullDescription;
    const normalizedStorageConditions = storageConditions?.trim() || null;
    const normalizedRegulatoryInfo = regulatoryInfo?.trim() || null;

    // Validate related entities exist
    if (categoryId) {
      const category = await db.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });
      if (!category) {
        return { error: "Selected category does not exist" };
      }
    }

    if (therapeuticAreaId) {
      const therapeuticArea = await db.therapeuticArea.findUnique({
        where: { id: therapeuticAreaId },
        select: { id: true },
      });
      if (!therapeuticArea) {
        return { error: "Selected therapeutic area does not exist" };
      }
    }

    if (manufacturerId) {
      const manufacturer = await db.manufacturer.findUnique({
        where: { id: manufacturerId },
        select: { id: true },
      });
      if (!manufacturer) {
        return { error: "Selected manufacturer does not exist" };
      }
    }

    // Validate cover image exists if provided
    if (coverImageId) {
      const media = await db.media.findUnique({
        where: { id: coverImageId },
        select: { url: true },
      });
      if (!media) {
        return { error: "Selected cover image does not exist" };
      }
    }

    // Generate unique slug
    const baseSlug = generateSlug(name);
    const slug = await ensureUniqueSlug(baseSlug);

    // Create product with English and Arabic translations
    const product = await db.product.create({
      data: {
        slug,
        type: type as ProductType,
        status: status as ProductStatus,
        coverImage: coverImageId || null,
        isPublished,
        categoryId: categoryId || null,
        therapeuticAreaId: therapeuticAreaId || null,
        manufacturerId: manufacturerId || null,
        translations: {
          create: [
            {
              locale: "en",
              name: normalizedEnglishName,
              shortDescription: normalizedShortDescription,
              fullDescription: normalizedFullDescription,
            },
            {
              locale: "ar",
              name: normalizedArabicName,
              shortDescription: normalizedArabicDescription,
              fullDescription: normalizedArabicDescription,
            },
          ],
        },
        advancedDetails:
          normalizedStorageConditions || normalizedRegulatoryInfo
            ? {
                create: {
                  storageConditions: normalizedStorageConditions,
                  regulatoryInfo: normalizedRegulatoryInfo,
                },
              }
            : undefined,
      },
      select: { id: true },
    });

    revalidatePath(ADMIN_PRODUCTS_PATH);
    revalidatePublicProductPaths(slug);

    return {
      success: true,
      data: { productId: product.id },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}

/**
 * Update an existing product
 *
 * @param input - Product update data (must include id)
 * @returns Success or error result
 */
export async function updateProduct(
  input: UpdateProductInput,
): Promise<ActionState> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = UpdateProductSchema.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(errors)
          .flatMap((e) => e || [])
          .join(", ") || "Invalid product data provided";
      return { error: errorMessage };
    }

    const {
      id,
      name,
      description,
      type,
      status,
      categoryId,
      therapeuticAreaId,
      manufacturerId,
      coverImageId,
      isPublished,
      shortDescription,
      fullDescription,
      englishName,
      englishDescription,
      arabicName,
      arabicDescription,
      storageConditions,
      regulatoryInfo,
    } = validatedInput.data;

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existingProduct) {
      return { error: "Product not found" };
    }

    // Validate related entities if provided
    if (categoryId !== undefined && categoryId) {
      const category = await db.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });
      if (!category) {
        return { error: "Selected category does not exist" };
      }
    }

    if (therapeuticAreaId !== undefined && therapeuticAreaId) {
      const therapeuticArea = await db.therapeuticArea.findUnique({
        where: { id: therapeuticAreaId },
        select: { id: true },
      });
      if (!therapeuticArea) {
        return { error: "Selected therapeutic area does not exist" };
      }
    }

    if (manufacturerId !== undefined && manufacturerId) {
      const manufacturer = await db.manufacturer.findUnique({
        where: { id: manufacturerId },
        select: { id: true },
      });
      if (!manufacturer) {
        return { error: "Selected manufacturer does not exist" };
      }
    }

    // Validate cover image if provided
    if (coverImageId !== undefined && coverImageId) {
      const media = await db.media.findUnique({
        where: { id: coverImageId },
        select: { url: true },
      });
      if (!media) {
        return { error: "Selected cover image does not exist" };
      }
    }

    // Build update data
    const updateData: Prisma.ProductUpdateInput = {};

    if (type) {
      updateData.type = type as ProductType;
    }

    if (status) {
      updateData.status = status as ProductStatus;
    }

    if (categoryId !== undefined) {
      updateData.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true };
    }

    if (therapeuticAreaId !== undefined) {
      updateData.therapeuticArea = therapeuticAreaId
        ? { connect: { id: therapeuticAreaId } }
        : { disconnect: true };
    }

    if (manufacturerId !== undefined) {
      updateData.manufacturer = manufacturerId
        ? { connect: { id: manufacturerId } }
        : { disconnect: true };
    }

    if (coverImageId !== undefined) {
      updateData.coverImage = coverImageId;
    }

    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
    }

    const normalizedStorageConditions =
      storageConditions === undefined ? undefined : storageConditions?.trim() || null;
    const normalizedRegulatoryInfo =
      regulatoryInfo === undefined ? undefined : regulatoryInfo?.trim() || null;

    // Update translations when locale-specific or generic text fields are provided.
    if (
      name ||
      description ||
      shortDescription !== undefined ||
      fullDescription !== undefined ||
      englishName !== undefined ||
      englishDescription !== undefined ||
      arabicName !== undefined ||
      arabicDescription !== undefined
    ) {
      const translationUpdates = await db.productTranslation.findMany({
        where: { productId: id },
        select: { id: true, locale: true },
      });

      if (translationUpdates.length > 0) {
        await Promise.all(
          translationUpdates.map((trans) => {
            const isEnglish = trans.locale === "en";

            const nextName = isEnglish
              ? englishName?.trim() || name?.trim()
              : arabicName?.trim();

            const nextShortDescription = isEnglish
              ? shortDescription?.trim() || description?.trim()
              : arabicDescription?.trim();

            const nextFullDescription = isEnglish
              ? fullDescription?.trim() ||
                englishDescription?.trim() ||
                shortDescription?.trim() ||
                description?.trim()
              : arabicDescription?.trim();

            return db.productTranslation.update({
              where: { id: trans.id },
              data: {
                ...(nextName ? { name: nextName } : {}),
                ...(nextShortDescription !== undefined
                  ? { shortDescription: nextShortDescription || null }
                  : {}),
                ...(nextFullDescription !== undefined
                  ? { fullDescription: nextFullDescription || null }
                  : {}),
              },
            });
          }),
        );
      }
    }

    if (normalizedStorageConditions !== undefined || normalizedRegulatoryInfo !== undefined) {
      const currentAdvanced = await db.productAdvancedDetails.findUnique({
        where: { productId: id },
        select: { id: true, storageConditions: true, regulatoryInfo: true },
      });

      const nextStorageConditions =
        normalizedStorageConditions !== undefined
          ? normalizedStorageConditions
          : currentAdvanced?.storageConditions || null;
      const nextRegulatoryInfo =
        normalizedRegulatoryInfo !== undefined
          ? normalizedRegulatoryInfo
          : currentAdvanced?.regulatoryInfo || null;

      if (nextStorageConditions || nextRegulatoryInfo) {
        updateData.advancedDetails = {
          upsert: {
            create: {
              storageConditions: nextStorageConditions,
              regulatoryInfo: nextRegulatoryInfo,
            },
            update: {
              storageConditions: nextStorageConditions,
              regulatoryInfo: nextRegulatoryInfo,
            },
          },
        };
      } else if (currentAdvanced) {
        await db.productAdvancedDetails.delete({
          where: { productId: id },
        });
      }
    }

    // Update product
    await db.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(ADMIN_PRODUCTS_PATH);
    revalidatePublicProductPaths(existingProduct.slug);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
}

/**
 * Delete a product and all its related data
 *
 * @param id - The product ID to delete
 * @returns Success or error result with usage count if in use
 */
export async function deleteProduct(id: string): Promise<
  ActionState & {
    data?: {
      usageCount?: number;
    };
  }
> {
  try {
    await requireAuth();

    if (!id || typeof id !== "string") {
      return { error: "Invalid product ID" };
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!product) {
      return { error: "Product not found" };
    }

    // Check if product is being used
    const usageCount = await getProductUsageCount(id);

    if (usageCount > 0) {
      return {
        error: `Cannot delete product. It is currently being used in ${usageCount} form submission(s) or page(s).`,
        data: { usageCount },
      };
    }

    // Delete product (cascading deletes will handle translations and attachments)
    await db.product.delete({
      where: { id },
    });

    revalidatePath(ADMIN_PRODUCTS_PATH);
    revalidatePublicProductPaths(product.slug);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
}

// ============================================================================
// Lookup Functions
// ============================================================================

/**
 * Get all available product types
 *
 * @returns Array of product type enum values
 */
export async function getProductTypes(): Promise<
  ActionState & { data?: string[] }
> {
  try {
    await requireAuth();

    const types = Object.values(ProductType);

    return {
      success: true,
      data: types,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching product types:", error);
    return { error: "Failed to fetch product types" };
  }
}

/**
 * Get all available product statuses
 *
 * @returns Array of product status enum values
 */
export async function getProductStatuses(): Promise<
  ActionState & { data?: string[] }
> {
  try {
    await requireAuth();

    const statuses = Object.values(ProductStatus);

    return {
      success: true,
      data: statuses,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching product statuses:", error);
    return { error: "Failed to fetch product statuses" };
  }
}

/**
 * Get all product categories
 *
 * @returns Array of categories with id and name
 */
export async function getCategories(): Promise<
  ActionState & {
    data?: Array<{
      id: string;
      name: string;
      nameAr: string | null;
      slug: string;
    }>;
  }
> {
  try {
    await requireAuth();

    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching categories:", error);
    return { error: "Failed to fetch categories" };
  }
}

/**
 * Get all therapeutic areas
 *
 * @returns Array of therapeutic areas with id and name
 */
export async function getTherapeuticAreas(): Promise<
  ActionState & {
    data?: Array<{
      id: string;
      name: string;
      nameAr: string | null;
      slug: string;
    }>;
  }
> {
  try {
    await requireAuth();

    const areas = await db.therapeuticArea.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: areas,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching therapeutic areas:", error);
    return { error: "Failed to fetch therapeutic areas" };
  }
}

/**
 * Get all manufacturers
 *
 * @returns Array of manufacturers with id and name
 */
export async function getManufacturers(): Promise<
  ActionState & {
    data?: Array<{
      id: string;
      name: string;
      slug: string;
      country: string | null;
    }>;
  }
> {
  try {
    await requireAuth();

    const manufacturers = await db.manufacturer.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: manufacturers,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching manufacturers:", error);
    return { error: "Failed to fetch manufacturers" };
  }
}
