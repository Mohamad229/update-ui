import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export type StorageProvider = "local" | "s3";

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface StorageConfig {
  provider: StorageProvider;
  // Local storage
  localUploadDir?: string;
  localBaseUrl?: string;
  // S3 storage
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Endpoint?: string; // For R2 or custom S3-compatible storage
}

function getConfig(): StorageConfig {
  return {
    provider: (process.env.STORAGE_PROVIDER as StorageProvider) || "local",
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || "public/uploads",
    localBaseUrl: process.env.LOCAL_BASE_URL || "/uploads",
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
    s3Endpoint: process.env.S3_ENDPOINT,
  };
}

// Generate a unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const baseName = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .substring(0, 50);
  return `${baseName}-${timestamp}-${random}${ext}`;
}

// Local storage implementation
async function uploadLocal(
  file: Buffer,
  filename: string,
  mimeType: string,
  config: StorageConfig,
): Promise<UploadResult> {
  const uploadDir = config.localUploadDir || "public/uploads";
  const baseUrl = config.localBaseUrl || "/uploads";

  // Create upload directory if it doesn't exist
  const fullDir = path.join(/*turbopackIgnore: true*/ process.cwd(), uploadDir);
  await mkdir(fullDir, { recursive: true });

  // Write file
  const filePath = path.join(fullDir, filename);
  await writeFile(filePath, file);

  return {
    url: `${baseUrl}/${filename}`,
    key: filename,
    size: file.length,
    mimeType,
  };
}

async function deleteLocal(key: string, config: StorageConfig): Promise<void> {
  const uploadDir = config.localUploadDir || "public/uploads";
  const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), uploadDir, key);

  try {
    await unlink(filePath);
  } catch (error) {
    // File might not exist, ignore error
    console.warn(`Failed to delete file: ${key}`, error);
  }
}

// S3 storage implementation (placeholder - implement when needed)
async function uploadS3(
  file: Buffer,
  filename: string,
  mimeType: string,
  config: StorageConfig,
): Promise<UploadResult> {
  // TODO: Implement S3 upload using AWS SDK
  // For now, throw an error
  throw new Error(
    "S3 storage not yet implemented. Please use local storage for development.",
  );
}

async function deleteS3(key: string, config: StorageConfig): Promise<void> {
  // TODO: Implement S3 delete using AWS SDK
  throw new Error("S3 storage not yet implemented.");
}

// Main storage interface
export const storage = {
  async upload(
    file: Buffer,
    originalFilename: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const config = getConfig();
    const filename = generateFilename(originalFilename);

    if (config.provider === "s3") {
      return uploadS3(file, filename, mimeType, config);
    }

    return uploadLocal(file, filename, mimeType, config);
  },

  async delete(key: string): Promise<void> {
    const config = getConfig();

    if (config.provider === "s3") {
      return deleteS3(key, config);
    }

    return deleteLocal(key, config);
  },

  getPublicUrl(key: string): string {
    const config = getConfig();

    if (config.provider === "s3") {
      // Return S3 URL
      return `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${key}`;
    }

    // Return local URL
    return `${config.localBaseUrl}/${key}`;
  },
};

export default storage;
