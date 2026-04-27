"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";

import { DynamicArrayField } from "@/components/admin/dynamic-array-field";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FeaturesSectionData {
  title: string;
  layout: "list" | "grid";
  features: Feature[];
}

interface FeaturesSectionEditorProps {
  language?: "en" | "ar";
  section: {
    id: string;
    type: string;
    data: Record<string, any>;
  };
  onSave: (data: FeaturesSectionData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
}

// Common emoji picker for quick access
const EMOJI_PRESETS = [
  "🔬",
  "🏥",
  "💊",
  "⚕️",
  "🧬",
  "📊",
  "🎯",
  "⭐",
  "🚀",
  "💡",
  "🔒",
  "🌍",
];

/**
 * Features Section Editor
 * Handles editing of features section with icons and descriptions.
 */
export function FeaturesSectionEditor({
  section,
  onSave,
  isLoading = false,
  onClose,
  language = "en",
}: FeaturesSectionEditorProps) {
  // Validate section type
  if (section.type !== "FEATURES") {
    return null;
  }

  const initialData = section.data as FeaturesSectionData;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [layout, setLayout] = useState<"list" | "grid">(
    initialData?.layout || "list",
  );
  const [features, setFeatures] = useState<Feature[]>(
    initialData?.features || [],
  );
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<
    number | null
  >(null);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (features.length === 0)
      errs.features = "At least one feature is required";
    return errs;
  }, [title, features]);

  // Handle save
  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    await onSave({
      title: title.trim(),
      layout,
      features,
    });
  };

  // Feature management
  const addFeature = () => {
    if (features.length < 8) {
      setFeatures([
        ...features,
        {
          id: uuidv4(),
          icon: "⭐",
          title: "",
          description: "",
        },
      ]);
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    setSelectedFeatureIndex(null);
  };

  const updateFeature = (index: number, updates: Partial<Feature>) => {
    setFeatures(
      features.map((feature, i) =>
        i === index ? { ...feature, ...updates } : feature,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="features-title" className="text-sm font-medium">
          Title
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="features-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Our Capabilities"
          disabled={isLoading}
          className="mt-1"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Layout */}
      <div>
        <Label htmlFor="features-layout" className="text-sm font-medium">
          Layout
        </Label>
        <Select
          id="features-layout"
          value={layout}
          onChange={(e) => setLayout(e.target.value as "list" | "grid")}
          disabled={isLoading}
          className="mt-1"
        >
          <SelectOption value="list">List Layout</SelectOption>
          <SelectOption value="grid">Grid Layout</SelectOption>
        </Select>
      </div>

      {/* Features */}
      <DynamicArrayField
        items={features}
        onAdd={addFeature}
        onRemove={removeFeature}
        renderItem={(item: Record<string, any>, index: number) => (
          <div className="space-y-3">
            <div className="flex gap-2">
              {/* Icon Selector */}
              <div className="flex-shrink-0">
                <Label className="text-xs text-muted-foreground">Icon</Label>
                <div className="mt-1 text-2xl cursor-pointer hover:bg-muted p-2 rounded transition-colors">
                  <select
                    value={item.icon}
                    onChange={(e) =>
                      updateFeature(index, { icon: e.target.value })
                    }
                    disabled={isLoading}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFeatureIndex(
                        selectedFeatureIndex === index ? null : index,
                      )
                    }
                    className="text-2xl"
                  >
                    {item.icon}
                  </button>
                </div>
              </div>

              {/* Title and Description */}
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updateFeature(index, { title: e.target.value })
                  }
                  placeholder="Feature Name"
                  disabled={isLoading}
                  className="mt-1 mb-2 text-sm"
                />
                <Label className="text-xs text-muted-foreground">
                  Description
                </Label>
                <div className="mt-1">
                  <TiptapEditor
                    value={item.description}
                    onChange={(html) =>
                      updateFeature(index, { description: html })
                    }
                    placeholder="Feature Description"
                    maxHeight="180px"
                    mediaPickerEnabled={false}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Emoji Picker */}
            {selectedFeatureIndex === index && (
              <div className="bg-muted/50 p-3 rounded-lg grid grid-cols-6 gap-2">
                {EMOJI_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      updateFeature(index, { icon: emoji });
                      setSelectedFeatureIndex(null);
                    }}
                    className="text-2xl p-1 rounded hover:bg-background transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        label="Features"
        help="Add up to 8 features"
        maxItems={8}
        addLabel="Add Feature"
        disabled={isLoading}
      />
      {errors.features && (
        <p className="text-xs text-red-500 mt-1">{errors.features}</p>
      )}

      {/* Preview */}
      {features.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Preview
          </p>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">{title || "Section Title"}</h3>
            {layout === "list" ? (
              <div className="space-y-2 mt-4">
                {features.slice(0, 3).map((feature) => (
                  <div
                    key={feature.id}
                    className="flex gap-3 p-2 rounded border border-border"
                  >
                    <div className="text-2xl">{feature.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {features.slice(0, 4).map((feature) => (
                  <div
                    key={feature.id}
                    className="p-3 rounded border border-border text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {features.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                + {features.length - 3} more features
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t border-border mt-6">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isLoading || Object.keys(errors).length > 0}
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default FeaturesSectionEditor;
