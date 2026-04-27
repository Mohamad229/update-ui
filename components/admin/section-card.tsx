"use client";

import { Trash2, Pencil, Copy, GripVertical } from "lucide-react";
import { SectionType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ============================================================================
// Types
// ============================================================================

interface SectionCardProps {
  id: string;
  type: SectionType;
  order: number;
  title?: string;
  preview?: string;
  isDragging?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
}

// ============================================================================
// Section Type Metadata
// ============================================================================

const SECTION_TYPE_INFO: Record<
  SectionType,
  { icon: string; label: string; color: string }
> = {
  HERO: {
    icon: "🎨",
    label: "Hero Banner",
    color: "bg-blue-100 text-blue-700",
  },
  TEXT: {
    icon: "📝",
    label: "Text Content",
    color: "bg-gray-100 text-gray-700",
  },
  CARDS: {
    icon: "🗂️",
    label: "Cards Grid",
    color: "bg-purple-100 text-purple-700",
  },
  STATS: {
    icon: "📊",
    label: "Statistics",
    color: "bg-green-100 text-green-700",
  },
  FEATURES: {
    icon: "⭐",
    label: "Features",
    color: "bg-yellow-100 text-yellow-700",
  },
  CTA: {
    icon: "🎯",
    label: "Call to Action",
    color: "bg-red-100 text-red-700",
  },
  IMAGE_TEXT: {
    icon: "🖼️",
    label: "Image + Text",
    color: "bg-teal-100 text-teal-700",
  },
};

// ============================================================================
// Component
// ============================================================================

export function SectionCard({
  id,
  type,
  order,
  title,
  preview,
  isDragging = false,
  onEdit,
  onDuplicate,
  onDelete,
  draggableProps,
  dragHandleProps,
}: SectionCardProps) {
  const typeInfo = SECTION_TYPE_INFO[type];
  const displayTitle = title || `Untitled ${typeInfo?.label || type}`;
  const displayPreview = preview?.slice(0, 100) || "No content";

  return (
    <div
      {...draggableProps}
      className={`border rounded-lg bg-white transition-all ${
        isDragging ? "opacity-50 scale-95 shadow-lg" : "hover:shadow-md"
      }`}
    >
      <div className="p-4 flex gap-4">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="flex items-start cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5 flex-shrink-0 mt-0.5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <Badge variant="outline" className={typeInfo?.color}>
              <span className="mr-1">{typeInfo?.icon}</span>
              {typeInfo?.label}
            </Badge>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              #{order + 1}
            </span>
          </div>

          <h4 className="font-semibold text-sm text-foreground mb-1 truncate">
            {displayTitle}
          </h4>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {displayPreview}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-start gap-2 flex-shrink-0">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onEdit}
            title="Edit section"
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onDuplicate}
            title="Duplicate section"
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onDelete}
            title="Delete section"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
