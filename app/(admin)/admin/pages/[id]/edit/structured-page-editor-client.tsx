"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { LanguageTabs } from "@/components/admin/language-tabs";
import { PageHeader } from "@/components/admin/page-header";
import { VisualJsonFieldEditor } from "@/components/admin/visual-json-field-editor";
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
import { Select, SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  initializePageContent,
  updatePageContent,
} from "@/lib/actions/content";
import type { Locale } from "@/i18n/config";
import type { GetPageContentResponse } from "@/lib/content/types";
import type {
  FieldDefinition,
  PageDefinition,
} from "@/lib/content/page-definitions";

interface StructuredPageEditorClientProps {
  pageKey: string;
  locale: Locale;
  pageDefinition: PageDefinition;
  initialContent: GetPageContentResponse | null;
  sectionTemplates: Record<string, unknown>;
}

interface StructuredFormState {
  title: string;
  metaTitle: string;
  metaDescription: string;
  sections: Record<string, Record<string, string>>;
}

function fieldValueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  }

  return String(value);
}

function buildInitialState(
  pageDefinition: PageDefinition,
  content: GetPageContentResponse | null,
  sectionTemplates: Record<string, unknown>,
): StructuredFormState {
  const sections: Record<string, Record<string, string>> = {};

  for (const section of pageDefinition.sections) {
    sections[section.sectionKey] = {};
    const sectionData = content?.sections?.[section.sectionKey];
    const sectionTemplate = sectionTemplates[section.sectionKey];

    for (const fieldKey of Object.keys(section.fields)) {
      const raw =
        sectionData?.[fieldKey] ??
        (fieldKey === "data" ? sectionTemplate : undefined);
      sections[section.sectionKey][fieldKey] = fieldValueToString(raw);
    }
  }

  return {
    title: content?.title ?? pageDefinition.label,
    metaTitle: content?.metaTitle ?? "",
    metaDescription: content?.metaDescription ?? "",
    sections,
  };
}

function renderFieldInput(
  fieldKey: string,
  fieldDef: FieldDefinition,
  value: string,
  sectionTemplate: unknown,
  onChange: (value: string) => void,
): ReactElement {
  if (fieldDef.type === "textarea") {
    return (
      <Textarea
        id={fieldKey}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
      />
    );
  }

  if (fieldDef.type === "json") {
    return (
      <VisualJsonFieldEditor
        id={fieldKey}
        value={value}
        onChange={onChange}
        placeholder={fieldDef.placeholder}
        templateValue={sectionTemplate}
      />
    );
  }

  if (fieldDef.type === "boolean") {
    return (
      <Select
        id={fieldKey}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <SelectOption value="">Not set</SelectOption>
        <SelectOption value="true">True</SelectOption>
        <SelectOption value="false">False</SelectOption>
      </Select>
    );
  }

  if (fieldDef.type === "number") {
    return (
      <Input
        id={fieldKey}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <Input
      id={fieldKey}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={fieldDef.placeholder}
    />
  );
}

export function StructuredPageEditorClient({
  pageKey,
  locale,
  pageDefinition,
  initialContent,
  sectionTemplates,
}: StructuredPageEditorClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, startSaving] = useTransition();
  const [isInitializing, startInitializing] = useTransition();

  const initialState = useMemo(
    () => buildInitialState(pageDefinition, initialContent, sectionTemplates),
    [pageDefinition, initialContent, sectionTemplates],
  );

  const [formState, setFormState] = useState<StructuredFormState>(initialState);
  const [baselineState, setBaselineState] =
    useState<StructuredFormState>(initialState);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(baselineState);
  }, [formState, baselineState]);

  const setFieldValue = (
    sectionKey: string,
    fieldKey: string,
    nextValue: string,
  ) => {
    setFormState((previous) => ({
      ...previous,
      sections: {
        ...previous.sections,
        [sectionKey]: {
          ...previous.sections[sectionKey],
          [fieldKey]: nextValue,
        },
      },
    }));
  };

  const handleLocaleChange = (nextLocale: "en" | "ar") => {
    if (nextLocale === locale) {
      return;
    }

    if (hasUnsavedChanges) {
      const ok = window.confirm(
        "You have unsaved changes. Switch locale and discard local edits?",
      );
      if (!ok) {
        return;
      }
    }

    router.push(`/admin/pages/${pageKey}/edit?locale=${nextLocale}`);
  };

  const handleCancel = () => {
    setFormState(baselineState);
  };

  const handleInitialize = () => {
    startInitializing(async () => {
      const result = await initializePageContent(pageKey, locale);

      if (!result.success) {
        toast({
          title: "Initialization failed",
          description: result.message,
          variant: "error",
        });
        return;
      }

      toast({
        title: "Page initialized",
        description: `Created initial content for ${pageKey}/${locale}`,
        variant: "success",
      });

      router.refresh();
    });
  };

  const handleSave = () => {
    startSaving(async () => {
      for (const section of pageDefinition.sections) {
        const sectionValues = formState.sections[section.sectionKey] ?? {};

        for (const [fieldKey, fieldDef] of Object.entries(section.fields)) {
          if (fieldDef.type !== "json") {
            continue;
          }

          const rawValue = sectionValues[fieldKey] ?? "";
          const trimmed = rawValue.trim();

          if (trimmed.length === 0) {
            continue;
          }

          try {
            JSON.parse(trimmed);
          } catch {
            toast({
              title: "Invalid JSON",
              description: `${section.label} / ${fieldDef.label} contains invalid JSON.`,
              variant: "error",
            });
            return;
          }
        }
      }

      const sections: Record<string, Record<string, string | null>> = {};

      for (const [sectionKey, fields] of Object.entries(formState.sections)) {
        sections[sectionKey] = {};

        for (const [fieldKey, rawValue] of Object.entries(fields)) {
          const trimmed = rawValue.trim();
          sections[sectionKey][fieldKey] = trimmed === "" ? null : rawValue;
        }
      }

      const result = await updatePageContent({
        pageKey,
        locale,
        title: formState.title.trim() || pageDefinition.label,
        metaTitle: formState.metaTitle.trim() || undefined,
        metaDescription: formState.metaDescription.trim() || undefined,
        sections,
      });

      if (!result.success) {
        toast({
          title: "Save failed",
          description: result.message,
          variant: "error",
        });
        return;
      }

      toast({
        title: "Saved",
        description: `${pageDefinition.label} (${locale.toUpperCase()}) was updated successfully`,
        variant: "success",
      });

      setBaselineState(formState);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${pageDefinition.label}`}
        description={`Structured editor for ${pageKey} (${locale.toUpperCase()})`}
        actions={
          <Link href="/admin/pages">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Pages
            </Button>
          </Link>
        }
      />

      <LanguageTabs
        currentLanguage={locale}
        onLanguageChange={handleLocaleChange}
        unsavedChanges={{
          en: locale === "en" ? hasUnsavedChanges : false,
          ar: locale === "ar" ? hasUnsavedChanges : false,
        }}
      />

      {!initialContent && (
        <Card>
          <CardHeader>
            <CardTitle>Page Not Initialized</CardTitle>
            <CardDescription>
              No content exists yet for {pageKey}/{locale}. Initialize it first,
              then edit fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInitialize} disabled={isInitializing}>
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Page Content"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Page Metadata</CardTitle>
          <CardDescription>
            Global page-level fields for this locale.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="page-title" required>
              Page Title
            </Label>
            <Input
              id="page-title"
              value={formState.title}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={formState.metaTitle}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  metaTitle: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Input
              id="meta-description"
              value={formState.metaDescription}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  metaDescription: event.target.value,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {pageDefinition.sections.map((section) => (
          <Card key={section.sectionKey}>
            <CardHeader>
              <CardTitle>{section.label}</CardTitle>
              <CardDescription>
                {section.description ??
                  `Fixed section key: ${section.sectionKey}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {Object.entries(section.fields).map(([fieldKey, fieldDef]) => (
                <div
                  key={fieldKey}
                  className={
                    fieldDef.type === "textarea" || fieldDef.type === "json"
                      ? "space-y-2 md:col-span-2"
                      : "space-y-2"
                  }
                >
                  <Label
                    htmlFor={`${section.sectionKey}-${fieldKey}`}
                    required={fieldDef.required}
                  >
                    {fieldDef.label}
                  </Label>
                  {renderFieldInput(
                    `${section.sectionKey}-${fieldKey}`,
                    fieldDef,
                    formState.sections[section.sectionKey]?.[fieldKey] ?? "",
                    sectionTemplates[section.sectionKey],
                    (nextValue) =>
                      setFieldValue(section.sectionKey, fieldKey, nextValue),
                  )}
                  {fieldDef.description && (
                    <p className="text-xs text-muted-foreground">
                      {fieldDef.description}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving || !hasUnsavedChanges}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
