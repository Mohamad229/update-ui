"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";

import type { MediaWithUser } from "@/lib/actions/media";

interface MediaFieldProps {
  /** Current media */
  value: MediaWithUser | null;
  /** Change handler */
  onChange: (media: MediaWithUser | null) => void;
  /** Field label */
  label?: string;
  /** Help text */
  help?: string;
  /** Whether field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Image aspect ratio */
  aspectRatio?: number;
}

/**
 * Wrapper component for MediaPicker integration.
 * Handles single media selection with preview and clear functionality.
 */
export function MediaField({
  value,
  onChange,
  label = "Image",
  help,
  required = false,
  error,
  disabled = false,
  aspectRatio = 16 / 9,
}: MediaFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          // Handle both single and array returns
          if (Array.isArray(media)) {
            onChange(media[0] || null);
          } else {
            onChange(media);
          }
        }}
        accept="image"
        title="Select Image"
      />

      {value ? (
        <div className="space-y-2">
          {/* Preview */}
          <div
            className="relative rounded-lg overflow-hidden bg-muted border border-border"
            style={{ aspectRatio }}
          >
            <Image
              src={value.url}
              alt={value.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-xs">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{value.name}</p>
              <p className="text-muted-foreground text-[10px]">{value.url}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPickerOpen(true)}
              disabled={disabled}
              className="flex-1"
            >
              Change Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          className="w-full"
        >
          Select Image
        </Button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
