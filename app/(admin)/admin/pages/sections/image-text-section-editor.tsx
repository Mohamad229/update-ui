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

interface ImageTextSectionData {
  title: string;
  content: string;
  image?: MediaWithUser | null;
  imagePosition: "left" | "right";
  imageRatio: "1:1" | "16:9" | "4:3";
}

interface ImageTextSectionEditorProps {
  language?: "en" | "ar";
  section: {
    id: string;
    type: string;
    data: Record<string, any>;
  };
  onSave: (data: ImageTextSectionData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Image-Text Section Editor
 * Handles editing of sections with image and text content side-by-side.
 */
export function ImageTextSectionEditor({
  section,
  onSave,
  isLoading = false,
  onClose,
  language = "en",
}: ImageTextSectionEditorProps) {
  // Validate section type
  if (section.type !== "IMAGE_TEXT") {
    return null;
  }

  const initialData = section.data as ImageTextSectionData;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [image, setImage] = useState<MediaWithUser | null>(
    initialData?.image || null,
  );
  const [imagePosition, setImagePosition] = useState<"left" | "right">(
    initialData?.imagePosition || "left",
  );
  const [imageRatio, setImageRatio] = useState<"1:1" | "16:9" | "4:3">(
    initialData?.imageRatio || "16:9",
  );

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!content.trim()) errs.content = "Content is required";
    if (!image) errs.image = "Image is required";
    return errs;
  }, [title, content, image]);

  // Handle save
  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    await onSave({
      title: title.trim(),
      content: content.trim(),
      image,
      imagePosition,
      imageRatio,
    });
  };

  // Get aspect ratio as decimal
  const getAspectRatioDecimal = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        return 1;
      case "16:9":
        return 16 / 9;
      case "4:3":
        return 4 / 3;
      default:
        return 16 / 9;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="image-text-title" className="text-sm font-medium">
          Title
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="image-text-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Innovative Solutions"
          disabled={isLoading}
          className="mt-1"
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
          maxHeight="350px"
          mediaPickerEnabled={true}
          disabled={isLoading}
        />
        {errors.content && (
          <p className="text-xs text-red-500 mt-1">{errors.content}</p>
        )}
      </div>

      {/* Image */}
      <div>
        <MediaField
          value={image}
          onChange={setImage}
          label="Image"
          required
          error={errors.image}
          disabled={isLoading}
          aspectRatio={getAspectRatioDecimal(imageRatio)}
        />
      </div>

      {/* Image Position */}
      <div>
        <Label htmlFor="image-position" className="text-sm font-medium">
          Image Position
        </Label>
        <Select
          id="image-position"
          value={imagePosition}
          onChange={(e) => setImagePosition(e.target.value as "left" | "right")}
          disabled={isLoading}
          className="mt-1"
        >
          <SelectOption value="left">Left</SelectOption>
          <SelectOption value="right">Right</SelectOption>
        </Select>
      </div>

      {/* Image Ratio */}
      <div>
        <Label htmlFor="image-ratio" className="text-sm font-medium">
          Image Aspect Ratio
        </Label>
        <Select
          id="image-ratio"
          value={imageRatio}
          onChange={(e) =>
            setImageRatio(e.target.value as "1:1" | "16:9" | "4:3")
          }
          disabled={isLoading}
          className="mt-1"
        >
          <SelectOption value="1:1">Square (1:1)</SelectOption>
          <SelectOption value="16:9">Widescreen (16:9)</SelectOption>
          <SelectOption value="4:3">Standard (4:3)</SelectOption>
        </Select>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Preview
        </p>
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-lg font-bold">{title || "Section Title"}</h3>
          <div
            className={`flex flex-col gap-4 ${imagePosition === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}
          >
            {image && (
              <div
                className="flex-1 rounded-lg overflow-hidden bg-muted"
                style={{ aspectRatio: getAspectRatioDecimal(imageRatio) }}
              >
                {/* eslint-disable-next-line */}
                <img
                  src={image.url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 prose dark:prose-invert text-sm max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-muted-foreground">
                  Content preview will appear here
                </p>
              )}
            </div>
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

export default ImageTextSectionEditor;
