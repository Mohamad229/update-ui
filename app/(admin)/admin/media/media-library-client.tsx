"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import {
  Grid3x3,
  List,
  Search,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  Eye,
  Copy,
  Trash2,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  HardDrive,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/components/ui/toast";
import {
  cn,
  formatFileSize,
  formatDate,
  formatDateTime,
  copyToClipboard,
} from "@/lib/utils";

import type {
  MediaWithUser,
  MediaType,
  GetMediaOptions,
} from "@/lib/actions/media";
import { getMedia, deleteMedia } from "@/lib/actions/media";

// ============================================================================
// Types
// ============================================================================

type ViewMode = "grid" | "list";
type FilterType = "all" | MediaType;

// Local type for the client component
interface ClientPaginatedMedia {
  media: MediaWithUser[];
  total: number;
  page: number;
  totalPages: number;
}

interface MediaLibraryClientProps {
  initialData: ClientPaginatedMedia;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE_OPTIONS = [12, 24, 48];

// ============================================================================
// Main Component
// ============================================================================

export function MediaLibraryClient({ initialData }: MediaLibraryClientProps) {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(initialData.page);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<ClientPaginatedMedia>(initialData);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewMedia, setPreviewMedia] = useState<MediaWithUser | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Load media function
  const loadMedia = useCallback(
    async (params: GetMediaOptions = {}) => {
      startTransition(async () => {
        const result = await getMedia({
          page: params.page ?? currentPage,
          limit: params.limit ?? pageSize,
          search: params.search ?? searchQuery,
          type: params.type ?? (typeFilter === "all" ? undefined : typeFilter),
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
    [currentPage, pageSize, searchQuery, typeFilter, toast],
  );

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "" || typeFilter !== "all") {
        loadMedia({
          search: searchQuery,
          type: typeFilter === "all" ? undefined : typeFilter,
          page: 1,
        });
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter, loadMedia]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadMedia({ page: newPage });
    setSelectedItems(new Set());
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    loadMedia({ page: 1, limit: newSize });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setCurrentPage(1);
    loadMedia({ search: "", type: undefined, page: 1 });
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.media.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.media.map((item) => item.id)));
    }
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

  const handleDelete = async (media: MediaWithUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${media.name}"?`,
    );
    if (!confirmed) return;

    const result = await deleteMedia(media.id);
    if (result.success) {
      toast({
        title: "Media deleted",
        description: `${media.name} has been deleted`,
        variant: "success",
      });
      loadMedia();
      setPreviewMedia(null);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete media",
        variant: "error",
      });
    }
  };

  const handleDownload = (media: MediaWithUser) => {
    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadComplete = () => {
    loadMedia();
    setShowUploadZone(false);
  };

  const hasFilters = searchQuery !== "" || typeFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Media Library"
        description="Upload and manage images, documents, and videos"
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

            {/* Upload Button */}
            <Button onClick={() => setShowUploadZone(true)} className="gap-2">
              <Upload className="size-4" />
              Upload
            </Button>
          </div>
        }
      />

      {/* Search & Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        hasFilters={hasFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Upload Zone */}
      {showUploadZone && (
        <UploadZone
          onClose={() => setShowUploadZone(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Selection Bar */}
      {selectedItems.size > 0 && (
        <SelectionBar
          count={selectedItems.size}
          onClear={() => setSelectedItems(new Set())}
          onSelectAll={handleSelectAll}
          allSelected={selectedItems.size === data.media.length}
        />
      )}

      {/* Loading State */}
      {isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {/* Media Content */}
      {!isPending && (
        <>
          {data.media.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <MediaGrid
                  items={data.media}
                  selectedItems={selectedItems}
                  onSelect={handleSelect}
                  onPreview={setPreviewMedia}
                  onCopyUrl={handleCopyUrl}
                  onDelete={handleDelete}
                />
              ) : (
                <MediaList
                  items={data.media}
                  selectedItems={selectedItems}
                  onSelect={handleSelect}
                  onSelectAll={handleSelectAll}
                  onPreview={setPreviewMedia}
                  onCopyUrl={handleCopyUrl}
                  onDelete={handleDelete}
                />
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                pageSize={pageSize}
                total={data.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          ) : (
            <EmptyState
              hasFilters={hasFilters}
              onUpload={() => setShowUploadZone(true)}
              onClearFilters={handleClearFilters}
            />
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <MediaPreviewModal
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
          onCopyUrl={handleCopyUrl}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function ViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border bg-background p-1 shadow-sm">
      <button
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "flex items-center justify-center size-8 rounded-md transition-all duration-200",
          viewMode === "grid"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
        aria-label="Grid view"
      >
        <Grid3x3 className="size-4" />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={cn(
          "flex items-center justify-center size-8 rounded-md transition-all duration-200",
          viewMode === "list"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
        aria-label="List view"
      >
        <List className="size-4" />
      </button>
    </div>
  );
}

function SearchFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  hasFilters,
  onClearFilters,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: FilterType;
  onTypeFilterChange: (value: FilterType) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <Input
          id="media-search"
          name="media-search"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          prefixIcon={<Search className="size-4" />}
          suffixIcon={
            searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )
          }
        />
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          <span className="hidden sm:inline">Type:</span>
        </div>
        <div className="flex rounded-lg border border-border bg-background p-1">
          {(["all", "image", "document"] as const).map((type) => (
            <button
              key={type}
              onClick={() => onTypeFilterChange(type)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
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

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="size-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function SelectionBar({
  count,
  onClear,
  onSelectAll,
  allSelected,
}: {
  count: number;
  onClear: () => void;
  onSelectAll: () => void;
  allSelected: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" />
        </div>
        <span className="font-medium text-foreground">
          {count} item{count > 1 ? "s" : ""} selected
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear Selection
        </Button>
      </div>
    </div>
  );
}

function UploadZone({
  onClose,
  onUploadComplete,
}: {
  onClose: () => void;
  onUploadComplete: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(2, 9),
      status: "pending" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
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

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    for (const uploadFile of pendingFiles) {
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

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "success", progress: 100 }
                : f,
            ),
          );
        } else {
          const error = await response.text();
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: "error", error } : f,
            ),
          );
        }
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: "Upload failed" }
              : f,
          ),
        );
      }
    }

    setIsUploading(false);

    const successCount = files.filter((f) => f.status === "success").length;
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`,
        variant: "success",
      });
      onUploadComplete();
    }
  };

  return (
    <Card variant="bordered" className="relative overflow-hidden">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 p-2 rounded-lg bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <X className="size-4" />
      </button>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl m-4 p-12 transition-all duration-300 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5",
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
          <div
            className={cn(
              "flex items-center justify-center size-20 rounded-2xl",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
              "border border-primary/20",
              "transition-transform duration-300",
              isDragging && "scale-110 rotate-3",
            )}
          >
            <Upload className="size-10 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {isDragging ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or <span className="text-primary font-medium">browse</span> from
              your computer
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="size-3" />
              Images
            </span>
            <span className="flex items-center gap-1">
              <FileText className="size-3" />
              Documents
            </span>
            <span>Max 10MB per file</span>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Files ({files.length})
            </h4>
            <Button
              onClick={uploadAllFiles}
              disabled={
                isUploading || files.every((f) => f.status !== "pending")
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload All
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((uploadFile) => (
              <UploadFileItem
                key={uploadFile.id}
                file={uploadFile}
                onRemove={removeFile}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

function UploadFileItem({
  file,
  onRemove,
}: {
  file: UploadFile;
  onRemove: (id: string) => void;
}) {
  const isImage = file.file.type.startsWith("image/");

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
        file.status === "success" && "bg-secondary/5 border-secondary/30",
        file.status === "error" && "bg-destructive/5 border-destructive/30",
        file.status === "pending" && "bg-card border-border",
        file.status === "uploading" && "bg-primary/5 border-primary/30",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center size-10 rounded-lg",
          "bg-gradient-to-br from-muted to-muted/50",
        )}
      >
        {isImage ? (
          <ImageIcon className="size-5 text-primary" />
        ) : (
          <FileText className="size-5 text-primary" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {file.file.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.file.size)}</span>
          {file.status === "success" && (
            <span className="text-secondary flex items-center gap-1">
              <Check className="size-3" />
              Uploaded
            </span>
          )}
          {file.status === "error" && (
            <span className="text-destructive">{file.error}</span>
          )}
        </div>

        {/* Progress Bar */}
        {file.status === "uploading" && (
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Remove Button */}
      {(file.status === "pending" || file.status === "error") && (
        <button
          onClick={() => onRemove(file.id)}
          className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function MediaGrid({
  items,
  selectedItems,
  onSelect,
  onPreview,
  onCopyUrl,
  onDelete,
}: {
  items: MediaWithUser[];
  selectedItems: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onPreview: (media: MediaWithUser) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (media: MediaWithUser) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((media) => (
        <MediaGridCard
          key={media.id}
          media={media}
          selected={selectedItems.has(media.id)}
          onSelect={onSelect}
          onPreview={onPreview}
          onCopyUrl={onCopyUrl}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function MediaGridCard({
  media,
  selected,
  onSelect,
  onPreview,
  onCopyUrl,
  onDelete,
}: {
  media: MediaWithUser;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onPreview: (media: MediaWithUser) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (media: MediaWithUser) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const isImage = media.type === "image";
  const isVideo = media.type === "video";

  return (
    <Card
      variant="elevated"
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02]",
        selected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {/* Selection Checkbox */}
      <div
        className={cn(
          "absolute left-3 top-3 z-10 transition-opacity duration-200",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <label className="relative flex items-center justify-center size-6 cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(media.id, e.target.checked)}
            className="peer sr-only"
          />
          <div
            className={cn(
              "size-5 rounded-md border-2 transition-all duration-200",
              "peer-checked:bg-primary peer-checked:border-primary",
              "border-white/80 bg-black/20 backdrop-blur-sm",
            )}
          />
          {selected && <Check className="absolute size-3 text-white" />}
        </label>
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        {isImage && !imageError ? (
          <Image
            src={media.url}
            alt={media.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            {isVideo ? (
              <Video
                className="size-16 text-muted-foreground/40"
                strokeWidth={1.5}
              />
            ) : (
              <FileText
                className="size-16 text-muted-foreground/40"
                strokeWidth={1.5}
              />
            )}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={() => onPreview(media)}
            className="flex items-center justify-center size-8 rounded-lg bg-white/90 backdrop-blur-sm text-foreground hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Preview"
          >
            <Eye className="size-4" />
          </button>
          <button
            onClick={() => onCopyUrl(media.url)}
            className="flex items-center justify-center size-8 rounded-lg bg-white/90 backdrop-blur-sm text-foreground hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Copy URL"
          >
            <Copy className="size-4" />
          </button>
          <button
            onClick={() => onDelete(media)}
            className="flex items-center justify-center size-8 rounded-lg bg-destructive/90 backdrop-blur-sm text-white hover:bg-destructive transition-all focus:outline-none focus:ring-2 focus:ring-destructive"
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3
          className="font-medium text-sm text-foreground truncate"
          title={media.name}
        >
          {media.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-wide font-medium text-primary/80">
            {media.type}
          </span>
          <span>{formatFileSize(media.size)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(media.createdAt)}
        </div>
      </div>
    </Card>
  );
}

function MediaList({
  items,
  selectedItems,
  onSelect,
  onSelectAll,
  onPreview,
  onCopyUrl,
  onDelete,
}: {
  items: MediaWithUser[];
  selectedItems: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: () => void;
  onPreview: (media: MediaWithUser) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (media: MediaWithUser) => void;
}) {
  const allSelected = selectedItems.size === items.length && items.length > 0;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="w-12 p-4">
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "size-4 rounded border transition-all",
                    "peer-checked:bg-primary peer-checked:border-primary",
                    "border-border",
                  )}
                />
                {allSelected && (
                  <Check className="absolute size-2.5 text-white" />
                )}
              </label>
            </th>
            <th className="text-left p-4 text-xs font-semibold text-foreground uppercase tracking-wide">
              Preview
            </th>
            <th className="text-left p-4 text-xs font-semibold text-foreground uppercase tracking-wide">
              Name
            </th>
            <th className="text-left p-4 text-xs font-semibold text-foreground uppercase tracking-wide">
              Type
            </th>
            <th className="text-left p-4 text-xs font-semibold text-foreground uppercase tracking-wide">
              Size
            </th>
            <th className="text-left p-4 text-xs font-semibold text-foreground uppercase tracking-wide">
              Date
            </th>
            <th className="w-40 p-4 text-xs font-semibold text-foreground uppercase tracking-wide text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((media, index) => (
            <MediaListRow
              key={media.id}
              media={media}
              selected={selectedItems.has(media.id)}
              onSelect={onSelect}
              onPreview={onPreview}
              onCopyUrl={onCopyUrl}
              onDelete={onDelete}
              isEven={index % 2 === 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MediaListRow({
  media,
  selected,
  onSelect,
  onPreview,
  onCopyUrl,
  onDelete,
  isEven,
}: {
  media: MediaWithUser;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onPreview: (media: MediaWithUser) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (media: MediaWithUser) => void;
  isEven: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const isImage = media.type === "image";
  const isVideo = media.type === "video";

  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0 transition-colors duration-150",
        isEven ? "bg-background" : "bg-muted/10",
        "hover:bg-muted/30",
        selected && "bg-primary/5",
      )}
    >
      <td className="p-4">
        <label className="relative flex items-center justify-center cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(media.id, e.target.checked)}
            className="peer sr-only"
          />
          <div
            className={cn(
              "size-4 rounded border transition-all",
              "peer-checked:bg-primary peer-checked:border-primary",
              "border-border",
            )}
          />
          {selected && <Check className="absolute size-2.5 text-white" />}
        </label>
      </td>
      <td className="p-4">
        <div className="relative size-12 rounded-lg overflow-hidden bg-muted">
          {isImage && !imageError ? (
            <Image
              src={media.url}
              alt={media.name}
              fill
              sizes="48px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center size-full">
              {isVideo ? (
                <Video className="size-5 text-muted-foreground" />
              ) : (
                <FileText className="size-5 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm font-medium text-foreground truncate max-w-xs block">
          {media.name}
        </span>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
          {media.type}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-muted-foreground">
          {formatFileSize(media.size)}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-muted-foreground">
          {formatDate(media.createdAt)}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onPreview(media)}
            aria-label="Preview"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onCopyUrl(media.url)}
            aria-label="Copy URL"
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={() => onDelete(media)}
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function Pagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const getVisiblePages = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (totalPages <= 7) return pages;

    if (currentPage <= 4) {
      return [...pages.slice(0, 5), -1, totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, -1, ...pages.slice(totalPages - 5)];
    }

    return [
      1,
      -1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      -1,
      totalPages,
    ];
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      {/* Items Info & Page Size */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing{" "}
          <span className="font-medium text-foreground">{startItem}</span> to{" "}
          <span className="font-medium text-foreground">{endItem}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> items
        </span>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {getVisiblePages().map((page, index) => {
          if (page === -1) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onUpload,
  onClearFilters,
}: {
  hasFilters: boolean;
  onUpload: () => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-2xl" />
        <div className="relative flex items-center justify-center size-24 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border">
          <ImageIcon
            className="size-12 text-muted-foreground/40"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {hasFilters ? (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Try adjusting your search or filter to find what you&apos;re looking
            for
          </p>
          <Button variant="outline" onClick={onClearFilters}>
            <X className="size-4 mr-2" />
            Clear Filters
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No media files yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Upload images, documents, or videos to get started with your media
            library
          </p>
          <Button onClick={onUpload}>
            <Upload className="size-4 mr-2" />
            Upload Media
          </Button>
        </>
      )}
    </div>
  );
}

function MediaPreviewModal({
  media,
  onClose,
  onCopyUrl,
  onDownload,
  onDelete,
}: {
  media: MediaWithUser;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  onDownload: (media: MediaWithUser) => void;
  onDelete: (media: MediaWithUser) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isImage = media.type === "image";
  const isVideo = media.type === "video";

  const handleCopyUrl = async () => {
    await onCopyUrl(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    onDelete(media);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Preview Area */}
        <div className="relative flex-1 min-h-[300px] bg-gradient-to-br from-muted/50 via-muted to-muted/50 flex items-center justify-center overflow-hidden">
          {isImage ? (
            <Image
              src={media.url}
              alt={media.name}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-contain"
            />
          ) : isVideo ? (
            <video src={media.url} controls className="max-w-full max-h-full" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <FileText
                className="size-24 text-muted-foreground/40"
                strokeWidth={1}
              />
              <span className="text-sm text-muted-foreground">
                Preview not available
              </span>
            </div>
          )}

          {/* Open in New Tab */}
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background transition-all"
          >
            <Maximize2 className="size-4" />
          </a>
        </div>

        {/* Info Panel */}
        <div className="p-6 border-t border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            {/* Metadata */}
            <div className="space-y-4 flex-1">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {media.name}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
                  {media.type}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="size-4" />
                  <span>{formatFileSize(media.size)}</span>
                </div>
                {isImage && media.width && media.height && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Maximize2 className="size-4" />
                    <span>
                      {media.width} x {media.height}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>{formatDateTime(media.createdAt)}</span>
                </div>
              </div>

              {/* URL */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                  {media.url}
                </span>
                <Button variant="ghost" size="icon-sm" onClick={handleCopyUrl}>
                  {copied ? (
                    <Check className="size-4 text-secondary" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => onDownload(media)}
                className="flex-1"
              >
                <Download className="size-4 mr-2" />
                Download
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
