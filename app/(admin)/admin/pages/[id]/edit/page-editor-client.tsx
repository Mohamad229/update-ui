"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { SectionType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { SectionList } from "./section-list";
import { SectionTypeSelector } from "./section-type-selector";
import { SectionEditorModal } from "./section-editor-modal";
import { createSection, deletePage } from "@/lib/actions/pages";

import type { PageDetail } from "@/lib/actions/pages";

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

interface PageEditorClientProps {
  page: PageDetail;
  onUpdate?: () => void;
}

type TabType = "content" | "metadata" | "seo";

// ============================================================================
// Component
// ============================================================================

export function PageEditorClient({ page, onUpdate }: PageEditorClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [sections, setSections] = useState<Section[]>(page.sections as any);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle add section type selection
  const handleSelectSectionType = useCallback(
    async (type: SectionType) => {
      try {
        setIsAddingSection(true);

        const result = await createSection(page.id, {
          pageId: page.id,
          type,
          order: sections.length,
          title: `New ${type}`,
          content: { title: `New ${type}` },
        } as any);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error || "Failed to create section",
            variant: "error",
          });
        } else {
          const newSection = result.data as Section;
          setSections((prev) => [...prev, newSection]);
          setSelectedSection(newSection);
          setShowSectionEditor(true);

          toast({
            title: "Success",
            description: "Section created successfully",
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Failed to create section:", error);
        toast({
          title: "Error",
          description: "Failed to create section",
          variant: "error",
        });
      } finally {
        setIsAddingSection(false);
      }
    },
    [page.id, sections.length, toast],
  );

  // Handle edit section
  const handleEditSection = useCallback((section: Section) => {
    setSelectedSection(section);
    setShowSectionEditor(true);
  }, []);

  // Handle duplicate section
  const handleDuplicateSection = useCallback(
    async (sectionToDuplicate: Section) => {
      try {
        setIsAddingSection(true);

        const result = await createSection(page.id, {
          pageId: page.id,
          type: sectionToDuplicate.type,
          order: sections.length,
          title: `${sectionToDuplicate.translations[0]?.content?.title || "Section"} (Copy)`,
          content: sectionToDuplicate.translations[0]?.content || {},
        } as any);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error || "Failed to duplicate section",
            variant: "error",
          });
        } else {
          const newSection = result.data as Section;
          setSections((prev) => [...prev, newSection]);

          toast({
            title: "Success",
            description: "Section duplicated successfully",
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Failed to duplicate section:", error);
        toast({
          title: "Error",
          description: "Failed to duplicate section",
          variant: "error",
        });
      } finally {
        setIsAddingSection(false);
      }
    },
    [page.id, sections.length, toast],
  );

  // Handle refresh sections (after deletion)
  const handleRefreshSections = useCallback(() => {
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  // Handle delete page
  const handleDeletePage = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePage(page.id);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Success",
          description: "Page deleted successfully",
          variant: "success",
        });
        router.push("/admin/pages");
      }
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get page title
  const pageTitle =
    page.translations.find((t) => t.locale === "en")?.title || "Untitled Page";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Pages
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Manage page content and sections
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Page
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Badge variant={page.isPublished ? "success" : "outline"}>
          {page.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-input">
        <div className="flex gap-1">
          {(["content", "metadata", "seo"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-background rounded-lg p-6">
        {activeTab === "content" && (
          <div className="space-y-4">
            {/* Add Section Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Page Sections</h2>
              <Button
                onClick={() => setShowTypeSelector(true)}
                disabled={isAddingSection}
                className="gap-2"
              >
                {isAddingSection && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>

            {/* Sections List */}
            <div ref={scrollContainerRef} className="space-y-4">
              <SectionList
                pageId={page.id}
                sections={sections}
                onRefresh={handleRefreshSections}
                onEditSection={handleEditSection}
                onDuplicateSection={handleDuplicateSection}
                isLoadingAddSection={isAddingSection}
              />
            </div>
          </div>
        )}

        {activeTab === "metadata" && (
          <div className="space-y-4 text-center py-8">
            <p className="text-muted-foreground">Metadata editor coming soon</p>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-4 text-center py-8">
            <p className="text-muted-foreground">SEO editor coming soon</p>
          </div>
        )}
      </div>

      {/* Section Type Selector Modal */}
      <SectionTypeSelector
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelectType={handleSelectSectionType}
        isLoading={isAddingSection}
      />

      {/* Section Editor Modal */}
      <SectionEditorModal
        open={showSectionEditor}
        onOpenChange={setShowSectionEditor}
        section={selectedSection}
        onSuccess={(updated) => {
          // Update section in list
          setSections((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s)),
          );
        }}
      />

      {/* Delete Page Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              type="button"
              onClick={handleDeletePage}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
