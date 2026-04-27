"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from "@/components/ui";
import { cn, formatFileSize } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

const ACCEPTED_FILE_TYPES = {
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    return null;
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: UploadFile[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      validFiles.push({
        file,
        id: generateId(),
        status: error ? "error" : "pending",
        progress: 0,
        error: error ?? undefined,
      });
    });

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [handleFiles],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<boolean> => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "uploading", progress: 0 }
            : f,
        ),
      );

      const formData = new FormData();
      formData.append("file", uploadFile.file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress } : f,
              ),
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? { ...f, status: "success", progress: 100 }
                  : f,
              ),
            );
            resolve(true);
          } else {
            const error = "Upload failed";
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, status: "error", error } : f,
              ),
            );
            resolve(false);
          }
        });

        xhr.addEventListener("error", () => {
          const error = "Network error";
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: "error", error } : f,
            ),
          );
          resolve(false);
        });

        xhr.open("POST", "/api/admin/media/upload");
        xhr.send(formData);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: errorMessage }
            : f,
        ),
      );
      return false;
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    if (pendingFiles.length === 0) {
      toast({
        title: "No files to upload",
        description: "Please add files first",
        variant: "warning",
      });
      return;
    }

    const results = await Promise.all(pendingFiles.map(uploadFile));
    const successCount = results.filter(Boolean).length;
    const failureCount = results.length - successCount;

    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`,
        variant: "success",
      });
      onUploadComplete?.();
    }

    if (failureCount > 0) {
      toast({
        title: "Some uploads failed",
        description: `${failureCount} file${failureCount > 1 ? "s" : ""} failed to upload`,
        variant: "error",
      });
    }

    // Clear successful uploads after a delay
    setTimeout(() => {
      setFiles((prev) => prev.filter((f) => f.status !== "success"));
    }, 2000);
  };

  const handleClose = () => {
    const hasUploading = files.some((f) => f.status === "uploading");
    if (hasUploading) {
      const confirmed = window.confirm(
        "Upload in progress. Are you sure you want to close?",
      );
      if (!confirmed) return;
    }
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload images, documents, or videos. Maximum file size:{" "}
            {formatFileSize(MAX_FILE_SIZE)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-[var(--radius-lg)] p-12",
              "transition-all duration-300 cursor-pointer",
              "hover:border-primary/50 hover:bg-primary/5",
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border bg-muted/20",
            )}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.keys(ACCEPTED_FILE_TYPES).join(",")}
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className={cn(
                  "flex items-center justify-center size-16 rounded-full",
                  "bg-gradient-to-br from-primary/20 to-primary/5",
                  "transition-transform duration-300",
                  isDragging && "scale-110",
                )}
              >
                <Upload className="size-8 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">
                  {isDragging ? "Drop files here" : "Drag and drop files here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse from your computer
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Supported: Images, PDFs, Documents, Videos
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Files ({files.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file) => (
                  <FileItem key={file.id} file={file} onRemove={removeFile} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {files.filter((f) => f.status === "pending").length} file(s) ready
            to upload
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleUploadAll} disabled={files.length === 0}>
              <Upload className="size-4 mr-2" />
              Upload All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FileItemProps {
  file: UploadFile;
  onRemove: (id: string) => void;
}

function FileItem({ file, onRemove }: FileItemProps) {
  const isImage = file.file.type.startsWith("image/");

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        "transition-all duration-200",
        file.status === "success" && "bg-success/5 border-success/30",
        file.status === "error" && "bg-destructive/5 border-destructive/30",
        file.status === "pending" && "bg-card border-border",
        file.status === "uploading" && "bg-primary/5 border-primary/30",
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {isImage ? (
          <ImageIcon className="size-8 text-primary" strokeWidth={1.5} />
        ) : (
          <FileText className="size-8 text-primary" strokeWidth={1.5} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {file.file.name}
          </p>
          {file.status === "success" && (
            <CheckCircle className="size-4 text-success flex-shrink-0" />
          )}
          {file.status === "error" && (
            <AlertCircle className="size-4 text-destructive flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.file.size)}
          </span>
          {file.error && (
            <span className="text-xs text-destructive">{file.error}</span>
          )}
        </div>
        {/* Progress Bar */}
        {file.status === "uploading" && (
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Remove Button */}
      {(file.status === "pending" || file.status === "error") && (
        <button
          onClick={() => onRemove(file.id)}
          className={cn(
            "flex-shrink-0 p-1 rounded-md",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary",
          )}
          aria-label="Remove file"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
