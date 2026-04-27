"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { MediaField } from "@/components/admin/media-field";

import type { MediaWithUser } from "@/lib/actions/media";

interface HeroSectionData {
  title: string;
  subtitle?: string;
  backgroundImage?: MediaWithUser | null;
  ctaText?: string;
  ctaLink?: string;
  overlayOpacity: number;
}

interface HeroSectionEditorProps {
  language?: "en" | "ar";
  section: {
    id: string;
    type: string;
    data: Record<string, any>;
  };
  onSave: (data: HeroSectionData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Hero Section Editor
 * Handles editing of hero banner sections with background image, text overlay, and CTA button.
 */
export function HeroSectionEditor({
  section,
  onSave,
  isLoading = false,
  onClose,
  language = "en",
}: HeroSectionEditorProps) {
  // Validate section type
  if (section.type !== "HERO") {
    return null;
  }

  const initialData = section.data as HeroSectionData;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [backgroundImage, setBackgroundImage] = useState<MediaWithUser | null>(
    initialData?.backgroundImage || null,
  );
  const [ctaText, setCtaText] = useState(initialData?.ctaText || "");
  const [ctaLink, setCtaLink] = useState(initialData?.ctaLink || "");
  const [overlayOpacity, setOverlayOpacity] = useState(
    initialData?.overlayOpacity || 40,
  );

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!backgroundImage) errs.backgroundImage = "Background image is required";
    return errs;
  }, [title, backgroundImage]);

  // Handle save
  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    await onSave({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      backgroundImage,
      ctaText: ctaText.trim() || undefined,
      ctaLink: ctaLink.trim() || undefined,
      overlayOpacity,
    });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="hero-title" className="text-sm font-medium">
          Title
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="hero-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Welcome to Damira"
          disabled={isLoading}
          className="mt-1"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Subtitle */}
      <div>
        <Label htmlFor="hero-subtitle" className="text-sm font-medium">
          Subtitle
        </Label>
        <Textarea
          id="hero-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Leading the pharmaceutical industry"
          disabled={isLoading}
          rows={2}
          className="mt-1"
        />
      </div>

      {/* Background Image */}
      <div>
        <MediaField
          value={backgroundImage}
          onChange={setBackgroundImage}
          label="Background Image"
          required
          error={errors.backgroundImage}
          disabled={isLoading}
          aspectRatio={16 / 9}
        />
      </div>

      {/* CTA Button Text */}
      <div>
        <Label htmlFor="hero-cta-text" className="text-sm font-medium">
          CTA Button Text
        </Label>
        <Input
          id="hero-cta-text"
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          placeholder="Learn More"
          disabled={isLoading}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional. Leave blank to hide button.
        </p>
      </div>

      {/* CTA Button Link */}
      <div>
        <Label htmlFor="hero-cta-link" className="text-sm font-medium">
          CTA Button Link
        </Label>
        <Input
          id="hero-cta-link"
          value={ctaLink}
          onChange={(e) => setCtaLink(e.target.value)}
          placeholder="/products"
          disabled={isLoading}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional. Must be paired with button text.
        </p>
      </div>

      {/* Overlay Opacity */}
      <div>
        <Label htmlFor="hero-opacity" className="text-sm font-medium">
          Overlay Opacity
          <span className="text-muted-foreground ml-2">
            ({overlayOpacity}%)
          </span>
        </Label>
        <input
          id="hero-opacity"
          type="range"
          min="0"
          max="100"
          step="5"
          value={overlayOpacity}
          onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
          disabled={isLoading}
          className="w-full mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Controls darkness of background overlay.
        </p>
      </div>

      {/* Preview */}
      {backgroundImage && (
        <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Preview
          </p>
          <div
            className="relative h-48 rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url(${backgroundImage.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className="absolute inset-0 bg-black transition-opacity"
              style={{ opacity: overlayOpacity / 100 }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
              <h2 className="text-2xl font-bold">{title}</h2>
              {subtitle && <p className="text-sm mt-2">{subtitle}</p>}
              {ctaText && (
                <button className="mt-4 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  {ctaText}
                </button>
              )}
            </div>
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

export default HeroSectionEditor;
