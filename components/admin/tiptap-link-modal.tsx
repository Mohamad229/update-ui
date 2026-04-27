"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface LinkModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Handle modal close */
  onOpenChange: (open: boolean) => void;
  /** Callback when link is inserted/updated */
  onInsert: (data: LinkData) => void;
  /** Initial link URL (for editing) */
  initialUrl?: string;
  /** Initial link text (from selection) */
  initialText?: string;
  /** Initial open in new tab state */
  initialNewTab?: boolean;
}

export interface LinkData {
  /** URL to link to */
  href: string;
  /** Whether to open in new tab */
  target: boolean;
}

/**
 * Dialog for creating or editing links in Tiptap editor
 * Validates URLs and provides open-in-new-tab option
 */
export function TiptapLinkModal({
  open,
  onOpenChange,
  onInsert,
  initialUrl = "",
  initialText = "",
  initialNewTab = false,
}: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(initialText);
  const [newTab, setNewTab] = useState(initialNewTab);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setLinkText(initialText);
      setNewTab(initialNewTab);
      setError("");
    }
  }, [open, initialUrl, initialText, initialNewTab]);

  /**
   * Validate URL format
   * Accepts http://, https://, mailto:, or relative paths (/)
   */
  const validateUrl = (href: string): boolean => {
    if (!href.trim()) {
      setError("URL is required");
      return false;
    }

    const trimmedUrl = href.trim();

    // Check for valid protocols or relative paths
    if (
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://") &&
      !trimmedUrl.startsWith("mailto:") &&
      !trimmedUrl.startsWith("/")
    ) {
      setError("URL must start with http://, https://, mailto:, or /");
      return false;
    }

    // Basic URL validation
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      try {
        new URL(trimmedUrl);
      } catch {
        setError("Invalid URL format");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError("");
  };

  const handleSave = () => {
    if (!validateUrl(url)) return;

    onInsert({
      href: url.trim(),
      target: newTab,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Insert Link
          </DialogTitle>
          <DialogDescription>
            Add a link to your content. Use absolute URLs or relative paths.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="link-url" className="text-sm font-medium">
              URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="link-url"
              placeholder="https://example.com or /relative-path"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={error ? "border-red-500 focus:border-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Link Text (optional) */}
          <div className="space-y-2">
            <Label htmlFor="link-text" className="text-sm font-medium">
              Link Text{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="link-text"
              placeholder="Display text (uses selection if empty)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Open in New Tab */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <input
              type="checkbox"
              id="link-new-tab"
              checked={newTab}
              onChange={(e) => setNewTab(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label
              htmlFor="link-new-tab"
              className="flex items-center gap-2 cursor-pointer text-sm font-medium flex-1"
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!url.trim()}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Insert Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
