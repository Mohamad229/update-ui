"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaPicker } from "@/components/admin/media-picker";

import type { MediaWithUser } from "@/lib/actions/media";

export interface ImageModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Handle modal close */
  onOpenChange: (open: boolean) => void;
  /** Callback when image is inserted */
  onInsert: (url: string, alt: string) => void;
}

type ImageWidth = "25" | "50" | "75" | "100";
type ImageAlignment = "inline" | "float-left" | "float-right" | "center-block";

/**
 * Dialog for inserting images into Tiptap editor
 * Wraps MediaPicker and allows configuring image properties
 */
export function TiptapImageModal({
  open,
  onOpenChange,
  onInsert,
}: ImageModalProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(true);
  const [imageWidth, setImageWidth] = useState<ImageWidth>("100");
  const [imageAlignment, setImageAlignment] =
    useState<ImageAlignment>("center-block");
  const [selectedImage, setSelectedImage] = useState<MediaWithUser | null>(
    null,
  );

  const handleImageSelect = (media: MediaWithUser | MediaWithUser[]) => {
    const image = Array.isArray(media) ? media[0] : media;
    setSelectedImage(image);
    setShowMediaPicker(false);
  };

  const handleConfirm = () => {
    if (!selectedImage) return;

    // Build image tag with inline styles
    const widthPercent = `${imageWidth}%`;
    const imageTag = buildImageTag(
      selectedImage.url,
      selectedImage.name,
      widthPercent,
      imageAlignment,
    );

    onInsert(selectedImage.url, selectedImage.name);
    onOpenChange(false);

    // Reset state
    setSelectedImage(null);
    setShowMediaPicker(true);
    setImageWidth("100");
    setImageAlignment("center-block");
  };

  const handleCancel = () => {
    if (showMediaPicker) {
      onOpenChange(false);
    } else {
      setShowMediaPicker(true);
      setSelectedImage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showMediaPicker && (
        <MediaPicker
          open={open}
          onOpenChange={onOpenChange}
          onSelect={handleImageSelect}
          multiple={false}
          accept="image"
          title="Select Image"
          description="Choose an image from your media library"
        />
      )}

      {!showMediaPicker && selectedImage && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image Settings
            </DialogTitle>
            <DialogDescription>
              Configure how the image appears in your content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-center max-h-[200px] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                style={{ maxWidth: `${imageWidth}%`, maxHeight: "180px" }}
                className="rounded object-contain"
              />
            </div>

            {/* Image Name */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                {selectedImage.name}
              </Label>
            </div>

            {/* Width */}
            <div className="space-y-2">
              <Label htmlFor="image-width" className="text-sm font-medium">
                Image Width
              </Label>
              <Select
                id="image-width"
                value={imageWidth}
                onChange={(e) => setImageWidth(e.target.value as ImageWidth)}
              >
                <SelectOption value="25">25% (Thumbnail)</SelectOption>
                <SelectOption value="50">50% (Half Width)</SelectOption>
                <SelectOption value="75">75% (Large)</SelectOption>
                <SelectOption value="100">100% (Full Width)</SelectOption>
              </Select>
            </div>

            {/* Alignment */}
            <div className="space-y-2">
              <Label htmlFor="image-alignment" className="text-sm font-medium">
                Alignment
              </Label>
              <Select
                id="image-alignment"
                value={imageAlignment}
                onChange={(e) =>
                  setImageAlignment(e.target.value as ImageAlignment)
                }
              >
                <SelectOption value="center-block">Center Block</SelectOption>
                <SelectOption value="inline">Inline</SelectOption>
                <SelectOption value="float-left">Float Left</SelectOption>
                <SelectOption value="float-right">Float Right</SelectOption>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedImage(null);
                setShowMediaPicker(true);
              }}
            >
              Change Image
            </Button>
            <Button onClick={handleConfirm}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Insert Image
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

/**
 * Build an HTML image tag with properties
 */
function buildImageTag(
  url: string,
  alt: string,
  width: string,
  alignment: ImageAlignment,
): string {
  let className = "";

  switch (alignment) {
    case "float-left":
      className = "float-left mr-4";
      break;
    case "float-right":
      className = "float-right ml-4";
      break;
    case "center-block":
      className = "mx-auto block";
      break;
    case "inline":
      className = "inline";
      break;
  }

  return `<img src="${url}" alt="${alt}" style="width: ${width};" class="${className}" />`;
}
