"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";

import { MediaField } from "@/components/admin/media-field";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

import type { MediaWithUser } from "@/lib/actions/media";

interface CtaSectionData {
  title: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: "primary" | "secondary";
  backgroundImage?: MediaWithUser | null;
  textColor: "white" | "dark";
}

interface CtaSectionEditorProps {
  language?: "en" | "ar";
  section: {
    id: string;
    type: string;
    data: Record<string, any>;
  };
  onSave: (data: CtaSectionData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * CTA Section Editor
 * Handles editing of call-to-action banner sections.
 */
export function CtaSectionEditor({
  section,
  onSave,
  isLoading = false,
  onClose,
  language = "en",
}: CtaSectionEditorProps) {
  // Validate section type
  if (section.type !== "CTA") {
    return null;
  }

  const initialData = section.data as CtaSectionData;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [buttonText, setButtonText] = useState(initialData?.buttonText || "");
  const [buttonLink, setButtonLink] = useState(initialData?.buttonLink || "");
  const [buttonStyle, setButtonStyle] = useState<"primary" | "secondary">(
    initialData?.buttonStyle || "primary",
  );
  const [backgroundImage, setBackgroundImage] = useState<MediaWithUser | null>(
    initialData?.backgroundImage || null,
  );
  const [textColor, setTextColor] = useState<"white" | "dark">(
    initialData?.textColor || "white",
  );

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!buttonText.trim()) errs.buttonText = "Button text is required";
    if (!buttonLink.trim()) errs.buttonLink = "Button link is required";
    return errs;
  }, [title, buttonText, buttonLink]);

  // Handle save
  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      buttonStyle,
      backgroundImage,
      textColor,
    });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="cta-title" className="text-sm font-medium">
          Title
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="cta-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ready to Partner?"
          disabled={isLoading}
          className="mt-1"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <TiptapEditor
          value={description}
          onChange={setDescription}
          label="Description"
          help="Rich text with formatting options"
          placeholder="Get in touch with our team"
          maxHeight="250px"
          mediaPickerEnabled={false}
          disabled={isLoading}
        />
      </div>

      {/* Button Text */}
      <div>
        <Label htmlFor="cta-button-text" className="text-sm font-medium">
          Button Text
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="cta-button-text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="Contact Us"
          disabled={isLoading}
          className="mt-1"
        />
        {errors.buttonText && (
          <p className="text-xs text-red-500 mt-1">{errors.buttonText}</p>
        )}
      </div>

      {/* Button Link */}
      <div>
        <Label htmlFor="cta-button-link" className="text-sm font-medium">
          Button Link
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="cta-button-link"
          value={buttonLink}
          onChange={(e) => setButtonLink(e.target.value)}
          placeholder="/contact"
          disabled={isLoading}
          className="mt-1"
        />
        {errors.buttonLink && (
          <p className="text-xs text-red-500 mt-1">{errors.buttonLink}</p>
        )}
      </div>

      {/* Button Style */}
      <div>
        <Label htmlFor="cta-button-style" className="text-sm font-medium">
          Button Style
        </Label>
        <Select
          id="cta-button-style"
          value={buttonStyle}
          onChange={(e) =>
            setButtonStyle(e.target.value as "primary" | "secondary")
          }
          disabled={isLoading}
          className="mt-1"
        >
          <SelectOption value="primary">Primary</SelectOption>
          <SelectOption value="secondary">Secondary</SelectOption>
        </Select>
      </div>

      {/* Background Image */}
      <div>
        <MediaField
          value={backgroundImage}
          onChange={setBackgroundImage}
          label="Background Image"
          help="Optional background image for the CTA banner"
          disabled={isLoading}
          aspectRatio={16 / 9}
        />
      </div>

      {/* Text Color */}
      <div>
        <Label htmlFor="cta-text-color" className="text-sm font-medium">
          Text Color
        </Label>
        <Select
          id="cta-text-color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value as "white" | "dark")}
          disabled={isLoading}
          className="mt-1"
        >
          <SelectOption value="white">White</SelectOption>
          <SelectOption value="dark">Dark</SelectOption>
        </Select>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Preview
        </p>
        <div
          className="relative h-40 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-6"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage.url})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: !backgroundImage ? "#f3f4f6" : "transparent",
          }}
        >
          {backgroundImage && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
              }}
            />
          )}
          <div className="relative z-10">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: textColor === "white" ? "white" : "black" }}
            >
              {title}
            </h2>
            {description && (
              <p
                className="text-sm mb-4"
                style={{
                  color:
                    textColor === "white" ? "rgba(255,255,255,0.9)" : "#666",
                }}
              >
                {description}
              </p>
            )}
            <button
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                buttonStyle === "primary"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white text-blue-600 hover:bg-gray-100"
              }`}
            >
              {buttonText}
            </button>
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

export default CtaSectionEditor;
