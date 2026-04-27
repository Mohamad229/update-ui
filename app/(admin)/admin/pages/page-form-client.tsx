"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { createPage, updatePage, deletePage } from "@/lib/actions/pages";
import {
  generateSlug,
  PageCreateSchema,
  PageUpdateSchema,
} from "@/lib/schemas/page-form";
import { LanguageTabs } from "@/components/admin/language-tabs";

import type { PageDetail } from "@/lib/actions/pages";

// ============================================================================
// Types & Interfaces
// ============================================================================

type Language = "en" | "ar";
type FormSection = "basic" | "seo";

interface PageFormClientProps {
  mode: "create" | "edit";
  pageId?: string;
  initialData?: PageDetail | null;
}

interface FormErrors {
  [key: string]: string;
}

interface FormDataPerLanguage {
  title: string;
  metaTitle: string;
  metaDescription: string;
}

interface FormData {
  slug: string;
  isPublished: boolean;
  en: FormDataPerLanguage;
  ar: FormDataPerLanguage;
}

// ============================================================================
// Component
// ============================================================================

export function PageFormClient({
  mode,
  pageId,
  initialData,
}: PageFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Current language state
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<FormSection>>(
    new Set(["basic", "seo"]),
  );

  // Loading state for client-side data fetching
  const [isLoadingData, setIsLoadingData] = useState(
    mode === "edit" && !initialData,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize form data from initialData
  const initializeFormData = (): FormData => {
    const enTrans = initialData?.translations.find((t) => t.locale === "en");
    const arTrans = initialData?.translations.find((t) => t.locale === "ar");

    return {
      slug: initialData?.slug || "",
      isPublished: initialData?.isPublished || false,
      en: {
        title: enTrans?.title || "",
        metaTitle: enTrans?.metaTitle || "",
        metaDescription: enTrans?.metaDescription || "",
      },
      ar: {
        title: arTrans?.title || "",
        metaTitle: arTrans?.metaTitle || "",
        metaDescription: arTrans?.metaDescription || "",
      },
    };
  };

  // Form state
  const [formData, setFormData] = useState<FormData>(initializeFormData());
  const [unsavedByLanguage, setUnsavedByLanguage] = useState<{
    en: boolean;
    ar: boolean;
  }>({
    en: false,
    ar: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track dirty state - any changes in any language
  useEffect(() => {
    if (initialData) {
      const enTrans = initialData.translations.find((t) => t.locale === "en");
      const arTrans = initialData.translations.find((t) => t.locale === "ar");

      const hasChanges =
        formData.slug !== (initialData.slug || "") ||
        formData.isPublished !== (initialData.isPublished || false) ||
        formData.en.title !== (enTrans?.title || "") ||
        formData.en.metaTitle !== (enTrans?.metaTitle || "") ||
        formData.en.metaDescription !== (enTrans?.metaDescription || "") ||
        formData.ar.title !== (arTrans?.title || "") ||
        formData.ar.metaTitle !== (arTrans?.metaTitle || "") ||
        formData.ar.metaDescription !== (arTrans?.metaDescription || "");

      setIsDirty(hasChanges);

      // Track unsaved per language
      const enUnsaved =
        formData.en.title !== (enTrans?.title || "") ||
        formData.en.metaTitle !== (enTrans?.metaTitle || "") ||
        formData.en.metaDescription !== (enTrans?.metaDescription || "");

      const arUnsaved =
        formData.ar.title !== (arTrans?.title || "") ||
        formData.ar.metaTitle !== (arTrans?.metaTitle || "") ||
        formData.ar.metaDescription !== (arTrans?.metaDescription || "");

      setUnsavedByLanguage({ en: enUnsaved, ar: arUnsaved });
    }
  }, [formData, initialData]);

  // Handle form field changes - specific to current language
  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      if (field === "slug") {
        // Slug is global, not per-language
        setFormData((prev) => {
          const updated = { ...prev, slug: value as string };
          // Auto-generate slug from English title
          if (field === "slug" && value === "") {
            updated.slug = generateSlug((prev.en.title as string) || "");
          }
          return updated;
        });
      } else if (field === "isPublished") {
        // Publish is global
        setFormData((prev) => ({ ...prev, isPublished: value as boolean }));
      } else if (field === "title") {
        // Title is language-specific, auto-generate slug from English title
        setFormData((prev) => {
          const updated = { ...prev };
          updated[currentLanguage] = {
            ...updated[currentLanguage],
            title: value as string,
          };

          // Auto-generate slug from English title only
          if (currentLanguage === "en") {
            updated.slug = generateSlug(value as string);
          }

          return updated;
        });
      } else {
        // Other language-specific fields (metaTitle, metaDescription)
        setFormData((prev) => ({
          ...prev,
          [currentLanguage]: { ...prev[currentLanguage], [field]: value },
        }));
      }

      // Clear error for this field when user starts editing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors, currentLanguage],
  );

  // Validate form - validate current language
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const currentLangData = formData[currentLanguage];

    if (!currentLangData.title.trim()) {
      newErrors.title = "Page title is required";
    } else if (currentLangData.title.length > 255) {
      newErrors.title = "Page title must be 255 characters or less";
    }

    // Only validate slug in English form
    if (currentLanguage === "en") {
      if (!formData.slug.trim()) {
        newErrors.slug = "Page slug is required";
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
        newErrors.slug =
          "Slug must contain only lowercase letters, numbers, and hyphens";
      }
    }

    if (currentLangData.metaTitle && currentLangData.metaTitle.length > 60) {
      newErrors.metaTitle = "Meta title must be 60 characters or less";
    }

    if (
      currentLangData.metaDescription &&
      currentLangData.metaDescription.length > 160
    ) {
      newErrors.metaDescription =
        "Meta description must be 160 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "create") {
        const result = await createPage({
          title: formData.en.title,
          slug: formData.slug,
          metaTitle: formData.en.metaTitle || null,
          metaDescription: formData.en.metaDescription || null,
          isPublished: formData.isPublished,
          translations: {
            en: {
              title: formData.en.title,
              metaTitle: formData.en.metaTitle,
              metaDescription: formData.en.metaDescription,
            },
            ar: {
              title: formData.ar.title,
              metaTitle: formData.ar.metaTitle,
              metaDescription: formData.ar.metaDescription,
            },
          },
        });

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "error",
          });
        } else {
          toast({
            title: "Success",
            description: "Page created successfully",
            variant: "success",
          });
          router.push(`/admin/pages/${result.data?.id}/edit`);
        }
      } else if (mode === "edit" && pageId) {
        const result = await updatePage({
          id: pageId,
          title: formData.en.title,
          slug: formData.slug,
          metaTitle: formData.en.metaTitle || null,
          metaDescription: formData.en.metaDescription || null,
          isPublished: formData.isPublished,
          translations: {
            en: {
              title: formData.en.title,
              metaTitle: formData.en.metaTitle,
              metaDescription: formData.en.metaDescription,
            },
            ar: {
              title: formData.ar.title,
              metaTitle: formData.ar.metaTitle,
              metaDescription: formData.ar.metaDescription,
            },
          },
        });

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "error",
          });
        } else {
          toast({
            title: "Success",
            description: "Page updated successfully",
            variant: "success",
          });
          setIsDirty(false);
        }
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle page deletion
  const handleDeletePage = async () => {
    if (!pageId) return;

    try {
      setIsDeleting(true);
      const result = await deletePage(pageId);

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

  // Toggle section expansion
  const toggleSection = (section: FormSection) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Section component
  interface SectionProps {
    id: FormSection;
    title: string;
    children: React.ReactNode;
  }

  const FormSection: React.FC<SectionProps> = ({ id, title, children }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full px-6 py-4 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} section`}
        >
          <div className="font-semibold text-sm">{title}</div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        {isExpanded && (
          <div className="px-6 py-4 space-y-4 border-t">{children}</div>
        )}
      </div>
    );
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="border border-error/30 bg-error/5 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-error" />
        <p className="text-error font-medium">{loadError}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link href="/admin/pages">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <Button
              type="button"
              variant="ghost"
              className="text-error hover:text-error hover:bg-error/10"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Page
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || (mode === "edit" && !isDirty)}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Page" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      {mode === "edit" && initialData && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={formData.isPublished ? "success" : "outline"}>
            {formData.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      )}

      {/* Basic Information Section */}
      <FormSection id="basic" title="Basic Information">
        <div className="space-y-4">
          {/* Language Tabs */}
          <LanguageTabs
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            unsavedChanges={unsavedByLanguage}
          />

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Page Title
              <span className="text-error ml-1">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={formData[currentLanguage].title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter page title"
              className={`${errors.title ? "border-error" : ""} ${
                currentLanguage === "ar" ? "text-right" : ""
              }`}
              disabled={isSubmitting}
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.title && (
                <div
                  id="title-error"
                  className="text-sm text-error flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </div>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData[currentLanguage].title.length}/255
              </span>
            </div>
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug" className="text-sm font-medium">
              Page Slug
              <span className="text-error ml-1">*</span>
            </Label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              placeholder="page-slug"
              className={errors.slug ? "border-error" : ""}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.slug}
              aria-describedby={
                errors.slug ? "slug-error slug-help" : "slug-help"
              }
            />
            <p id="slug-help" className="text-xs text-muted-foreground mt-1">
              Used in the page URL. Auto-generated from title if left empty.
            </p>
            {errors.slug && (
              <div
                id="slug-error"
                className="text-sm text-error flex items-center gap-1 mt-1"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.slug}
              </div>
            )}
          </div>

          {/* Publish Status */}
          <div>
            <div className="flex items-center gap-3">
              <input
                id="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) =>
                  handleInputChange("isPublished", e.target.checked)
                }
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-input bg-background"
                aria-describedby="isPublished-help"
              />
              <Label
                htmlFor="isPublished"
                className="text-sm font-medium cursor-pointer"
              >
                Publish this page
              </Label>
            </div>
            <p
              id="isPublished-help"
              className="text-xs text-muted-foreground mt-2 ml-7"
            >
              When unchecked, page will be saved as draft and not visible to the
              public.
            </p>
          </div>
        </div>
      </FormSection>

      {/* SEO Section */}
      <FormSection id="seo" title="SEO & Metadata">
        <div className="space-y-4">
          {/* Language Tabs */}
          <LanguageTabs
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            unsavedChanges={unsavedByLanguage}
          />

          {/* Meta Title */}
          <div>
            <Label htmlFor="metaTitle" className="text-sm font-medium">
              Meta Title (for search engines)
            </Label>
            <Input
              id="metaTitle"
              type="text"
              value={formData[currentLanguage].metaTitle}
              onChange={(e) => handleInputChange("metaTitle", e.target.value)}
              placeholder="Page title for search results"
              className={`${errors.metaTitle ? "border-error" : ""} ${
                currentLanguage === "ar" ? "text-right" : ""
              }`}
              disabled={isSubmitting}
              maxLength={60}
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
              aria-invalid={!!errors.metaTitle}
              aria-describedby={
                errors.metaTitle ? "metaTitle-error" : "metaTitle-hint"
              }
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.metaTitle && (
                <div
                  id="metaTitle-error"
                  className="text-sm text-error flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.metaTitle}
                </div>
              )}
              <span
                id="metaTitle-hint"
                className="text-xs text-muted-foreground ml-auto"
              >
                {formData[currentLanguage].metaTitle.length}/60
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <Label htmlFor="metaDescription" className="text-sm font-medium">
              Meta Description (for search engines)
            </Label>
            <Textarea
              id="metaDescription"
              value={formData[currentLanguage].metaDescription}
              onChange={(e) =>
                handleInputChange("metaDescription", e.target.value)
              }
              placeholder="Page description for search results"
              className={`${errors.metaDescription ? "border-error" : ""} ${
                currentLanguage === "ar" ? "text-right" : ""
              }`}
              disabled={isSubmitting}
              rows={3}
              maxLength={160}
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
              aria-invalid={!!errors.metaDescription}
              aria-describedby={
                errors.metaDescription
                  ? "metaDescription-error"
                  : "metaDescription-hint"
              }
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.metaDescription && (
                <div
                  id="metaDescription-error"
                  className="text-sm text-error flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.metaDescription}
                </div>
              )}
              <span
                id="metaDescription-hint"
                className="text-xs text-muted-foreground ml-auto"
              >
                {formData[currentLanguage].metaDescription.length}/160
              </span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Search Result Preview:</p>
            <div className="space-y-1">
              <p className="text-primary font-medium truncate">
                {formData[currentLanguage].metaTitle ||
                  formData[currentLanguage].title}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {formData[currentLanguage].metaDescription
                  ? formData[currentLanguage].metaDescription
                  : "No meta description provided"}
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent showCloseButton>
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
              className="bg-error text-error-foreground hover:bg-error/90"
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
    </form>
  );
}
