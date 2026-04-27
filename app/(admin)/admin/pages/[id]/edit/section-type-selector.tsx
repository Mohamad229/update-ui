"use client";

import { SectionType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============================================================================
// Types
// ============================================================================

interface SectionTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: SectionType) => void;
  isLoading?: boolean;
}

// ============================================================================
// Section Type Metadata
// ============================================================================

const SECTION_TYPES: Array<{
  type: SectionType;
  icon: string;
  label: string;
  description: string;
}> = [
  {
    type: "HERO",
    icon: "🎨",
    label: "Hero Banner",
    description: "Large banner with title and call-to-action",
  },
  {
    type: "TEXT",
    icon: "📝",
    label: "Text Content",
    description: "Rich text editor for paragraphs and content",
  },
  {
    type: "CARDS",
    icon: "🗂️",
    label: "Cards Grid",
    description: "Grid of cards with images and descriptions",
  },
  {
    type: "STATS",
    icon: "📊",
    label: "Statistics",
    description: "Display key statistics or metrics",
  },
  {
    type: "FEATURES",
    icon: "⭐",
    label: "Features",
    description: "Showcase product or service features",
  },
  {
    type: "CTA",
    icon: "🎯",
    label: "Call to Action",
    description: "Prominent action button with text",
  },
  {
    type: "IMAGE_TEXT",
    icon: "🖼️",
    label: "Image + Text",
    description: "Combine image with text content",
  },
];

// ============================================================================
// Component
// ============================================================================

export function SectionTypeSelector({
  open,
  onOpenChange,
  onSelectType,
  isLoading = false,
}: SectionTypeSelectorProps) {
  const handleSelectType = (type: SectionType) => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Select a section type to add to your page
          </DialogDescription>
        </DialogHeader>

        {/* Section Type Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-3">
          {SECTION_TYPES.map((section) => (
            <button
              key={section.type}
              onClick={() => handleSelectType(section.type)}
              disabled={isLoading}
              className="group relative rounded-lg border border-input bg-background p-4 text-left transition-all hover:border-primary hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <h3 className="font-semibold text-sm">{section.label}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {section.description}
              </p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
