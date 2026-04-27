"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  createCategory,
  createManufacturer,
  createTherapeuticArea,
  deleteCategory,
  deleteManufacturer,
  deleteTherapeuticArea,
  updateCategory,
  updateManufacturer,
  updateSiteSettings,
  updateTherapeuticArea,
} from "@/lib/actions/settings";
import type {
  CategoryLookupItem,
  ManufacturerLookupItem,
  SiteSettings,
  TherapeuticAreaLookupItem,
} from "@/lib/actions/settings";

type AdminSettingsTab = "lookups" | "site";
type StatusTone = "success" | "error";

interface SettingsManagementClientProps {
  initialCategories: CategoryLookupItem[];
  initialTherapeuticAreas: TherapeuticAreaLookupItem[];
  initialManufacturers: ManufacturerLookupItem[];
  initialSiteSettings: SiteSettings;
}

interface LookupFormState {
  name: string;
  nameAr: string;
  slug: string;
}

interface ManufacturerFormState {
  name: string;
  slug: string;
  country: string;
}

interface SiteSettingsFormState {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
}

function toSiteSettingsFormState(
  settings: SiteSettings,
): SiteSettingsFormState {
  return {
    siteName: settings.siteName ?? "",
    siteTagline: settings.siteTagline ?? "",
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
    contactAddress: settings.contactAddress ?? "",
    seoDefaultTitle: settings.seoDefaultTitle ?? "",
    seoDefaultDescription: settings.seoDefaultDescription ?? "",
  };
}

function emptyLookupFormState(): LookupFormState {
  return {
    name: "",
    nameAr: "",
    slug: "",
  };
}

function emptyManufacturerFormState(): ManufacturerFormState {
  return {
    name: "",
    slug: "",
    country: "",
  };
}

export function SettingsManagementClient({
  initialCategories,
  initialTherapeuticAreas,
  initialManufacturers,
  initialSiteSettings,
}: SettingsManagementClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminSettingsTab>("lookups");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    tone: StatusTone;
    message: string;
  } | null>(null);

  const [categories, setCategories] =
    useState<CategoryLookupItem[]>(initialCategories);
  const [therapeuticAreas, setTherapeuticAreas] = useState<
    TherapeuticAreaLookupItem[]
  >(initialTherapeuticAreas);
  const [manufacturers, setManufacturers] =
    useState<ManufacturerLookupItem[]>(initialManufacturers);

  const [newCategory, setNewCategory] =
    useState<LookupFormState>(emptyLookupFormState);
  const [newTherapeuticArea, setNewTherapeuticArea] =
    useState<LookupFormState>(emptyLookupFormState);
  const [newManufacturer, setNewManufacturer] = useState<ManufacturerFormState>(
    emptyManufacturerFormState,
  );

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingTherapeuticAreaId, setEditingTherapeuticAreaId] = useState<
    string | null
  >(null);
  const [editingManufacturerId, setEditingManufacturerId] = useState<
    string | null
  >(null);

  const [editingCategory, setEditingCategory] =
    useState<LookupFormState>(emptyLookupFormState);
  const [editingTherapeuticArea, setEditingTherapeuticArea] =
    useState<LookupFormState>(emptyLookupFormState);
  const [editingManufacturer, setEditingManufacturer] =
    useState<ManufacturerFormState>(emptyManufacturerFormState);

  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettingsFormState>(
    toSiteSettingsFormState(initialSiteSettings),
  );
  const [siteBaseline, setSiteBaseline] = useState<SiteSettingsFormState>(
    toSiteSettingsFormState(initialSiteSettings),
  );

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setTherapeuticAreas(initialTherapeuticAreas);
  }, [initialTherapeuticAreas]);

  useEffect(() => {
    setManufacturers(initialManufacturers);
  }, [initialManufacturers]);

  useEffect(() => {
    const normalized = toSiteSettingsFormState(initialSiteSettings);
    setSiteSettings(normalized);
    setSiteBaseline(normalized);
  }, [initialSiteSettings]);

  const siteSettingsDirty = useMemo(() => {
    return (
      siteSettings.siteName !== siteBaseline.siteName ||
      siteSettings.siteTagline !== siteBaseline.siteTagline ||
      siteSettings.contactEmail !== siteBaseline.contactEmail ||
      siteSettings.contactPhone !== siteBaseline.contactPhone ||
      siteSettings.contactAddress !== siteBaseline.contactAddress ||
      siteSettings.seoDefaultTitle !== siteBaseline.seoDefaultTitle ||
      siteSettings.seoDefaultDescription !== siteBaseline.seoDefaultDescription
    );
  }, [siteSettings, siteBaseline]);

  async function withActionFeedback(
    actionKey: string,
    run: () => Promise<{ error?: string; success?: boolean }>,
    successMessage: string,
  ): Promise<boolean> {
    setPendingAction(actionKey);
    setStatusMessage(null);

    try {
      const result = await run();

      if (result.error || !result.success) {
        const message =
          result.error || "The requested change could not be completed.";
        setStatusMessage({ tone: "error", message });
        toast({
          title: "Update failed",
          description: message,
          variant: "error",
        });
        return false;
      }

      setStatusMessage({ tone: "success", message: successMessage });
      toast({
        title: "Saved",
        description: successMessage,
        variant: "success",
      });

      router.refresh();
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error while updating settings.";
      setStatusMessage({ tone: "error", message });
      toast({
        title: "Update failed",
        description: message,
        variant: "error",
      });
      return false;
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="inline-flex rounded-lg border border-border bg-muted/40 p-1"
        role="tablist"
        aria-label="Settings sections"
      >
        <button
          id="settings-tab-lookups"
          type="button"
          role="tab"
          aria-selected={activeTab === "lookups"}
          aria-controls="settings-panel-lookups"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "lookups"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("lookups")}
        >
          Lookup tables
        </button>
        <button
          id="settings-tab-site"
          type="button"
          role="tab"
          aria-selected={activeTab === "site"}
          aria-controls="settings-panel-site"
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "site"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("site")}
        >
          Site settings
        </button>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            statusMessage.tone === "success"
              ? "border-green-300 bg-green-50 text-green-900"
              : "border-red-300 bg-red-50 text-red-900"
          }`}
          role="status"
          aria-live="polite"
        >
          {statusMessage.message}
        </div>
      )}

      <section
        id="settings-panel-lookups"
        role="tabpanel"
        aria-labelledby="settings-tab-lookups"
        hidden={activeTab !== "lookups"}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Lookup tables management</CardTitle>
            <CardDescription>
              Manage categories, therapeutic areas, and manufacturers used
              across product records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
                <CardDescription>
                  Create, edit, and delete product categories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="grid gap-3 md:grid-cols-4"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    const name = newCategory.name.trim();
                    if (!name) {
                      setStatusMessage({
                        tone: "error",
                        message: "Category name is required.",
                      });
                      return;
                    }

                    const created = await withActionFeedback(
                      "category-create",
                      () =>
                        createCategory({
                          name,
                          nameAr: newCategory.nameAr.trim() || undefined,
                          slug: newCategory.slug.trim() || undefined,
                        }),
                      "Category created successfully.",
                    );

                    if (created) {
                      setNewCategory(emptyLookupFormState());
                    }
                  }}
                >
                  <Input
                    value={newCategory.name}
                    onChange={(event) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Category name"
                    aria-label="New category name"
                    disabled={pendingAction === "category-create"}
                  />
                  <Input
                    value={newCategory.nameAr}
                    onChange={(event) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        nameAr: event.target.value,
                      }))
                    }
                    placeholder="Arabic name (optional)"
                    aria-label="New category Arabic name"
                    disabled={pendingAction === "category-create"}
                  />
                  <Input
                    value={newCategory.slug}
                    onChange={(event) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        slug: event.target.value,
                      }))
                    }
                    placeholder="Slug (optional)"
                    aria-label="New category slug"
                    disabled={pendingAction === "category-create"}
                  />
                  <Button
                    type="submit"
                    disabled={pendingAction === "category-create"}
                  >
                    {pendingAction === "category-create" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add category"
                    )}
                  </Button>
                </form>

                <div className="overflow-x-auto rounded-lg border border-border/70">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left">
                        <th className="px-3 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Arabic</th>
                        <th className="px-3 py-2 font-medium">Slug</th>
                        <th className="px-3 py-2 font-medium">Products</th>
                        <th className="px-3 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => {
                        const isEditing = editingCategoryId === category.id;
                        const updateKey = `category-update-${category.id}`;
                        const deleteKey = `category-delete-${category.id}`;
                        const deleting = pendingAction === deleteKey;
                        const updating = pendingAction === updateKey;

                        return (
                          <tr
                            key={category.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingCategory.name}
                                  onChange={(event) =>
                                    setEditingCategory((prev) => ({
                                      ...prev,
                                      name: event.target.value,
                                    }))
                                  }
                                  aria-label={`Category name for ${category.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                category.name
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingCategory.nameAr}
                                  onChange={(event) =>
                                    setEditingCategory((prev) => ({
                                      ...prev,
                                      nameAr: event.target.value,
                                    }))
                                  }
                                  aria-label={`Category Arabic name for ${category.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                category.nameAr || "-"
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingCategory.slug}
                                  onChange={(event) =>
                                    setEditingCategory((prev) => ({
                                      ...prev,
                                      slug: event.target.value,
                                    }))
                                  }
                                  aria-label={`Category slug for ${category.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                category.slug
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {category.productCount}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      const name = editingCategory.name.trim();
                                      const slug = editingCategory.slug.trim();

                                      if (!name || !slug) {
                                        setStatusMessage({
                                          tone: "error",
                                          message:
                                            "Name and slug are required while editing a category.",
                                        });
                                        return;
                                      }

                                      const updated = await withActionFeedback(
                                        updateKey,
                                        () =>
                                          updateCategory({
                                            id: category.id,
                                            name,
                                            nameAr:
                                              editingCategory.nameAr.trim() ||
                                              null,
                                            slug,
                                          }),
                                        "Category updated successfully.",
                                      );

                                      if (updated) {
                                        setEditingCategoryId(null);
                                        setEditingCategory(
                                          emptyLookupFormState(),
                                        );
                                      }
                                    }}
                                    disabled={updating}
                                  >
                                    {updating ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCategoryId(null);
                                      setEditingCategory(
                                        emptyLookupFormState(),
                                      );
                                    }}
                                    disabled={updating}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : deleteConfirmKey === deleteKey ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={async () => {
                                      const removed = await withActionFeedback(
                                        deleteKey,
                                        () => deleteCategory(category.id),
                                        "Category deleted successfully.",
                                      );

                                      if (removed) {
                                        setDeleteConfirmKey(null);
                                      }
                                    }}
                                    disabled={deleting}
                                  >
                                    {deleting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Confirm"
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteConfirmKey(null)}
                                    disabled={deleting}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCategoryId(category.id);
                                      setEditingCategory({
                                        name: category.name,
                                        nameAr: category.nameAr ?? "",
                                        slug: category.slug,
                                      });
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() =>
                                      setDeleteConfirmKey(deleteKey)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Therapeutic areas</CardTitle>
                <CardDescription>
                  Create, edit, and delete therapeutic areas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="grid gap-3 md:grid-cols-4"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    const name = newTherapeuticArea.name.trim();
                    if (!name) {
                      setStatusMessage({
                        tone: "error",
                        message: "Therapeutic area name is required.",
                      });
                      return;
                    }

                    const created = await withActionFeedback(
                      "therapeutic-area-create",
                      () =>
                        createTherapeuticArea({
                          name,
                          nameAr: newTherapeuticArea.nameAr.trim() || undefined,
                          slug: newTherapeuticArea.slug.trim() || undefined,
                        }),
                      "Therapeutic area created successfully.",
                    );

                    if (created) {
                      setNewTherapeuticArea(emptyLookupFormState());
                    }
                  }}
                >
                  <Input
                    value={newTherapeuticArea.name}
                    onChange={(event) =>
                      setNewTherapeuticArea((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Therapeutic area name"
                    aria-label="New therapeutic area name"
                    disabled={pendingAction === "therapeutic-area-create"}
                  />
                  <Input
                    value={newTherapeuticArea.nameAr}
                    onChange={(event) =>
                      setNewTherapeuticArea((prev) => ({
                        ...prev,
                        nameAr: event.target.value,
                      }))
                    }
                    placeholder="Arabic name (optional)"
                    aria-label="New therapeutic area Arabic name"
                    disabled={pendingAction === "therapeutic-area-create"}
                  />
                  <Input
                    value={newTherapeuticArea.slug}
                    onChange={(event) =>
                      setNewTherapeuticArea((prev) => ({
                        ...prev,
                        slug: event.target.value,
                      }))
                    }
                    placeholder="Slug (optional)"
                    aria-label="New therapeutic area slug"
                    disabled={pendingAction === "therapeutic-area-create"}
                  />
                  <Button
                    type="submit"
                    disabled={pendingAction === "therapeutic-area-create"}
                  >
                    {pendingAction === "therapeutic-area-create" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add therapeutic area"
                    )}
                  </Button>
                </form>

                <div className="overflow-x-auto rounded-lg border border-border/70">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left">
                        <th className="px-3 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Arabic</th>
                        <th className="px-3 py-2 font-medium">Slug</th>
                        <th className="px-3 py-2 font-medium">Products</th>
                        <th className="px-3 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {therapeuticAreas.map((area) => {
                        const isEditing = editingTherapeuticAreaId === area.id;
                        const updateKey = `therapeutic-area-update-${area.id}`;
                        const deleteKey = `therapeutic-area-delete-${area.id}`;
                        const deleting = pendingAction === deleteKey;
                        const updating = pendingAction === updateKey;

                        return (
                          <tr
                            key={area.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingTherapeuticArea.name}
                                  onChange={(event) =>
                                    setEditingTherapeuticArea((prev) => ({
                                      ...prev,
                                      name: event.target.value,
                                    }))
                                  }
                                  aria-label={`Therapeutic area name for ${area.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                area.name
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingTherapeuticArea.nameAr}
                                  onChange={(event) =>
                                    setEditingTherapeuticArea((prev) => ({
                                      ...prev,
                                      nameAr: event.target.value,
                                    }))
                                  }
                                  aria-label={`Therapeutic area Arabic name for ${area.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                area.nameAr || "-"
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingTherapeuticArea.slug}
                                  onChange={(event) =>
                                    setEditingTherapeuticArea((prev) => ({
                                      ...prev,
                                      slug: event.target.value,
                                    }))
                                  }
                                  aria-label={`Therapeutic area slug for ${area.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                area.slug
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {area.productCount}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      const name =
                                        editingTherapeuticArea.name.trim();
                                      const slug =
                                        editingTherapeuticArea.slug.trim();

                                      if (!name || !slug) {
                                        setStatusMessage({
                                          tone: "error",
                                          message:
                                            "Name and slug are required while editing a therapeutic area.",
                                        });
                                        return;
                                      }

                                      const updated = await withActionFeedback(
                                        updateKey,
                                        () =>
                                          updateTherapeuticArea({
                                            id: area.id,
                                            name,
                                            nameAr:
                                              editingTherapeuticArea.nameAr.trim() ||
                                              null,
                                            slug,
                                          }),
                                        "Therapeutic area updated successfully.",
                                      );

                                      if (updated) {
                                        setEditingTherapeuticAreaId(null);
                                        setEditingTherapeuticArea(
                                          emptyLookupFormState(),
                                        );
                                      }
                                    }}
                                    disabled={updating}
                                  >
                                    {updating ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingTherapeuticAreaId(null);
                                      setEditingTherapeuticArea(
                                        emptyLookupFormState(),
                                      );
                                    }}
                                    disabled={updating}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : deleteConfirmKey === deleteKey ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={async () => {
                                      const removed = await withActionFeedback(
                                        deleteKey,
                                        () => deleteTherapeuticArea(area.id),
                                        "Therapeutic area deleted successfully.",
                                      );

                                      if (removed) {
                                        setDeleteConfirmKey(null);
                                      }
                                    }}
                                    disabled={deleting}
                                  >
                                    {deleting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Confirm"
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteConfirmKey(null)}
                                    disabled={deleting}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingTherapeuticAreaId(area.id);
                                      setEditingTherapeuticArea({
                                        name: area.name,
                                        nameAr: area.nameAr ?? "",
                                        slug: area.slug,
                                      });
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() =>
                                      setDeleteConfirmKey(deleteKey)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Manufacturers</CardTitle>
                <CardDescription>
                  Create, edit, and delete manufacturers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="grid gap-3 md:grid-cols-4"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    const name = newManufacturer.name.trim();
                    if (!name) {
                      setStatusMessage({
                        tone: "error",
                        message: "Manufacturer name is required.",
                      });
                      return;
                    }

                    const created = await withActionFeedback(
                      "manufacturer-create",
                      () =>
                        createManufacturer({
                          name,
                          slug: newManufacturer.slug.trim() || undefined,
                          country: newManufacturer.country.trim() || undefined,
                        }),
                      "Manufacturer created successfully.",
                    );

                    if (created) {
                      setNewManufacturer(emptyManufacturerFormState());
                    }
                  }}
                >
                  <Input
                    value={newManufacturer.name}
                    onChange={(event) =>
                      setNewManufacturer((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Manufacturer name"
                    aria-label="New manufacturer name"
                    disabled={pendingAction === "manufacturer-create"}
                  />
                  <Input
                    value={newManufacturer.slug}
                    onChange={(event) =>
                      setNewManufacturer((prev) => ({
                        ...prev,
                        slug: event.target.value,
                      }))
                    }
                    placeholder="Slug (optional)"
                    aria-label="New manufacturer slug"
                    disabled={pendingAction === "manufacturer-create"}
                  />
                  <Input
                    value={newManufacturer.country}
                    onChange={(event) =>
                      setNewManufacturer((prev) => ({
                        ...prev,
                        country: event.target.value,
                      }))
                    }
                    placeholder="Country (optional)"
                    aria-label="New manufacturer country"
                    disabled={pendingAction === "manufacturer-create"}
                  />
                  <Button
                    type="submit"
                    disabled={pendingAction === "manufacturer-create"}
                  >
                    {pendingAction === "manufacturer-create" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add manufacturer"
                    )}
                  </Button>
                </form>

                <div className="overflow-x-auto rounded-lg border border-border/70">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left">
                        <th className="px-3 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Slug</th>
                        <th className="px-3 py-2 font-medium">Country</th>
                        <th className="px-3 py-2 font-medium">Products</th>
                        <th className="px-3 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manufacturers.map((manufacturer) => {
                        const isEditing =
                          editingManufacturerId === manufacturer.id;
                        const updateKey = `manufacturer-update-${manufacturer.id}`;
                        const deleteKey = `manufacturer-delete-${manufacturer.id}`;
                        const deleting = pendingAction === deleteKey;
                        const updating = pendingAction === updateKey;

                        return (
                          <tr
                            key={manufacturer.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingManufacturer.name}
                                  onChange={(event) =>
                                    setEditingManufacturer((prev) => ({
                                      ...prev,
                                      name: event.target.value,
                                    }))
                                  }
                                  aria-label={`Manufacturer name for ${manufacturer.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                manufacturer.name
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingManufacturer.slug}
                                  onChange={(event) =>
                                    setEditingManufacturer((prev) => ({
                                      ...prev,
                                      slug: event.target.value,
                                    }))
                                  }
                                  aria-label={`Manufacturer slug for ${manufacturer.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                manufacturer.slug
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <Input
                                  value={editingManufacturer.country}
                                  onChange={(event) =>
                                    setEditingManufacturer((prev) => ({
                                      ...prev,
                                      country: event.target.value,
                                    }))
                                  }
                                  aria-label={`Manufacturer country for ${manufacturer.name}`}
                                  disabled={updating}
                                />
                              ) : (
                                manufacturer.country || "-"
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {manufacturer.productCount}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      const name =
                                        editingManufacturer.name.trim();
                                      const slug =
                                        editingManufacturer.slug.trim();

                                      if (!name || !slug) {
                                        setStatusMessage({
                                          tone: "error",
                                          message:
                                            "Name and slug are required while editing a manufacturer.",
                                        });
                                        return;
                                      }

                                      const updated = await withActionFeedback(
                                        updateKey,
                                        () =>
                                          updateManufacturer({
                                            id: manufacturer.id,
                                            name,
                                            slug,
                                            country:
                                              editingManufacturer.country.trim() ||
                                              null,
                                          }),
                                        "Manufacturer updated successfully.",
                                      );

                                      if (updated) {
                                        setEditingManufacturerId(null);
                                        setEditingManufacturer(
                                          emptyManufacturerFormState(),
                                        );
                                      }
                                    }}
                                    disabled={updating}
                                  >
                                    {updating ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingManufacturerId(null);
                                      setEditingManufacturer(
                                        emptyManufacturerFormState(),
                                      );
                                    }}
                                    disabled={updating}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : deleteConfirmKey === deleteKey ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={async () => {
                                      const removed = await withActionFeedback(
                                        deleteKey,
                                        () =>
                                          deleteManufacturer(manufacturer.id),
                                        "Manufacturer deleted successfully.",
                                      );

                                      if (removed) {
                                        setDeleteConfirmKey(null);
                                      }
                                    }}
                                    disabled={deleting}
                                  >
                                    {deleting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Confirm"
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteConfirmKey(null)}
                                    disabled={deleting}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingManufacturerId(manufacturer.id);
                                      setEditingManufacturer({
                                        name: manufacturer.name,
                                        slug: manufacturer.slug,
                                        country: manufacturer.country ?? "",
                                      });
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() =>
                                      setDeleteConfirmKey(deleteKey)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </section>

      <section
        id="settings-panel-site"
        role="tabpanel"
        aria-labelledby="settings-tab-site"
        hidden={activeTab !== "site"}
      >
        <Card>
          <CardHeader>
            <CardTitle>Site settings</CardTitle>
            <CardDescription>
              Configure branding, contact details, and default SEO values used
              across the website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();

                const saved = await withActionFeedback(
                  "site-settings-save",
                  async () => {
                    const result = await updateSiteSettings({
                      siteName: siteSettings.siteName,
                      siteTagline: siteSettings.siteTagline,
                      contactEmail: siteSettings.contactEmail,
                      contactPhone: siteSettings.contactPhone,
                      contactAddress: siteSettings.contactAddress,
                      seoDefaultTitle: siteSettings.seoDefaultTitle,
                      seoDefaultDescription: siteSettings.seoDefaultDescription,
                    });

                    if (result.success && result.data) {
                      const normalized = toSiteSettingsFormState(result.data);
                      setSiteSettings(normalized);
                      setSiteBaseline(normalized);
                    }

                    return result;
                  },
                  "Site settings saved successfully.",
                );

                if (!saved) {
                  return;
                }
              }}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site name</Label>
                  <Input
                    id="site-name"
                    value={siteSettings.siteName}
                    onChange={(event) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        siteName: event.target.value,
                      }))
                    }
                    placeholder="Damira Pharma"
                    disabled={pendingAction === "site-settings-save"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-tagline">Site tagline</Label>
                  <Input
                    id="site-tagline"
                    value={siteSettings.siteTagline}
                    onChange={(event) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        siteTagline: event.target.value,
                      }))
                    }
                    placeholder="Trusted pharmaceutical solutions"
                    disabled={pendingAction === "site-settings-save"}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(event) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        contactEmail: event.target.value,
                      }))
                    }
                    placeholder="info@damira.com"
                    disabled={pendingAction === "site-settings-save"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact phone</Label>
                  <Input
                    id="contact-phone"
                    value={siteSettings.contactPhone}
                    onChange={(event) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        contactPhone: event.target.value,
                      }))
                    }
                    placeholder="+20 000 000 000"
                    disabled={pendingAction === "site-settings-save"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-address">Contact address</Label>
                <Textarea
                  id="contact-address"
                  value={siteSettings.contactAddress}
                  onChange={(event) =>
                    setSiteSettings((prev) => ({
                      ...prev,
                      contactAddress: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Office address"
                  disabled={pendingAction === "site-settings-save"}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seo-default-title">Default SEO title</Label>
                  <Input
                    id="seo-default-title"
                    value={siteSettings.seoDefaultTitle}
                    onChange={(event) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        seoDefaultTitle: event.target.value,
                      }))
                    }
                    placeholder="Default metadata title"
                    disabled={pendingAction === "site-settings-save"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-default-description">
                    Default SEO description
                  </Label>
                  <Textarea
                    id="seo-default-description"
                    value={siteSettings.seoDefaultDescription}
                    onChange={(event) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        seoDefaultDescription: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Default metadata description"
                    disabled={pendingAction === "site-settings-save"}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={
                    !siteSettingsDirty || pendingAction === "site-settings-save"
                  }
                >
                  {pendingAction === "site-settings-save" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
