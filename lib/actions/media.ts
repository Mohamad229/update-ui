"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import db from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import storage from "@/lib/storage";

// Constants
const ADMIN_MEDIA_PATH = "/admin/media";

// Zod Schemas
const getMediaOptionsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  type: z.enum(["image", "document"]).optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const updateMediaNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

// Types
export type ActionState = {
  error?: string;
  success?: boolean;
  data?: unknown;
};

export type MediaType = "image" | "document";

export type MediaWithUser = {
  id: string;
  name: string;
  url: string;
  type: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  uploadedById: string | null;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: Date;
};

export type PaginatedMedia = {
  media: MediaWithUser[];
  total: number;
  page: number;
  totalPages: number;
};

export type GetMediaOptions = {
  page?: number;
  limit?: number;
  type?: MediaType;
  search?: string;
  sortOrder?: "asc" | "desc";
};

// Backward compatibility alias
export type GetMediaListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: MediaType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/**
 * Get paginated list of media files with filtering and search
 *
 * @param options - Pagination, filtering, and sorting options
 * @returns Paginated media list with total count
 */
export async function getMedia(
  options: GetMediaOptions = {},
): Promise<ActionState & { data?: PaginatedMedia }> {
  try {
    await requireAuth();

    // Validate options
    const validatedOptions = getMediaOptionsSchema.safeParse(options);

    if (!validatedOptions.success) {
      return {
        error: "Invalid options provided",
      };
    }

    const { page, limit, type, search, sortOrder } = validatedOptions.data;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: {
      type?: string;
      name?: { contains: string; mode: "insensitive" };
    } = {};

    // Filter by media type
    if (type) {
      where.type = type;
    }

    // Search by name
    if (search && search.trim().length > 0) {
      where.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      db.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: sortOrder,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.media.count({ where }),
    ]);

    return {
      success: true,
      data: {
        media: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching media list:", error);
    return { error: "Failed to fetch media list" };
  }
}

/**
 * Get a single media file by ID
 *
 * @param id - The media ID
 * @returns Media item or null if not found
 */
export async function getMediaById(
  id: string,
): Promise<ActionState & { data?: MediaWithUser | null }> {
  try {
    await requireAuth();

    if (!id || typeof id !== "string") {
      return { error: "Invalid media ID" };
    }

    const media = await db.media.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!media) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: media,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching media:", error);
    return { error: "Failed to fetch media" };
  }
}

/**
 * Update the name/alt text of a media item
 *
 * @param id - The media ID
 * @param name - The new name for the media
 * @returns Updated media item or error
 */
export async function updateMediaName(
  id: string,
  name: string,
): Promise<ActionState & { data?: MediaWithUser }> {
  try {
    await requireAuth();

    if (!id || typeof id !== "string") {
      return { error: "Invalid media ID" };
    }

    // Validate input data
    const validatedFields = updateMediaNameSchema.safeParse({ name });

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = errors.name?.[0] || "Invalid input";
      return { error: errorMessage };
    }

    // Check if media exists
    const existingMedia = await db.media.findUnique({
      where: { id },
    });

    if (!existingMedia) {
      return { error: "Media not found" };
    }

    // Update media record
    const updatedMedia = await db.media.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(ADMIN_MEDIA_PATH);

    return {
      success: true,
      data: updatedMedia,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error updating media:", error);
    return { error: "Failed to update media" };
  }
}

/**
 * Check if media is being used in any content
 */
async function isMediaInUse(mediaUrl: string): Promise<boolean> {
  try {
    // Check if media is used as product cover image
    const productWithMedia = await db.product.findFirst({
      where: { coverImage: mediaUrl },
      select: { id: true },
    });

    if (productWithMedia) {
      return true;
    }

    // Check if media is used in product attachments
    const productAttachment = await db.productAttachment.findFirst({
      where: { url: mediaUrl },
      select: { id: true },
    });

    if (productAttachment) {
      return true;
    }

    // Check if media is used in page sections (stored in JSON data field)
    const pageSections = await db.pageSection.findMany({
      select: { id: true, data: true },
    });

    // Check if any section's data contains the media URL
    const hasMediaInSections = pageSections.some((section) => {
      const dataStr = JSON.stringify(section.data);
      return dataStr.includes(mediaUrl);
    });

    if (hasMediaInSections) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking media usage:", error);
    // If we can't verify, assume it's in use to be safe
    return true;
  }
}

/**
 * Extract the storage key from a media URL
 * Handles both local URLs (/uploads/filename.jpg) and S3 URLs
 */
function extractStorageKey(url: string): string {
  try {
    // For local storage URLs like /uploads/filename.jpg
    if (url.startsWith("/uploads/")) {
      return url.replace("/uploads/", "");
    }

    // For S3 URLs, extract the key from the path
    const urlObj = new URL(url);
    return urlObj.pathname.split("/").pop() || url;
  } catch {
    // If URL parsing fails, assume it's already a key
    return url;
  }
}

/**
 * Delete a media file from database and storage
 *
 * @param id - The media ID to delete
 * @returns Success or error result
 */
export async function deleteMedia(id: string): Promise<ActionState> {
  try {
    await requireAuth();

    if (!id || typeof id !== "string") {
      return { error: "Invalid media ID" };
    }

    // Check if media exists
    const media = await db.media.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        name: true,
      },
    });

    if (!media) {
      return { error: "Media not found" };
    }

    // Check if media is used in any content
    const inUse = await isMediaInUse(media.url);

    if (inUse) {
      return {
        error:
          "Cannot delete media file. It is currently being used in products or pages.",
      };
    }

    // Extract storage key from URL
    const storageKey = extractStorageKey(media.url);

    // Delete from storage first (but don't fail if it doesn't exist)
    try {
      await storage.delete(storageKey);
    } catch (error) {
      console.warn(`Failed to delete file from storage: ${storageKey}`, error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db.media.delete({
      where: { id },
    });

    revalidatePath(ADMIN_MEDIA_PATH);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error deleting media:", error);
    return { error: "Failed to delete media" };
  }
}

// ============================================================================
// Legacy exports for backward compatibility
// ============================================================================

// Legacy type aliases for backward compatibility
export type MediaItem = MediaWithUser;
export type MediaListResult = PaginatedMedia;

/**
 * @deprecated Use getMedia instead
 */
export async function getMediaList(
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: MediaType;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {},
): Promise<
  ActionState & {
    data?: {
      items: MediaWithUser[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }
> {
  const result = await getMedia({
    page: params.page,
    limit: params.pageSize,
    type: params.type,
    search: params.search,
    sortOrder: params.sortOrder,
  });

  if (result.error || !result.data) {
    return { error: result.error };
  }

  // Transform to legacy format
  return {
    success: true,
    data: {
      items: result.data.media,
      total: result.data.total,
      page: result.data.page,
      pageSize: params.pageSize || 20,
      totalPages: result.data.totalPages,
    },
  };
}

/**
 * @deprecated Use updateMediaName instead
 */
export async function updateMedia(
  id: string,
  data: { name: string },
): Promise<ActionState> {
  return updateMediaName(id, data.name);
}
