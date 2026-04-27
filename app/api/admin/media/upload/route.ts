import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";

import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";

// File validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

// Validation schema for file metadata
const fileMetadataSchema = z.object({
  name: z.string().optional(),
});

/**
 * Validate file type and size based on mime type
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  const { type, size } = file;

  // Check if file type is allowed
  const isImage = ALLOWED_IMAGE_TYPES.includes(type);
  const isDocument = ALLOWED_DOCUMENT_TYPES.includes(type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(type);

  if (!isImage && !isDocument && !isVideo) {
    return {
      valid: false,
      error: `Invalid file type: ${type}. Allowed types are: images (jpg, jpeg, png, gif, webp, svg), documents (pdf), videos (mp4, webm)`,
    };
  }

  // Check file size
  if (isImage && size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image file too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (isVideo && size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
    };
  }

  if (isDocument && size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: `Document file too large. Maximum size is ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get media type category from mime type
 */
function getMediaType(mimeType: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return "image";
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return "video";
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return "document";
  }
  return "other";
}

/**
 * Extract image dimensions using sharp
 */
async function getImageDimensions(
  buffer: Buffer,
): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.height) {
      return {
        width: metadata.width,
        height: metadata.height,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to extract image dimensions:", error);
    return null;
  }
}

/**
 * POST /api/admin/media/upload
 * Upload a media file (image, document, or video)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a file." },
        { status: 400 },
      );
    }

    // 3. Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Parse and validate metadata
    const customName = formData.get("name") as string | null;

    const validatedMetadata = fileMetadataSchema.parse({
      name: customName || undefined,
    });

    // 5. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Extract dimensions for images
    let dimensions: { width: number; height: number } | null = null;
    const mediaType = getMediaType(file.type);

    if (mediaType === "image" && file.type !== "image/svg+xml") {
      dimensions = await getImageDimensions(buffer);
    }

    // 7. Upload file to storage
    const uploadResult = await storage.upload(buffer, file.name, file.type);

    // 8. Determine the display name
    const displayName =
      validatedMetadata.name || file.name.replace(/\.[^/.]+$/, "");

    // 9. Create media record in database
    const db = (await import("@/lib/db")).default;
    const media = await db.media.create({
      data: {
        name: displayName,
        url: uploadResult.url,
        type: mediaType,
        mimeType: file.type,
        size: uploadResult.size,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        uploadedById: session.user.id,
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

    // 10. Return success response
    return NextResponse.json(
      {
        success: true,
        media: {
          id: media.id,
          name: media.name,
          url: media.url,
          type: media.type,
          mimeType: media.mimeType,
          size: media.size,
          width: media.width,
          height: media.height,
          uploadedById: media.uploadedById,
          uploadedBy: media.uploadedBy,
          createdAt: media.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Media upload error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid metadata",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to upload file. Please try again.",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
