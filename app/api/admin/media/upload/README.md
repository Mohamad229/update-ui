# Media Upload API

## Endpoint

`POST /api/admin/media/upload`

Upload media files (images, documents, videos) to the Damira Pharma admin system.

## Authentication

Requires a valid Auth.js session. User must be logged in as ADMIN or INTERNAL_USER.

## Request Format

**Content-Type:** `multipart/form-data`

### Form Fields

| Field     | Type   | Required | Description                         |
| --------- | ------ | -------- | ----------------------------------- |
| `file`    | File   | Yes      | The file to upload                  |
| `alt`     | String | No       | Alt text for images (accessibility) |
| `title`   | String | No       | Title/name for the media            |
| `caption` | String | No       | Additional caption or description   |

## File Requirements

### Supported File Types

**Images:**

- JPEG/JPG (`image/jpeg`, `image/jpg`)
- PNG (`image/png`)
- GIF (`image/gif`)
- WebP (`image/webp`)
- SVG (`image/svg+xml`)

**Documents:**

- PDF (`application/pdf`)

**Videos:**

- MP4 (`video/mp4`)
- WebM (`video/webm`)

### File Size Limits

- Images: 10MB maximum
- Documents: 10MB maximum
- Videos: 50MB maximum

## Response Format

### Success Response (201 Created)

```json
{
  "success": true,
  "media": {
    "id": "clxyz123456789",
    "filename": "company-logo.png",
    "url": "/uploads/company-logo-1234567890-abc123.png",
    "type": "image",
    "mimeType": "image/png",
    "size": 524288,
    "width": 1920,
    "height": 1080,
    "alt": "Damira Pharma Company Logo",
    "title": "Company Logo",
    "caption": "Official company branding",
    "createdAt": "2026-04-08T10:30:00.000Z"
  }
}
```

### Error Responses

**401 Unauthorized:**

```json
{
  "error": "Unauthorized. Please log in."
}
```

**400 Bad Request - No file:**

```json
{
  "error": "No file provided. Please upload a file."
}
```

**400 Bad Request - Invalid file type:**

```json
{
  "error": "Invalid file type: application/exe. Allowed types are: images (jpg, jpeg, png, gif, webp, svg), documents (pdf), videos (mp4, webm)"
}
```

**400 Bad Request - File too large:**

```json
{
  "error": "Image file too large. Maximum size is 10MB"
}
```

**400 Bad Request - Invalid metadata:**

```json
{
  "error": "Invalid metadata",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["alt"],
      "message": "Expected string, received number"
    }
  ]
}
```

**500 Internal Server Error:**

```json
{
  "error": "Failed to upload file. Please try again.",
  "details": "Storage error: Unable to write file"
}
```

## Usage Examples

### JavaScript (Fetch API)

```javascript
const uploadMedia = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  // Add optional metadata
  if (metadata.alt) formData.append("alt", metadata.alt);
  if (metadata.title) formData.append("title", metadata.title);
  if (metadata.caption) formData.append("caption", metadata.caption);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
};

// Usage
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

try {
  const result = await uploadMedia(file, {
    alt: "Product image",
    title: "New Product Launch",
    caption: "Q2 2026 product release",
  });

  console.log("Upload successful:", result.media);
} catch (error) {
  console.error("Upload failed:", error.message);
}
```

### React Component Example

```typescript
'use client'

import { useState } from 'react';

export function MediaUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      console.log('Upload successful:', result.media);

      // Reset form
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="file">File:</label>
        <input
          type="file"
          id="file"
          name="file"
          required
          accept="image/*,video/*,.pdf"
        />
      </div>

      <div>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" name="title" />
      </div>

      <div>
        <label htmlFor="alt">Alt Text:</label>
        <input type="text" id="alt" name="alt" />
      </div>

      <div>
        <label htmlFor="caption">Caption:</label>
        <textarea id="caption" name="caption" />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
```

### cURL Example

```bash
# Upload an image with metadata
curl -X POST http://localhost:3000/api/admin/media/upload \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "alt=Product showcase image" \
  -F "title=Product Hero Image" \
  -F "caption=Featured on homepage"

# Upload a PDF document
curl -X POST http://localhost:3000/api/admin/media/upload \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "title=Product Catalog 2026"

# Upload a video
curl -X POST http://localhost:3000/api/admin/media/upload \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/video.mp4" \
  -F "title=Company Introduction Video"
```

## Implementation Details

### Storage

The API uses the storage abstraction layer in `lib/storage.ts`:

- **Local storage** (default): Files saved to `public/uploads/`
- **S3 storage**: Configured via environment variables

Filenames are automatically generated with timestamp and random string to prevent collisions.

### Image Processing

Images (except SVG) are processed using Sharp to extract dimensions (width/height). This data is stored in the database for responsive image optimization.

### Database Schema

Created media records include:

- `id`: Unique identifier (CUID)
- `filename`: Original filename
- `path`: Storage path/key
- `url`: Public URL
- `type`: Media category (image, document, video)
- `mimeType`: Full MIME type
- `size`: File size in bytes
- `width`/`height`: Dimensions (images only)
- `alt`: Alt text (optional)
- `title`: Title (optional)
- `caption`: Caption (optional)
- `uploadedById`: User ID who uploaded
- `createdAt`: Upload timestamp

## Environment Variables

Configure storage in your `.env` file:

```env
# Storage Provider (local or s3)
STORAGE_PROVIDER=local

# Local Storage (default)
LOCAL_UPLOAD_DIR=public/uploads
LOCAL_BASE_URL=/uploads

# S3 Storage (optional)
# S3_BUCKET=your-bucket-name
# S3_REGION=us-east-1
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key
# S3_ENDPOINT=https://s3.amazonaws.com  # For R2/MinIO
```

## Security Notes

1. **Authentication Required**: All uploads require a valid user session
2. **File Type Validation**: Strict MIME type checking
3. **File Size Limits**: Enforced to prevent abuse
4. **Unique Filenames**: Automatic generation prevents overwrites and path traversal
5. **User Attribution**: Uploads are linked to the authenticated user

## Related API Endpoints

- `GET /api/admin/media` - List all media files (TODO)
- `GET /api/admin/media/:id` - Get single media file (TODO)
- `DELETE /api/admin/media/:id` - Delete media file (TODO)
- `PATCH /api/admin/media/:id` - Update media metadata (TODO)
