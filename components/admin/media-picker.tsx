"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import {
  Search,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  X,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn, formatFileSize, copyToClipboard } from "@/lib/utils";

import type {
  MediaWithUser,
  MediaType,
  GetMediaOptions,
} from "@/lib/actions/media";
import { getMedia } from "@/lib/actions/media";

// ============================================================================
// Types
// ============================================================================

export interface MediaPickerProps {
  /** Control modal visibility */
  open: boolean;
  /** Handle modal close */
  onOpenChange: (open: boolean) => void;
  /** Callback with selected media */
  onSelect: (media: MediaWithUser | MediaWithUser[]) => void;
  /** Allow multiple selection (default: false) */
  multiple?: boolean;
  /** Filter by type (default: 'all') */
  accept?: "image" | "document" | "all";
  /** Title for the modal */
  title?: string;
  /** Description for the modal */
  description?: string;
}

type FilterType = "all" | MediaType;

interface ClientPaginatedMedia {
  media: MediaWithUser[];
  total: number;
  page: number;
  totalPages: number;
}

// ============================================================================
// MediaPicker Component
// ============================================================================

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  accept = "all",
  title = "Select Media",
  description,
}: MediaPickerProps) {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>(
    accept === "all" ? "all" : accept,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<ClientPaginatedMedia | null>(null);
  const [selectedItems, setSelectedItems] = useState<
    Map<string, MediaWithUser>
  >(new Map());
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const pageSize = 12;

  // Load media function - defined before useEffect hooks that depend on it
  const loadMedia = useCallback(
    async (params: GetMediaOptions = {}) => {
      startTransition(async () => {
        const effectiveType =
          accept !== "all"
            ? accept
            : params.type || (typeFilter === "all" ? undefined : typeFilter);

        const result = await getMedia({
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          type: effectiveType,
          ...params,
        });

        if (result.success && result.data) {
          setData(result.data);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load media",
            variant: "error",
          });
        }
      });
    },
    [currentPage, searchQuery, typeFilter, accept, toast],
  );

  // Load media on open
  useEffect(() => {
    if (open) {
      loadMedia({ page: 1 });
    }
  }, [open, loadMedia]);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      loadMedia({
        search: searchQuery,
        type: typeFilter === "all" ? undefined : typeFilter,
        page: 1,
      });
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter, open, loadMedia]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadMedia({ page: newPage });
  };

  const handleToggleSelect = (media: MediaWithUser) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(media.id)) {
        newMap.delete(media.id);
      } else {
        if (!multiple) {
          newMap.clear();
        }
        newMap.set(media.id, media);
      }
      return newMap;
    });
  };

  const handleCopyUrl = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      toast({
        title: "URL Copied",
        description: "Media URL copied to clipboard",
        variant: "success",
      });
    }
  };

  const handleConfirmSelection = () => {
    const selected = Array.from(selectedItems.values());
    if (selected.length === 0) return;

    if (multiple) {
      onSelect(selected);
    } else {
      onSelect(selected[0]);
    }

    handleClose();
  };

  const handleClose = () => {
    setSelectedItems(new Map());
    setSearchQuery("");
    setTypeFilter(accept === "all" ? "all" : accept);
    setCurrentPage(1);
    setShowUploadZone(false);
    onOpenChange(false);
  };

  const handleUploadComplete = () => {
    loadMedia();
    setShowUploadZone(false);
  };

  const defaultDescription = multiple
    ? "Select one or more files from your media library"
    : "Select a file from your media library";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription>
              {description || defaultDescription}
            </DialogDescription>
          </DialogHeader>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefixIcon={<Search className="size-4" />}
                suffixIcon={
                  searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )
                }
              />
            </div>

            {/* Type Filter (only show if accept is 'all') */}
            {accept === "all" && (
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <div className="flex rounded-lg border border-border bg-background p-1">
                  {(["all", "image", "document"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all duration-200",
                        typeFilter === type
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      {type === "all"
                        ? "All"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                      s
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadZone(!showUploadZone)}
            >
              <Upload className="size-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Upload Zone */}
        {showUploadZone && (
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <PickerUploadZone
              onClose={() => setShowUploadZone(false)}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {isPending && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}

          {!isPending && data && (
            <>
              {data.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.media.map((media) => (
                    <PickerMediaCard
                      key={media.id}
                      media={media}
                      selected={selectedItems.has(media.id)}
                      onToggleSelect={handleToggleSelect}
                      onCopyUrl={handleCopyUrl}
                    />
                  ))}
                </div>
              ) : (
                <PickerEmptyState onUpload={() => setShowUploadZone(true)} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center justify-between">
            {/* Selection Info */}
            <div className="text-sm text-muted-foreground">
              {selectedItems.size > 0 ? (
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {selectedItems.size}
                  </span>
                  {selectedItems.size === 1 ? "item" : "items"} selected
                </span>
              ) : (
                <span>No items selected</span>
              )}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-3" />
                </Button>
                <span className="px-2 text-xs text-muted-foreground">
                  {currentPage} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                >
                  <ChevronRight className="size-3" />
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedItems.size === 0}
              >
                <Check className="size-4 mr-2" />
                Select{selectedItems.size > 0 ? ` (${selectedItems.size})` : ""}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function PickerMediaCard({
  media,
  selected,
  onToggleSelect,
  onCopyUrl,
}: {
  media: MediaWithUser;
  selected: boolean;
  onToggleSelect: (media: MediaWithUser) => void;
  onCopyUrl: (url: string) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const isImage = media.type === "image";

  return (
    <div
      onClick={() => onToggleSelect(media)}
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer",
        "border-2 transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
      )}
    >
      {/* Selection Indicator */}
      <div
        className={cn(
          "absolute left-2 top-2 z-10 flex items-center justify-center size-5 rounded-full transition-all duration-200",
          selected
            ? "bg-primary text-white scale-100"
            : "bg-black/30 backdrop-blur-sm text-white/70 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100",
        )}
      >
        {selected && <Check className="size-3" />}
      </div>

      {/* Copy URL Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopyUrl(media.url);
        }}
        className={cn(
          "absolute right-2 top-2 z-10 flex items-center justify-center size-6 rounded-md",
          "bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50",
          "transition-all duration-200 opacity-0 group-hover:opacity-100",
        )}
        title="Copy URL"
      >
        <Copy className="size-3" />
      </button>

      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        {isImage && !imageError ? (
          <Image
            src={media.url}
            alt={media.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <FileText
              className="size-10 text-muted-foreground/40"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h4
          className="text-xs font-medium text-foreground truncate"
          title={media.name}
        >
          {media.name}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="uppercase tracking-wide font-medium">
            {media.type}
          </span>
          <span>{formatFileSize(media.size)}</span>
        </div>
      </div>
    </div>
  );
}

function PickerUploadZone({
  onClose,
  onUploadComplete,
}: {
  onClose: () => void;
  onUploadComplete: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    { name: string; progress: number }[]
  >([]);
  const { toast } = useToast();

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setIsUploading(true);
      setUploadProgress(files.map((f) => ({ name: f.name, progress: 0 })));

      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const formData = new FormData();
          formData.append("file", file);

          setUploadProgress((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, progress: 50 } : p)),
          );

          const response = await fetch("/api/admin/media/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            successCount++;
            setUploadProgress((prev) =>
              prev.map((p, idx) => (idx === i ? { ...p, progress: 100 } : p)),
            );
          }
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }

      setIsUploading(false);

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} file${successCount > 1 ? "s" : ""} uploaded`,
          variant: "success",
        });
        onUploadComplete();
      }
    },
    [toast, onUploadComplete],
  );

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
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      await uploadFiles(droppedFiles);
    },
    [uploadFiles],
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
      )}
    >
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Uploading...</p>
          <div className="w-full max-w-xs space-y-2">
            {uploadProgress.map((p, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs text-muted-foreground truncate">
                  {p.name}
                </p>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10">
            <Upload className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop files here" : "Drop files or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images, PDFs, and documents up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function PickerEmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-muted mb-4">
        <ImageIcon
          className="size-8 text-muted-foreground/40"
          strokeWidth={1.5}
        />
      </div>
      <h4 className="text-base font-semibold text-foreground mb-1">
        No media found
      </h4>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        Upload some files to get started
      </p>
      <Button variant="outline" size="sm" onClick={onUpload}>
        <Upload className="size-4 mr-2" />
        Upload Files
      </Button>
    </div>
  );
}

export default MediaPicker;
