"use client";

import { useMemo } from "react";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonArray = JsonValue[];

interface JsonObject {
  [key: string]: JsonValue;
}

interface VisualJsonFieldEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  templateValue?: unknown;
}

interface JsonNodeEditorProps {
  label?: string;
  rawKey?: string;
  value: JsonValue;
  template?: JsonValue;
  depth: number;
  onChange: (next: JsonValue) => void;
  onRemove?: () => void;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function humanizeKey(key: string): string {
  const withSpaces = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]/g, " ");

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function toJsonValue(input: unknown): JsonValue {
  if (
    typeof input === "string" ||
    typeof input === "number" ||
    typeof input === "boolean" ||
    input === null
  ) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => toJsonValue(item));
  }

  if (typeof input === "object" && input !== null) {
    const output: JsonObject = {};
    for (const [key, value] of Object.entries(input)) {
      output[key] = toJsonValue(value);
    }
    return output;
  }

  return "";
}

function normalizeByTemplate(
  currentValue: JsonValue | undefined,
  templateValue: JsonValue,
): JsonValue {
  if (Array.isArray(templateValue)) {
    const currentArray = Array.isArray(currentValue) ? currentValue : [];
    if (templateValue.length === 0) {
      return currentArray;
    }

    const itemTemplate = templateValue[0];
    return currentArray.map((item) => normalizeByTemplate(item, itemTemplate));
  }

  if (isJsonObject(templateValue)) {
    const currentObject = isJsonObject(currentValue) ? currentValue : {};
    const output: JsonObject = {};
    const keys = new Set<string>([
      ...Object.keys(templateValue),
      ...Object.keys(currentObject),
    ]);

    for (const key of keys) {
      const hasTemplateKey = key in templateValue;
      const templateChild = templateValue[key];

      if (hasTemplateKey && templateChild !== undefined) {
        output[key] = normalizeByTemplate(currentObject[key], templateChild);
      } else {
        output[key] = currentObject[key] ?? "";
      }
    }

    return output;
  }

  if (templateValue === null) {
    if (
      currentValue === null ||
      typeof currentValue === "string" ||
      typeof currentValue === "number" ||
      typeof currentValue === "boolean"
    ) {
      return currentValue;
    }

    return "";
  }

  if (typeof templateValue === "number") {
    return typeof currentValue === "number" ? currentValue : 0;
  }

  if (typeof templateValue === "boolean") {
    return typeof currentValue === "boolean" ? currentValue : false;
  }

  return typeof currentValue === "string" ? currentValue : "";
}

function parseObjectFromString(raw: string): {
  value: JsonObject | null;
  error: string | null;
} {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { value: {}, error: null };
  }

  try {
    const parsed = JSON.parse(trimmed) as JsonValue;
    if (!isJsonObject(parsed)) {
      return {
        value: null,
        error: "Section data must be an object.",
      };
    }

    return { value: parsed, error: null };
  } catch {
    return {
      value: null,
      error: "Stored section data is invalid and must be reset.",
    };
  }
}

function isLikelyImageField(key: string | undefined): boolean {
  if (!key) {
    return false;
  }

  return /(image|logo|icon|photo|cover|thumbnail|banner|background|src|url)/i.test(
    key,
  );
}

function isImagePath(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("/") ||
    /\.(png|jpe?g|webp|gif|svg)$/.test(normalized)
  );
}

function toDisplayString(value: JsonPrimitive): string {
  if (value === null) {
    return "";
  }

  return String(value);
}

function emptyFromTemplate(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return [];
  }

  if (isJsonObject(value)) {
    const output: JsonObject = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = emptyFromTemplate(item);
    }
    return output;
  }

  if (typeof value === "number") {
    return 0;
  }

  if (typeof value === "boolean") {
    return false;
  }

  return "";
}

function PrimitiveEditor({
  label,
  rawKey,
  value,
  template,
  onChange,
  onRemove,
}: Omit<JsonNodeEditorProps, "value"> & { value: JsonPrimitive }) {
  const isBoolean =
    typeof template === "boolean" || typeof value === "boolean";
  const isNumber = typeof template === "number" || typeof value === "number";
  const isImageField = isLikelyImageField(rawKey);
  const displayValue = toDisplayString(value as JsonPrimitive);

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label || "Value"}
        </Label>
        {onRemove && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="h-7 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {isBoolean ? (
        <Select
          value={value ? "true" : "false"}
          onChange={(event) => onChange(event.target.value === "true")}
        >
          <SelectOption value="true">True</SelectOption>
          <SelectOption value="false">False</SelectOption>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            value={displayValue}
            type={isNumber ? "number" : "text"}
            onChange={(event) => {
              if (isNumber) {
                const parsed = Number(event.target.value);
                onChange(Number.isFinite(parsed) ? parsed : 0);
                return;
              }

              onChange(event.target.value);
            }}
            placeholder={isImageField ? "Image URL or /public path" : undefined}
          />

          {isImageField && typeof value === "string" && isImagePath(value) && (
            <div className="overflow-hidden rounded-md border border-border/60 bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={label || rawKey || "Preview"}
                className="h-32 w-full object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArrayEditor({
  label,
  rawKey,
  value,
  template,
  depth,
  onChange,
  onRemove,
}: Omit<JsonNodeEditorProps, "value"> & { value: JsonArray }) {
  const itemTemplate = Array.isArray(template) ? template[0] : value[0];

  const addItem = () => {
    const nextItem = itemTemplate ? emptyFromTemplate(itemTemplate) : "";
    onChange([...value, nextItem]);
  };

  const updateItem = (index: number, next: JsonValue) => {
    const nextArray = value.map((item, itemIndex) =>
      itemIndex === index ? next : item,
    );
    onChange(nextArray);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label || "Array"}
        </Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addItem}
            className="h-7 gap-1 px-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </Button>
          {onRemove && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">No items yet.</p>
      ) : (
        <div className="space-y-3">
          {value.map((item, index) => (
            <JsonNodeEditor
              key={`${depth}-${index}`}
              label={`Item ${index + 1}`}
              rawKey={rawKey}
              value={item}
              template={itemTemplate}
              depth={depth + 1}
              onChange={(next) => updateItem(index, next)}
              onRemove={() => removeItem(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ObjectEditor({
  label,
  value,
  template,
  depth,
  onChange,
  onRemove,
}: Omit<JsonNodeEditorProps, "value"> & { value: JsonObject }) {
  const updateField = (fieldKey: string, next: JsonValue) => {
    onChange({
      ...value,
      [fieldKey]: next,
    });
  };

  const removeField = (fieldKey: string) => {
    const next = { ...value };
    delete next[fieldKey];
    onChange(next);
  };

  return (
    <div className={cn("space-y-3 rounded-lg border border-border/60 bg-background p-3", depth > 0 && "bg-muted/10")}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label || "Object"}
        </Label>
        <div className="flex items-center gap-1">
          {onRemove && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(value).map(([fieldKey, itemValue]) => (
          <JsonNodeEditor
            key={fieldKey}
            label={humanizeKey(fieldKey)}
            rawKey={fieldKey}
            value={itemValue}
            template={isJsonObject(template) ? template[fieldKey] : undefined}
            depth={depth + 1}
            onChange={(next) => updateField(fieldKey, next)}
            onRemove={onRemove ? () => removeField(fieldKey) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function JsonNodeEditor(props: JsonNodeEditorProps) {
  if (Array.isArray(props.value)) {
    return <ArrayEditor {...props} value={props.value} />;
  }

  if (isJsonObject(props.value)) {
    return <ObjectEditor {...props} value={props.value} />;
  }

  return <PrimitiveEditor {...props} value={props.value} />;
}

export function VisualJsonFieldEditor({
  value,
  onChange,
  templateValue,
}: VisualJsonFieldEditorProps) {
  const templateObject = useMemo(() => {
    const normalized = toJsonValue(templateValue);
    if (isJsonObject(normalized)) {
      return normalized;
    }

    return {} as JsonObject;
  }, [templateValue]);

  const parsed = useMemo(() => parseObjectFromString(value), [value]);

  const effectiveValue = useMemo(() => {
    if (!parsed.value) {
      return templateObject;
    }

    if (Object.keys(templateObject).length === 0) {
      return parsed.value;
    }

    const normalized = normalizeByTemplate(parsed.value, templateObject);
    return isJsonObject(normalized) ? normalized : templateObject;
  }, [parsed.value, templateObject]);

  const resetToTemplate = () => {
    onChange(JSON.stringify(templateObject, null, 2));
  };

  const addTopLevelItem = () => {
    const nextTemplate = Object.keys(templateObject).length
      ? templateObject
      : { value: "" };
    const nextValue = normalizeByTemplate(effectiveValue, nextTemplate);

    if (isJsonObject(nextValue)) {
      onChange(JSON.stringify(nextValue, null, 2));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Edit section values directly with typed inputs (text, number, boolean, image URL, and structured lists).
        </p>
        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant="outline" onClick={addTopLevelItem} className="h-7 gap-1 px-2">
            <Plus className="h-3.5 w-3.5" />
            Refresh Schema
          </Button>
        </div>
      </div>

      {!parsed.error ? (
        <ObjectEditor
          label="Section Data"
          value={effectiveValue}
          template={templateObject}
          depth={0}
          onChange={(next) => onChange(JSON.stringify(next, null, 2))}
        />
      ) : (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3">
          <p className="text-xs text-destructive">{parsed.error}</p>
          <div className="mt-2">
            <Button type="button" size="sm" variant="outline" onClick={resetToTemplate} className="h-7 gap-1 px-2">
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset Section Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
