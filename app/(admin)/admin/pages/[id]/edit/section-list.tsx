"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionType } from "@prisma/client";

import { SectionCard } from "@/components/admin/section-card";
import { reorderSections, deleteSection } from "@/lib/actions/pages";
import { useToast } from "@/components/ui/toast";

// ============================================================================
// Types
// ============================================================================

interface Section {
  id: string;
  type: SectionType;
  order: number;
  data: Record<string, any>;
  translations: Array<{
    locale: string;
    content: Record<string, any>;
  }>;
}

interface SectionListProps {
  pageId: string;
  sections: Section[];
  onRefresh: () => void;
  onEditSection: (section: Section) => void;
  onDuplicateSection: (section: Section) => void;
  isLoadingAddSection?: boolean;
}

// ============================================================================
// Sortable Item Component
// ============================================================================

function SortableSectionItem({
  section,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  section: Section;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Extract preview text from content
  const getPreviewText = (): string => {
    const enTranslation = section.translations.find((t) => t.locale === "en");
    const content = enTranslation?.content || {};

    if (typeof content === "object") {
      // Try to find text content in various properties
      const text =
        (content as any)?.title ||
        (content as any)?.description ||
        (content as any)?.text ||
        (content as any)?.content ||
        "";
      return String(text);
    }
    return "";
  };

  // Extract title from content
  const getTitle = (): string => {
    const enTranslation = section.translations.find((t) => t.locale === "en");
    const content = enTranslation?.content || {};

    if (typeof content === "object") {
      return (content as any)?.title || "";
    }
    return "";
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <SectionCard
        id={section.id}
        type={section.type}
        order={section.order}
        title={getTitle()}
        preview={getPreviewText()}
        isDragging={isDragging}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        draggableProps={{ className: "h-full" }}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
    </div>
  );
}

// ============================================================================
// Section List Component
// ============================================================================

export function SectionList({
  pageId,
  sections: initialSections,
  onRefresh,
  onEditSection,
  onDuplicateSection,
  isLoadingAddSection = false,
}: SectionListProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      // Find indices
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Optimistic update
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      try {
        setIsReordering(true);

        // Call server action with updated order
        const result = await reorderSections({
          pageId,
          sections: newSections.map((s, idx) => ({
            id: s.id,
            order: idx,
          })),
        });

        if (result.error) {
          // Revert on error
          setSections(sections);
          toast({
            title: "Error",
            description: result.error || "Failed to reorder sections",
            variant: "error",
          });
        } else {
          toast({
            title: "Success",
            description: "Sections reordered successfully",
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Failed to reorder sections:", error);
        // Revert on error
        setSections(sections);
        toast({
          title: "Error",
          description: "Failed to reorder sections",
          variant: "error",
        });
      } finally {
        setIsReordering(false);
      }
    },
    [sections, pageId, toast],
  );

  // Handle delete
  const handleDeleteSection = useCallback(
    (section: Section) => {
      // Confirmation check (can be replaced with dialog)
      if (
        !window.confirm(
          `Delete section "${section.type}"? This cannot be undone.`,
        )
      ) {
        return;
      }

      (async () => {
        try {
          const result = await deleteSection(section.id);

          if (result.error) {
            toast({
              title: "Error",
              description: result.error || "Failed to delete section",
              variant: "error",
            });
          } else {
            toast({
              title: "Success",
              description: "Section deleted successfully",
              variant: "success",
            });
            // Remove from list
            setSections((prev) => prev.filter((s) => s.id !== section.id));
            onRefresh();
          }
        } catch (error) {
          console.error("Failed to delete section:", error);
          toast({
            title: "Error",
            description: "Failed to delete section",
            variant: "error",
          });
        }
      })();
    },
    [toast, onRefresh],
  );

  // If no sections, show empty state
  if (sections.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <p className="text-muted-foreground mb-2">No sections yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first section to get started
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1">
        {/* Section count header */}
        <div className="text-sm font-medium text-muted-foreground mb-4">
          {sections.length} section{sections.length !== 1 ? "s" : ""} on this
          page
        </div>

        {/* Sortable sections */}
        <SortableContext items={sections.map((s) => s.id)}>
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                onEdit={() => onEditSection(section)}
                onDuplicate={() => onDuplicateSection(section)}
                onDelete={() => handleDeleteSection(section)}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
}
