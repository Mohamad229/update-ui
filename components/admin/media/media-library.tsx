"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Grid3x3,
  List,
  Search,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";

import { Button, Input, Select, SelectOption } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { MediaCard } from "./media-card";
import { UploadDialog } from "./upload-dialog";

import type { MediaWithUser, GetMediaListParams } from "@/lib/actions/media";
import { getMediaList, deleteMedia } from "@/lib/actions/media";

// Local type for the deprecated getMediaList API response
interface LegacyPaginatedMedia {
  items: MediaWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface MediaLibraryProps {
  initialData: LegacyPaginatedMedia;
}

type ViewMode = "grid" | "list";

export function MediaLibrary({ initialData }: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    GetMediaListParams["type"] | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<LegacyPaginatedMedia>(initialData);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedia({
        search: searchQuery,
        type: typeFilter === "all" ? undefined : typeFilter,
        page: 1,
      });
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter]);

  const loadMedia = useCallback(
    async (params: GetMediaListParams = {}) => {
      setIsLoading(true);
      try {
        const result = await getMediaList({
          page: currentPage,
          pageSize: 12,
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
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, toast],
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadMedia({
      search: searchQuery,
      type: typeFilter === "all" ? undefined : typeFilter,
      page: newPage,
    });
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
    if (selectedItems.size === data.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.items.map((item) => item.id)));
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
      loadMedia({
        search: searchQuery,
        type: typeFilter === "all" ? undefined : typeFilter,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete media",
        variant: "error",
      });
    }
  };

  const handleView = (media: MediaWithUser) => {
    window.open(media.url, "_blank");
  };

  const handleEdit = (media: MediaWithUser) => {
    // TODO: Implement edit dialog
    toast({
      title: "Edit",
      description: "Edit functionality coming soon",
      variant: "default",
    });
  };

  const handleUploadComplete = () => {
    loadMedia({
      search: searchQuery,
      type: typeFilter === "all" ? undefined : typeFilter,
    });
    setUploadDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3 flex-col sm:flex-row">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<Search className="size-4" />}
            />
          </div>

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="w-full sm:w-40"
          >
            <SelectOption value="all">All Types</SelectOption>
            <SelectOption value="image">Images</SelectOption>
            <SelectOption value="document">Documents</SelectOption>
            <SelectOption value="video">Videos</SelectOption>
          </Select>
        </div>

        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border bg-background p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center justify-center size-8 rounded-md transition-all duration-150",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              aria-label="Grid view"
            >
              <Grid3x3 className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center justify-center size-8 rounded-md transition-all duration-150",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>

          {/* Upload Button */}
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="size-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Selection Info */}
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-foreground">
            {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {/* Media Grid */}
      {!isLoading && viewMode === "grid" && (
        <>
          {data.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.items.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  selected={selectedItems.has(media.id)}
                  onSelect={handleSelect}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState onUpload={() => setUploadDialogOpen(true)} />
          )}
        </>
      )}

      {/* Media List */}
      {!isLoading && viewMode === "list" && (
        <>
          {data.items.length > 0 ? (
            <MediaListView
              items={data.items}
              selectedItems={selectedItems}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState onUpload={() => setUploadDialogOpen(true)} />
          )}
        </>
      )}

      {/* Pagination */}
      {!isLoading && data.items.length > 0 && data.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  onUpload: () => void;
}

function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex items-center justify-center size-20 rounded-full bg-muted mb-6">
        <ImageIcon
          className="size-10 text-muted-foreground"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
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
    </div>
  );
}

// List View Component
interface MediaListViewProps {
  items: MediaWithUser[];
  selectedItems: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: () => void;
  onView: (media: MediaWithUser) => void;
  onEdit: (media: MediaWithUser) => void;
  onDelete: (media: MediaWithUser) => void;
}

function MediaListView({
  items,
  selectedItems,
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
}: MediaListViewProps) {
  const allSelected = selectedItems.size === items.length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="w-12 p-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="size-4 rounded cursor-pointer"
                aria-label="Select all"
              />
            </th>
            <th className="text-left p-4 text-sm font-medium text-foreground">
              Name
            </th>
            <th className="text-left p-4 text-sm font-medium text-foreground">
              Type
            </th>
            <th className="text-left p-4 text-sm font-medium text-foreground">
              Size
            </th>
            <th className="text-left p-4 text-sm font-medium text-foreground">
              Uploaded
            </th>
            <th className="w-32 p-4 text-sm font-medium text-foreground">
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
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              isEven={index % 2 === 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface MediaListRowProps {
  media: MediaWithUser;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onView: (media: MediaWithUser) => void;
  onEdit: (media: MediaWithUser) => void;
  onDelete: (media: MediaWithUser) => void;
  isEven: boolean;
}

function MediaListRow({
  media,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  isEven,
}: MediaListRowProps) {
  const getTypeIcon = () => {
    switch (media.type) {
      case "image":
        return <ImageIcon className="size-4 text-primary" />;
      case "video":
        return <Video className="size-4 text-primary" />;
      default:
        return <FileText className="size-4 text-primary" />;
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0 transition-colors duration-150",
        isEven ? "bg-background" : "bg-muted/20",
        "hover:bg-muted/40",
        selected && "bg-primary/5",
      )}
    >
      <td className="p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(media.id, e.target.checked)}
          className="size-4 rounded cursor-pointer"
          aria-label={`Select ${media.name}`}
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <span className="text-sm font-medium text-foreground truncate max-w-xs">
            {media.name}
          </span>
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm text-muted-foreground uppercase tracking-wide">
          {media.type}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-muted-foreground">
          {(media.size / 1024).toFixed(1)} KB
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-muted-foreground">
          {new Date(media.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(media)}
            aria-label="View"
          >
            <Upload className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(media)}
            aria-label="Edit"
          >
            <FileText className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(media)}
            aria-label="Delete"
          >
            <ImageIcon className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show max 7 page numbers with ellipsis
  const getVisiblePages = () => {
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

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
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
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
