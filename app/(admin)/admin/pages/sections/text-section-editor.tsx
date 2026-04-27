"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";

import { TiptapEditor } from "@/components/admin/tiptap-editor";

type Language = "en" | "ar";

interface TextSectionData {
  title: string;
  content: string;
  alignment: "left" | "center" | "right";
  backgroundColor: "white" | "light-gray" | "blue" | "none";
}

interface TextSectionEditorProps {
  section: {
    id: string;
    type: string;
    data: Record<string, any>;
  };
  onSave: (data: TextSectionData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
  language?: Language;
}

/**
 * Text Section Editor
 * Handles editing of text content sections with rich text support.
 * Supports bilingual content (EN/AR) with RTL styling for Arabic.
 */
export function TextSectionEditor({
  section,
  onSave,
  isLoading = false,
  onClose,
  language = "en",
}: TextSectionEditorProps) {
  // Validate section type
  if (section.type !== "TEXT") {
    return null;
  }

  const initialData = section.data as TextSectionData;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    initialData?.alignment || "left",
  );
  const [backgroundColor, setBackgroundColor] = useState<
    "white" | "light-gray" | "blue" | "none"
  >(initialData?.backgroundColor || "white");

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!content.trim()) errs.content = "Content is required";
    return errs;
  }, [title, content]);

  // Handle save
  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    await onSave({
      title: title.trim(),
      content: content.trim(),
      alignment,
      backgroundColor,
    });
  };

  // Background color options
  const bgColorOptions = [
    { value: "white", label: "White" },
    { value: "light-gray", label: "Light Gray" },
    { value: "blue", label: "Blue" },
    { value: "none", label: "Transparent" },
  ];

  // Alignment options
  const alignmentOptions = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="text-title" className="text-sm font-medium">
          Title
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="text-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Our Story"
          disabled={isLoading}
          className={cn("mt-1", language === "ar" && "text-right")}
          dir={language === "ar" ? "rtl" : "ltr"}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <TiptapEditor
          value={content}
          onChange={setContent}
          label="Content"
          help="Rich text editor with formatting, links, and images"
          placeholder="Enter your content here..."
          maxHeight="400px"
          mediaPickerEnabled={true}
          disabled={isLoading}
          language={language}
        />
        {errors.content && (
          <p className="text-xs text-red-500 mt-1">{errors.content}</p>
        )}
      </div>

      {/* Alignment */}
      <div>
        <Label htmlFor="text-alignment" className="text-sm font-medium">
          Text Alignment
        </Label>
        <Select
          id="text-alignment"
          value={alignment}
          onChange={(e) =>
            setAlignment(e.target.value as "left" | "center" | "right")
          }
          disabled={isLoading}
          className="mt-1"
        >
          {alignmentOptions.map((opt) => (
            <SelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </SelectOption>
          ))}
        </Select>
      </div>

      {/* Background Color */}
      <div>
        <Label htmlFor="text-bg-color" className="text-sm font-medium">
          Background Color
        </Label>
        <Select
          id="text-bg-color"
          value={backgroundColor}
          onChange={(e) =>
            setBackgroundColor(
              e.target.value as "white" | "light-gray" | "blue" | "none",
            )
          }
          disabled={isLoading}
          className="mt-1"
        >
          {bgColorOptions.map((opt) => (
            <SelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </SelectOption>
          ))}
        </Select>
      </div>

      {/* Preview */}
      <div
        className={cn(
          "mt-6 p-4 rounded-lg border border-border bg-muted/30",
          language === "ar" && "text-right",
        )}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Preview
        </p>
        <div
          className={`p-6 rounded-lg ${
            backgroundColor === "white"
              ? "bg-white"
              : backgroundColor === "light-gray"
                ? "bg-gray-100 dark:bg-gray-800"
                : backgroundColor === "blue"
                  ? "bg-blue-50 dark:bg-blue-950"
                  : "bg-transparent"
          }`}
          style={{ textAlign: alignment as any }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {title || "Section Title"}
          </h2>
          <div className="text-sm text-muted-foreground prose dark:prose-invert max-w-none">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p>Content preview will appear here</p>
            )}
          </div>
        </div>
      </div>

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

export default TextSectionEditor;
