import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import storage from "@/lib/storage";

// File validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx"];

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Validation schema for optional metadata
const uploadMetadataSchema = z.object({
  name: z.string().optional(),
});

type FileValidationResult =
  | { valid: true; mediaType: "image" | "document" }
  | { valid: false; error: string };

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Validate file type and size
 */
function validateFile(file: File): FileValidationResult {
  const { type: mimeType, size, name } = file;
  const extension = getFileExtension(name);

  // Check if it's an image
  const isImageByMime = ALLOWED_IMAGE_MIME_TYPES.includes(mimeType);
  const isImageByExt = ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  // Check if it's a document
  const isDocumentByMime = ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType);
  const isDocumentByExt = ALLOWED_DOCUMENT_EXTENSIONS.includes(extension);

  // Validate image
  if (isImageByMime || isImageByExt) {
    if (!isImageByMime && !isImageByExt) {
      return {
        valid: false,
        error: `Invalid image file. File extension or MIME type mismatch.`,
      };
    }

    if (size > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Image file too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
      };
    }

    return { valid: true, mediaType: "image" };
  }

  // Validate document
  if (isDocumentByMime || isDocumentByExt) {
    if (!isDocumentByMime && !isDocumentByExt) {
      return {
        valid: false,
        error: `Invalid document file. File extension or MIME type mismatch.`,
      };
    }

    if (size > MAX_DOCUMENT_SIZE) {
      return {
        valid: false,
        error: `Document file too large. Maximum size is ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB.`,
      };
    }

    return { valid: true, mediaType: "document" };
  }

  // File type not allowed
  return {
    valid: false,
    error: `Invalid file type: ${mimeType} (.${extension}). Allowed types: images (${ALLOWED_IMAGE_EXTENSIONS.join(", ")}), documents (${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}).`,
  };
}

/**
 * Extract image dimensions - basic implementation
 * For production, consider using 'image-size' or 'sharp' package
 */
async function getImageDimensions(
  buffer: Buffer,
  mimeType: string,
): Promise<{ width: number; height: number } | null> {
  try {
    // Skip SVG files - dimensions are often not fixed
    if (mimeType === "image/svg+xml") {
      return null;
    }

    // Try to use sharp if available (optional dependency)
    try {
      const sharp = await import("sharp");
      const metadata = await sharp.default(buffer).metadata();
      if (metadata.width && metadata.height) {
        return {
          width: metadata.width,
          height: metadata.height,
        };
      }
    } catch {
      // sharp not available, try basic PNG/JPEG header parsing
      return parseImageDimensionsFromBuffer(buffer);
    }

    return null;
  } catch (error) {
    console.error("Failed to extract image dimensions:", error);
    return null;
  }
}

/**
 * Parse image dimensions from buffer header (basic fallback)
 */
function parseImageDimensionsFromBuffer(
  buffer: Buffer,
): { width: number; height: number } | null {
  try {
    // PNG signature check
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      // PNG: width at bytes 16-19, height at bytes 20-23 (big endian)
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    // JPEG signature check
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      // JPEG: need to parse markers to find SOF
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break;

        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);

        // SOF0, SOF1, SOF2 markers contain dimensions
        if (marker >= 0xc0 && marker <= 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }

        offset += 2 + length;
      }
    }

    // GIF signature check
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      // GIF: width at bytes 6-7, height at bytes 8-9 (little endian)
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * POST /api/media/upload
 * Upload a media file (image or document)
 *
 * Request: multipart/form-data with 'file' field
 * Optional fields: 'name' (custom name for the media)
 *
 * Response: { success: true, media: Media } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user - only admin users allowed
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    // Check for admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
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

    // 3. Validate file type and size
    const validation = validateFile(file);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Parse optional metadata
    const customName = formData.get("name") as string | null;
    const metadataValidation = uploadMetadataSchema.safeParse({
      name: customName || undefined,
    });

    if (!metadataValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid metadata",
          details: metadataValidation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // 5. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Extract dimensions for images
    let dimensions: { width: number; height: number } | null = null;

    if (validation.mediaType === "image") {
      dimensions = await getImageDimensions(buffer, file.type);
    }

    // 7. Upload file to storage
    const uploadResult = await storage.upload(buffer, file.name, file.type);

    // 8. Determine the display name
    const displayName =
      metadataValidation.data.name || file.name.replace(/\.[^/.]+$/, "");

    // 9. Create media record in database
    const db = (await import("@/lib/db")).default;
    const media = await db.media.create({
      data: {
        name: displayName,
        url: uploadResult.url,
        type: validation.mediaType,
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
          error: "Validation failed",
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
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
