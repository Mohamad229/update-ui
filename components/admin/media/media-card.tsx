"use client";

import { useState } from "react";
import { FileText, Video, Eye, Edit, Trash2, ImageIcon } from "lucide-react";

import { Card } from "@/components/ui";
import { cn, formatFileSize, formatDate } from "@/lib/utils";

import type { MediaWithUser } from "@/lib/actions/media";

interface MediaCardProps {
  media: MediaWithUser;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onView?: (media: MediaWithUser) => void;
  onEdit?: (media: MediaWithUser) => void;
  onDelete?: (media: MediaWithUser) => void;
}

export function MediaCard({
  media,
  selected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);

  const isImage = media.type === "image";
  const isVideo = media.type === "video";
  const isDocument = media.type === "document";

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(media.id, e.target.checked);
  };

  return (
    <Card
      variant="elevated"
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        "hover:scale-[1.02]",
        selected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute left-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckboxChange}
          className={cn(
            "size-5 rounded-md border-2 border-white/80 bg-black/20 backdrop-blur-sm",
            "cursor-pointer transition-all duration-150",
            "checked:bg-primary checked:border-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            selected && "opacity-100",
          )}
          aria-label={`Select ${media.name}`}
        />
      </div>

      {/* Thumbnail/Preview */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        {isImage && !imageError ? (
          <img
            src={media.url}
            alt={media.name}
            onError={() => setImageError(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            {isVideo ? (
              <Video
                className="size-16 text-muted-foreground/40"
                strokeWidth={1.5}
              />
            ) : isDocument ? (
              <FileText
                className="size-16 text-muted-foreground/40"
                strokeWidth={1.5}
              />
            ) : (
              <ImageIcon
                className="size-16 text-muted-foreground/40"
                strokeWidth={1.5}
              />
            )}
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          {onView && (
            <button
              onClick={() => onView(media)}
              className={cn(
                "flex items-center justify-center size-8 rounded-lg",
                "bg-white/90 backdrop-blur-sm text-foreground",
                "hover:bg-white transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-primary",
              )}
              aria-label="View"
            >
              <Eye className="size-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(media)}
              className={cn(
                "flex items-center justify-center size-8 rounded-lg",
                "bg-white/90 backdrop-blur-sm text-foreground",
                "hover:bg-white transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-primary",
              )}
              aria-label="Edit"
            >
              <Edit className="size-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(media)}
              className={cn(
                "flex items-center justify-center size-8 rounded-lg",
                "bg-destructive/90 backdrop-blur-sm text-white",
                "hover:bg-destructive transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-destructive",
              )}
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-2">
        <h3
          className="font-medium text-sm text-foreground truncate"
          title={media.name}
        >
          {media.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-wide font-medium">
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
