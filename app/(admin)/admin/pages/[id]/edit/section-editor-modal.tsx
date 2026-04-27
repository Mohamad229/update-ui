"use client";

import { useState, lazy, Suspense } from "react";
import { SectionType } from "@prisma/client";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { LanguageTabs } from "@/components/admin/language-tabs";

import { updateSection } from "@/lib/actions/pages";

type Language = "en" | "ar";

// Lazy load section editors
const HeroSectionEditor = lazy(() =>
  import("@/app/(admin)/admin/pages/sections/hero-section-editor").then(
    (m) => ({
      default: m.HeroSectionEditor,
    }),
  ),
);
const TextSectionEditor = lazy(() =>
  import("@/app/(admin)/admin/pages/sections/text-section-editor").then(
    (m) => ({
      default: m.TextSectionEditor,
    }),
  ),
);
const CardsSectionEditor = lazy(() =>
  import("@/app/(admin)/admin/pages/sections/cards-section-editor").then(
    (m) => ({
      default: m.CardsSectionEditor,
    }),
  ),
);
const StatsSectionEditor = lazy(() =>
  import("@/app/(admin)/admin/pages/sections/stats-section-editor").then(
    (m) => ({
      default: m.StatsSectionEditor,
    }),
  ),
);
const FeaturesSectionEditor = lazy(() =>
  import("@/app/(admin)/admin/pages/sections/features-section-editor").then(
    (m) => ({
      default: m.FeaturesSectionEditor,
    }),
  ),
);
const CtaSectionEditor = lazy(() =>
  import("@/app/(admin)/admin/pages/sections/cta-section-editor").then((m) => ({
    default: m.CtaSectionEditor,
  })),
);
const ImageTextSectionEditor = lazy(() =>
  import("@/app/(admin)/admin/pages/sections/image-text-section-editor").then(
    (m) => ({
      default: m.ImageTextSectionEditor,
    }),
  ),
);

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

interface SectionEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
  onSuccess?: (updatedSection: Section) => void;
}

// ============================================================================
// Section Type Metadata
// ============================================================================

const SECTION_TYPE_INFO: Record<SectionType, { icon: string; label: string }> =
  {
    HERO: { icon: "🎨", label: "Hero Banner" },
    TEXT: { icon: "📝", label: "Text Content" },
    CARDS: { icon: "🗂️", label: "Cards Grid" },
    STATS: { icon: "📊", label: "Statistics" },
    FEATURES: { icon: "⭐", label: "Features" },
    CTA: { icon: "🎯", label: "Call to Action" },
    IMAGE_TEXT: { icon: "🖼️", label: "Image + Text" },
  };

// ============================================================================
// Component
// ============================================================================

export function SectionEditorModal({
  open,
  onOpenChange,
  section,
  onSuccess,
}: SectionEditorModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  if (!section) return null;

  const typeInfo = SECTION_TYPE_INFO[section.type];

  const handleSave = async (data: Record<string, any>) => {
    if (!section) return;

    try {
      setIsSaving(true);

      const result = await updateSection(section.id, {
        title: data.title,
        data,
      } as any);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to save section",
          variant: "error",
        });
      } else {
        toast({
          title: "Success",
          description: "Section saved successfully",
          variant: "success",
        });

        // Call success callback if provided
        if (onSuccess && result.data) {
          onSuccess(result.data as Section);
        }

        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to save section:", error);
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <span className="mr-1">{typeInfo?.icon}</span>
                {typeInfo?.label}
              </Badge>
            </div>
          </div>
          <DialogTitle>Edit Section</DialogTitle>
          <DialogDescription>
            Update the section content below
          </DialogDescription>

          {/* Language Tabs for Section */}
          <div className="mt-4">
            <LanguageTabs
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
          </div>
        </DialogHeader>

        {/* Editor Content */}
        <div className="py-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
          >
            {section.type === "HERO" && (
              <HeroSectionEditor
                section={section}
                onSave={handleSave}
                isLoading={isSaving}
                onClose={handleClose}
                language={currentLanguage}
              />
            )}
            {section.type === "TEXT" && (
              <TextSectionEditor
                section={section}
                onSave={handleSave}
                isLoading={isSaving}
                onClose={handleClose}
                language={currentLanguage}
              />
            )}
            {section.type === "CARDS" && (
              <CardsSectionEditor
                section={section}
                onSave={handleSave}
                isLoading={isSaving}
                onClose={handleClose}
                language={currentLanguage}
              />
            )}
            {section.type === "STATS" && (
              <StatsSectionEditor
                section={section}
                onSave={handleSave}
                isLoading={isSaving}
                onClose={handleClose}
                language={currentLanguage}
              />
            )}
            {section.type === "FEATURES" && (
              <FeaturesSectionEditor
                section={section}
                onSave={handleSave}
                isLoading={isSaving}
                onClose={handleClose}
                language={currentLanguage}
              />
            )}
            {section.type === "CTA" && (
              <CtaSectionEditor
                section={section}
                onSave={handleSave}
                isLoading={isSaving}
                onClose={handleClose}
                language={currentLanguage}
              />
            )}
            {section.type === "IMAGE_TEXT" && (
              <ImageTextSectionEditor
                section={section}
                onSave={handleSave}
                isLoading={isSaving}
                onClose={handleClose}
                language={currentLanguage}
              />
            )}
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
