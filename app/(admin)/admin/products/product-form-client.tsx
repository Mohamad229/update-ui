"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Package,
  Layers,
  Globe,
  Settings,
  Plus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectOption } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { MediaPicker } from "@/components/admin/media-picker";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getTherapeuticAreas,
  getManufacturers,
  getProductById,
} from "@/lib/actions/products";

import type { ProductDetail } from "@/lib/actions/products";
import type { MediaWithUser } from "@/lib/actions/media";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ProductFormClientProps {
  initialData?: ProductDetail | null;
  productId?: string;
}

interface FormOption {
  id: string;
  name: string;
  nameAr?: string | null;
  slug?: string;
  country?: string | null;
}

type FormSection =
  | "basic"
  | "classification"
  | "media"
  | "advanced"
  | "translations";

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// Component
// ============================================================================

export function ProductFormClient({
  initialData,
  productId,
}: ProductFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<FormSection>>(
    new Set(["basic", "classification"]),
  );

  // Loading state for client-side data fetching
  const [isLoadingData, setIsLoadingData] = useState(
    !!productId && !initialData,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    shortDescription:
      initialData?.translations.find((t) => t.locale === "en")
        ?.shortDescription || "",
    fullDescription:
      initialData?.translations.find((t) => t.locale === "en")
        ?.fullDescription || "",
    type: initialData?.type || "SIMPLE",
    status: initialData?.status || "PIPELINE",
    isPublished: initialData?.isPublished ?? true,
    categoryId: initialData?.category?.id || "",
    therapeuticAreaId: initialData?.therapeuticArea?.id || "",
    manufacturerId: initialData?.manufacturer?.id || "",
    coverImageId: initialData?.coverImage || "",
    attachmentIds: initialData?.attachments?.map((a) => a.id) || [],
    storageConditions: initialData?.advancedDetails?.storageConditions || "",
    regulatoryInfo: initialData?.advancedDetails?.regulatoryInfo || "",
    englishName:
      initialData?.translations.find((t) => t.locale === "en")?.name || "",
    englishDescription:
      initialData?.translations.find((t) => t.locale === "en")
        ?.fullDescription || "",
    arabicName:
      initialData?.translations.find((t) => t.locale === "ar")?.name || "",
    arabicDescription:
      initialData?.translations.find((t) => t.locale === "ar")
        ?.fullDescription || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lookup data states
  const [categories, setCategories] = useState<FormOption[]>([]);
  const [therapeuticAreas, setTherapeuticAreas] = useState<FormOption[]>([]);
  const [manufacturers, setManufacturers] = useState<FormOption[]>([]);
  const [lookupLoading, setLookupLoading] = useState(true);

  // Media picker states
  const [showCoverImagePicker, setShowCoverImagePicker] = useState(false);
  const [showAttachmentsPicker, setShowAttachmentsPicker] = useState(false);
  const [selectedCoverImage, setSelectedCoverImage] =
    useState<MediaWithUser | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<
    MediaWithUser[]
  >([]);

  // Load lookup data on mount
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        setLookupLoading(true);
        const [catResult, areaResult, mfgResult] = await Promise.all([
          getCategories(),
          getTherapeuticAreas(),
          getManufacturers(),
        ]);

        if (catResult.data) setCategories(catResult.data);
        if (areaResult.data) setTherapeuticAreas(areaResult.data);
        if (mfgResult.data) setManufacturers(mfgResult.data);
      } catch (error) {
        console.error("Error loading lookup data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
        });
      } finally {
        setLookupLoading(false);
      }
    };

    loadLookupData();
  }, [toast]);

  // Load product data on client mount when productId is provided
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId || initialData) {
        return;
      }

      try {
        setIsLoadingData(true);
        setLoadError(null);
        const result = await getProductById(productId);

        if (result.error) {
          setLoadError(result.error);
          if (
            result.error.includes("404") ||
            result.error.includes("not found")
          ) {
            toast({
              title: "Product Not Found",
              description: "The requested product does not exist.",
            });
            // Redirect to products list after a brief delay
            setTimeout(() => router.push("/admin/products"), 1500);
          } else {
            toast({
              title: "Error",
              description: result.error,
            });
          }
        } else if (result.data) {
          // Update form data with fetched product
          const product = result.data;
          const enTrans = product.translations.find((t) => t.locale === "en");
          const arTrans = product.translations.find((t) => t.locale === "ar");

          setFormData({
            name: product.name || "",
            shortDescription: enTrans?.shortDescription || "",
            fullDescription: enTrans?.fullDescription || "",
            type: product.type || "SIMPLE",
            status: product.status || "PIPELINE",
            isPublished: product.isPublished ?? true,
            categoryId: product.category?.id || "",
            therapeuticAreaId: product.therapeuticArea?.id || "",
            manufacturerId: product.manufacturer?.id || "",
            coverImageId: product.coverImage || "",
            attachmentIds: product.attachments?.map((a) => a.id) || [],
            storageConditions: product.advancedDetails?.storageConditions || "",
            regulatoryInfo: product.advancedDetails?.regulatoryInfo || "",
            englishName: enTrans?.name || "",
            englishDescription: enTrans?.fullDescription || "",
            arabicName: arTrans?.name || "",
            arabicDescription: arTrans?.fullDescription || "",
          });

          // Initialize media
          if (product.coverImage) {
            // Note: This is just the ID, we may need to fetch the full media object
            // For now, we'll just set the ID
          }
          if (product.attachments && product.attachments.length > 0) {
            const attachments = product.attachments.map((a) => ({
              id: a.id,
              name: a.name,
              url: a.url,
              type: a.type as "image" | "document",
              size: a.size,
              uploadedAt: new Date(),
              uploadedById: null,
              uploadedBy: null,
              mimeType: a.type,
              width: null,
              height: null,
              createdAt: new Date(),
            })) as MediaWithUser[];
            setSelectedAttachments(attachments);
          }
        }
      } catch (error) {
        console.error("Error loading product data:", error);
        setLoadError("Failed to load product data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProductData();
  }, [productId, initialData, router, toast]);

  // Initialize attachments if exist
  useEffect(() => {
    if (initialData?.attachments && initialData.attachments.length > 0) {
      const attachments = initialData.attachments.map((a) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        type: a.type as "image" | "document",
        size: a.size,
        uploadedAt: new Date(),
        uploadedById: null,
        uploadedBy: null,
        mimeType: a.type,
        width: null,
        height: null,
        createdAt: new Date(),
      })) as MediaWithUser[];
      setSelectedAttachments(attachments);
    }
  }, [initialData?.attachments]);

  // Track dirty state
  useEffect(() => {
    if (initialData) {
      const enTrans = initialData.translations.find((t) => t.locale === "en");
      const hasChanges =
        formData.name !== (initialData.name || "") ||
        formData.shortDescription !== (enTrans?.shortDescription || "") ||
        formData.fullDescription !== (enTrans?.fullDescription || "") ||
        formData.type !== initialData.type ||
        formData.status !== initialData.status ||
        formData.isPublished !== initialData.isPublished ||
        formData.categoryId !== (initialData.category?.id || "") ||
        formData.therapeuticAreaId !==
          (initialData.therapeuticArea?.id || "") ||
        formData.manufacturerId !== (initialData.manufacturer?.id || "");

      setIsDirty(hasChanges);
    }
  }, [formData, initialData]);

  // Handle form field changes
  const handleInputChange = useCallback(
    (field: string, value: string | number | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field when user starts editing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  // Handle advanced details changes
  const handleAdvancedDetailsChange = useCallback(
    (field: "storageConditions" | "regulatoryInfo", value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Handle cover image selection
  const handleCoverImageSelect = useCallback(
    (media: MediaWithUser | MediaWithUser[]) => {
      if (Array.isArray(media)) {
        setSelectedCoverImage(media[0] || null);
        setFormData((prev) => ({
          ...prev,
          coverImageId: media[0]?.id || "",
        }));
      } else {
        setSelectedCoverImage(media);
        setFormData((prev) => ({
          ...prev,
          coverImageId: media.id,
        }));
      }
      setShowCoverImagePicker(false);
      setIsDirty(true);
    },
    [],
  );

  // Handle attachments selection
  const handleAttachmentsSelect = useCallback(
    (media: MediaWithUser | MediaWithUser[]) => {
      const mediaArray = Array.isArray(media) ? media : [media];
      setSelectedAttachments(mediaArray);
      setFormData((prev) => ({
        ...prev,
        attachmentIds: mediaArray.map((m) => m.id),
      }));
      setShowAttachmentsPicker(false);
      setIsDirty(true);
    },
    [],
  );

  // Remove attachment
  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setSelectedAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    setFormData((prev) => ({
      ...prev,
      attachmentIds: prev.attachmentIds.filter((id) => id !== attachmentId),
    }));
    setIsDirty(true);
  }, []);

  // Remove cover image
  const handleRemoveCoverImage = useCallback(() => {
    setSelectedCoverImage(null);
    setFormData((prev) => ({
      ...prev,
      coverImageId: "",
    }));
    setIsDirty(true);
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length > 200) {
      newErrors.name = "Product name must be 200 characters or less";
    }

    if (formData.shortDescription && formData.shortDescription.length > 150) {
      newErrors.shortDescription =
        "Short description cannot exceed 150 characters";
    }

    if (formData.fullDescription && formData.fullDescription.length > 5000) {
      newErrors.fullDescription =
        "Full description cannot exceed 5000 characters";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.manufacturerId) {
      newErrors.manufacturerId = "Manufacturer is required";
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
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let result;

      if (initialData?.id) {
        // Update existing product
        result = await updateProduct({
          id: initialData.id,
          name: formData.name,
          description: formData.shortDescription,
          shortDescription: formData.shortDescription,
          fullDescription: formData.fullDescription,
          englishName: formData.englishName,
          englishDescription: formData.englishDescription,
          arabicName: formData.arabicName,
          arabicDescription: formData.arabicDescription,
          storageConditions: formData.storageConditions,
          regulatoryInfo: formData.regulatoryInfo,
          type: formData.type as "SIMPLE" | "ADVANCED",
          status: formData.status as "AVAILABLE" | "PIPELINE",
          isPublished: formData.isPublished,
          categoryId: formData.categoryId,
          therapeuticAreaId: formData.therapeuticAreaId || null,
          manufacturerId: formData.manufacturerId,
          coverImageId: formData.coverImageId || null,
        });
      } else {
        // Create new product
        result = await createProduct({
          name: formData.name,
          description: formData.shortDescription,
          shortDescription: formData.shortDescription,
          fullDescription: formData.fullDescription,
          englishName: formData.englishName,
          englishDescription: formData.englishDescription,
          arabicName: formData.arabicName,
          arabicDescription: formData.arabicDescription,
          storageConditions: formData.storageConditions,
          regulatoryInfo: formData.regulatoryInfo,
          type: formData.type as "SIMPLE" | "ADVANCED",
          status: formData.status as "AVAILABLE" | "PIPELINE",
          isPublished: formData.isPublished,
          categoryId: formData.categoryId,
          therapeuticAreaId: formData.therapeuticAreaId || null,
          manufacturerId: formData.manufacturerId,
          coverImageId: formData.coverImageId || null,
        });
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: initialData
            ? "Product updated successfully"
            : "Product created successfully",
        });
        router.push("/admin/products");
        router.refresh();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!initialData?.id) return;

    try {
      setIsDeleting(true);
      const result = await deleteProduct(initialData.id);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
        });
        setShowDeleteConfirm(false);
      } else {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        router.push("/admin/products");
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: FormSection) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  const isLoading = isSubmitting || lookupLoading || isLoadingData;
  const isEditMode = !!initialData?.id;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
      {/* Loading state */}
      {isLoadingData && (
        <div className="flex items-center justify-center py-8 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading product data...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              Error Loading Product
            </p>
            <p className="text-sm text-destructive/80">{loadError}</p>
          </div>
        </div>
      )}

      {/* Only show form content if not loading and no error */}
      {!isLoadingData && !loadError && (
        <>
          {/* ====================================================================== */}
          {/* Basic Information Section */}
          {/* ====================================================================== */}

          <FormSection
            title="Basic Information"
            icon={<Package className="h-5 w-5" />}
            section="basic"
            expanded={expandedSections.has("basic")}
            onToggle={() => toggleSection("basic")}
          >
            <div className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  error={!!errors.name}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={200}
                  autoComplete="off"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.shortDescription?.length || 0}/150
                  </span>
                </div>
                <Textarea
                  id="shortDescription"
                  placeholder="Brief description of the product"
                  maxLength={150}
                  rows={2}
                  error={!!errors.shortDescription}
                  value={formData.shortDescription}
                  onChange={(e) =>
                    handleInputChange("shortDescription", e.target.value)
                  }
                />
                {errors.shortDescription && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.shortDescription}
                  </p>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.fullDescription?.length || 0}/5000
                  </span>
                </div>
                <Textarea
                  id="fullDescription"
                  placeholder="Detailed product description"
                  maxLength={5000}
                  rows={5}
                  error={!!errors.fullDescription}
                  value={formData.fullDescription}
                  onChange={(e) =>
                    handleInputChange("fullDescription", e.target.value)
                  }
                />
                {errors.fullDescription && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.fullDescription}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* ====================================================================== */}
          {/* Classification Section */}
          {/* ====================================================================== */}

          <FormSection
            title="Classification"
            icon={<Layers className="h-5 w-5" />}
            section="classification"
            expanded={expandedSections.has("classification")}
            onToggle={() => toggleSection("classification")}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Product Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="type"
                    error={!!errors.type}
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    placeholder="Select product type"
                    aria-required="true"
                    aria-invalid={!!errors.type}
                    aria-describedby={errors.type ? "type-error" : undefined}
                  >
                    <SelectOption value="SIMPLE">Simple</SelectOption>
                    <SelectOption value="ADVANCED">Advanced</SelectOption>
                  </Select>
                  {errors.type && (
                    <p
                      id="type-error"
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.type}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="status"
                    error={!!errors.status}
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    placeholder="Select status"
                    aria-required="true"
                    aria-invalid={!!errors.status}
                    aria-describedby={
                      errors.status ? "status-error" : undefined
                    }
                  >
                    <SelectOption value="AVAILABLE">Available</SelectOption>
                    <SelectOption value="PIPELINE">Pipeline</SelectOption>
                  </Select>
                  {errors.status && (
                    <p
                      id="status-error"
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.status}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isPublished">Public Visibility</Label>
                <Select
                  id="isPublished"
                  value={formData.isPublished ? "true" : "false"}
                  onChange={(e) =>
                    handleInputChange("isPublished", e.target.value === "true")
                  }
                  placeholder="Select visibility"
                >
                  <SelectOption value="true">Published (visible to users)</SelectOption>
                  <SelectOption value="false">Draft (hidden from users)</SelectOption>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only published products appear on the public catalog and product pages.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="categoryId"
                    error={!!errors.categoryId}
                    value={formData.categoryId}
                    onChange={(e) =>
                      handleInputChange("categoryId", e.target.value)
                    }
                    disabled={lookupLoading}
                    placeholder={
                      lookupLoading ? "Loading..." : "Select category"
                    }
                    aria-required="true"
                    aria-invalid={!!errors.categoryId}
                    aria-describedby={
                      errors.categoryId ? "categoryId-error" : undefined
                    }
                  >
                    {categories.map((cat) => (
                      <SelectOption key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectOption>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <p
                      id="categoryId-error"
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Therapeutic Area */}
                <div className="space-y-2">
                  <Label htmlFor="therapeuticAreaId">Therapeutic Area</Label>
                  <Select
                    id="therapeuticAreaId"
                    error={!!errors.therapeuticAreaId}
                    value={formData.therapeuticAreaId}
                    onChange={(e) =>
                      handleInputChange("therapeuticAreaId", e.target.value)
                    }
                    disabled={lookupLoading}
                    placeholder={
                      lookupLoading ? "Loading..." : "Select area (optional)"
                    }
                  >
                    <SelectOption value="">None</SelectOption>
                    {therapeuticAreas.map((area) => (
                      <SelectOption key={area.id} value={area.id}>
                        {area.name}
                      </SelectOption>
                    ))}
                  </Select>
                  {errors.therapeuticAreaId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.therapeuticAreaId}
                    </p>
                  )}
                </div>
              </div>

              {/* Manufacturer */}
              <div className="space-y-2">
                <Label htmlFor="manufacturerId">
                  Manufacturer <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="manufacturerId"
                  error={!!errors.manufacturerId}
                  value={formData.manufacturerId}
                  onChange={(e) =>
                    handleInputChange("manufacturerId", e.target.value)
                  }
                  disabled={lookupLoading}
                  placeholder={
                    lookupLoading ? "Loading..." : "Select manufacturer"
                  }
                  aria-required="true"
                  aria-invalid={!!errors.manufacturerId}
                  aria-describedby={
                    errors.manufacturerId ? "manufacturerId-error" : undefined
                  }
                >
                  {manufacturers.map((mfg) => (
                    <SelectOption key={mfg.id} value={mfg.id}>
                      {mfg.name}
                      {mfg.country && ` (${mfg.country})`}
                    </SelectOption>
                  ))}
                </Select>
                {errors.manufacturerId && (
                  <p
                    id="manufacturerId-error"
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.manufacturerId}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* ====================================================================== */}
          {/* Media Section */}
          {/* ====================================================================== */}

          <FormSection
            title="Media"
            icon={<Eye className="h-5 w-5" />}
            section="media"
            expanded={expandedSections.has("media")}
            onToggle={() => toggleSection("media")}
          >
            <div className="space-y-6">
              {/* Cover Image */}
              <div className="space-y-3">
                <Label className="block">Cover Image</Label>
                {selectedCoverImage ? (
                  <div className="relative w-full h-48 rounded-lg border border-border overflow-hidden bg-muted">
                    <Image
                      src={selectedCoverImage.url}
                      alt="Cover image preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      aria-label="Remove cover image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Eye className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No cover image selected
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCoverImagePicker(true)}
                >
                  {selectedCoverImage
                    ? "Change Cover Image"
                    : "Select Cover Image"}
                </Button>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <Label className="block">Attachments</Label>
                {selectedAttachments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between bg-muted p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {attachment.name}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatFileSize(attachment.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          aria-label={`Remove ${attachment.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No attachments added
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAttachmentsPicker(true)}
                >
                  Add Attachments
                </Button>
              </div>
            </div>
          </FormSection>

          {/* ====================================================================== */}
          {/* Advanced Details Section (conditional) */}
          {/* ====================================================================== */}

          {formData.type === "ADVANCED" && (
            <FormSection
              title="Advanced Details"
              icon={<Settings className="h-5 w-5" />}
              section="advanced"
              expanded={expandedSections.has("advanced")}
              onToggle={() => toggleSection("advanced")}
            >
              <div className="space-y-4">
                {/* Storage Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="storageConditions">Storage Conditions</Label>
                  <Input
                    id="storageConditions"
                    placeholder="e.g., Store at 25°C, away from light"
                    value={formData.storageConditions}
                    onChange={(e) =>
                      handleAdvancedDetailsChange(
                        "storageConditions",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Regulatory Info */}
                <div className="space-y-2">
                  <Label htmlFor="regulatoryInfo">Regulatory Information</Label>
                  <Textarea
                    id="regulatoryInfo"
                    placeholder="Regulatory approvals, certifications, etc."
                    rows={3}
                    value={formData.regulatoryInfo}
                    onChange={(e) =>
                      handleAdvancedDetailsChange(
                        "regulatoryInfo",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* ====================================================================== */}
          {/* Translations Section */}
          {/* ====================================================================== */}

          <FormSection
            title="Multi-Language Support"
            icon={<Globe className="h-5 w-5" />}
            section="translations"
            expanded={expandedSections.has("translations")}
            onToggle={() => toggleSection("translations")}
          >
            <div className="space-y-6">
              {/* English */}
              <div className="space-y-3 pb-6 border-b">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Badge variant="info">EN</Badge>
                  English
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="englishName">English Name</Label>
                  <Input
                    id="englishName"
                    placeholder="English product name"
                    value={formData.englishName}
                    onChange={(e) =>
                      handleInputChange("englishName", e.target.value)
                    }
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="englishDescription">
                      English Description
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.englishDescription?.length || 0}/5000
                    </span>
                  </div>
                  <Textarea
                    id="englishDescription"
                    placeholder="English product description"
                    maxLength={5000}
                    rows={3}
                    value={formData.englishDescription}
                    onChange={(e) =>
                      handleInputChange("englishDescription", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Arabic */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Badge variant="success">AR</Badge>
                  Arabic
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="arabicName">Arabic Name</Label>
                  <Input
                    id="arabicName"
                    placeholder="اسم المنتج بالعربية"
                    dir="rtl"
                    value={formData.arabicName}
                    onChange={(e) =>
                      handleInputChange("arabicName", e.target.value)
                    }
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="arabicDescription">
                      Arabic Description
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.arabicDescription?.length || 0}/5000
                    </span>
                  </div>
                  <Textarea
                    id="arabicDescription"
                    placeholder="وصف المنتج بالعربية"
                    maxLength={5000}
                    dir="rtl"
                    rows={3}
                    value={formData.arabicDescription}
                    onChange={(e) =>
                      handleInputChange("arabicDescription", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* ====================================================================== */}
          {/* Form Actions */}
          {/* ====================================================================== */}

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {isDirty && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading || isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}

              <Link href="/admin/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>

          {/* ====================================================================== */}
          {/* Delete Confirmation Dialog */}
          {/* ====================================================================== */}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-background rounded-lg shadow-lg max-w-sm w-full p-6">
                <h2 className="text-lg font-semibold mb-2">Delete Product?</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================== */}
          {/* Media Pickers */}
          {/* ====================================================================== */}

          <MediaPicker
            open={showCoverImagePicker}
            onOpenChange={setShowCoverImagePicker}
            onSelect={handleCoverImageSelect}
            multiple={false}
            accept="image"
            title="Select Cover Image"
            description="Choose an image for the product cover"
          />

          <MediaPicker
            open={showAttachmentsPicker}
            onOpenChange={setShowAttachmentsPicker}
            onSelect={handleAttachmentsSelect}
            multiple={true}
            accept="all"
            title="Select Attachments"
            description="Choose files to attach to this product"
          />
        </>
      )}
    </form>
  );
}

// ============================================================================
// Form Section Component
// ============================================================================

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  section: FormSection;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FormSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: FormSectionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full bg-muted/50 hover:bg-muted px-4 py-3 flex items-center justify-between transition-colors"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${title} section`}
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">{icon}</div>
          <h2 className="font-semibold">{title}</h2>
        </div>
        {expanded ? (
          <ChevronUp
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </button>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
