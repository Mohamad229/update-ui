"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";
import { TiptapToolbar } from "./tiptap-toolbar";
import { TiptapLinkModal, type LinkData } from "./tiptap-link-modal";
import { TiptapImageModal } from "./tiptap-image-modal";

export interface TiptapEditorProps {
  /** Current HTML content */
  value: string;
  /** Callback when content changes */
  onChange: (html: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** CSS height (default: "400px") */
  maxHeight?: string;
  /** Show image insert button (default: true) */
  mediaPickerEnabled?: boolean;
  /** Label for the field */
  label?: string;
  /** Help text */
  help?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className for editor container */
  className?: string;
  /** Language for RTL support ('en' | 'ar') */
  language?: "en" | "ar";
}

/**
 * Full-featured Tiptap rich text editor with toolbar
 * Supports formatting, links, images, code blocks, and more
 * Supports bilingual content with RTL for Arabic
 */
export function TiptapEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  maxHeight = "400px",
  mediaPickerEnabled = true,
  label,
  help,
  disabled = false,
  className,
  language = "en",
}: TiptapEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const isRTL = language === "ar";

  // Initialize editor
  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert max-w-none focus:outline-none",
          "prose-p:leading-7 prose-headings:font-bold prose-headings:font-serif",
          "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline",
          "prose-strong:font-bold prose-em:italic",
          "prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1",
          "prose-code:rounded prose-code:text-red-500 prose-code:text-sm",
          "prose-code:before:hidden prose-code:after:hidden",
          "prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800",
          "prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300",
          "dark:prose-blockquote:border-gray-700 prose-blockquote:italic prose-blockquote:pl-4",
          "prose-img:rounded-lg prose-hr:my-6 prose-hr:border-gray-300 dark:prose-hr:border-gray-700",
        ),
      },
    },
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  // Handle link insertion with modal
  const handleLinkInsert = useCallback(
    (data: LinkData) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: data.href, target: data.target ? "_blank" : "_self" })
        .run();
    },
    [editor],
  );

  // Handle image insertion with modal
  const handleImageInsert = useCallback(
    (url: string, alt: string) => {
      if (!editor) return;

      editor.chain().focus().setImage({ src: url, alt }).run();
    },
    [editor],
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!editor) return;

      // Ctrl+Alt+L: Open link modal
      if (e.ctrlKey && e.altKey && e.key === "l") {
        e.preventDefault();
        setLinkModalOpen(true);
      }

      // Ctrl+Alt+I: Open image modal
      if (e.ctrlKey && e.altKey && e.key === "i") {
        e.preventDefault();
        if (mediaPickerEnabled) {
          setImageModalOpen(true);
        }
      }
    },
    [editor, mediaPickerEnabled],
  );

  if (!editor) return null;

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium mb-2 block">{label}</label>
      )}

      {/* Editor Container */}
      <div
        className={cn(
          "rounded-lg border border-border overflow-hidden bg-white dark:bg-slate-950",
          isRTL && "text-right",
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Toolbar */}
        <TiptapToolbar
          editor={editor}
          showImageButton={mediaPickerEnabled}
          onLinkClick={() => setLinkModalOpen(true)}
          onImageClick={() => setImageModalOpen(true)}
        />

        {/* Editor Area */}
        <div
          className={cn(
            "relative overflow-auto",
            "bg-white dark:bg-slate-950",
            "px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20",
          )}
          style={{ maxHeight }}
          onKeyDown={handleKeyDown}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[200px] focus:outline-none",
              disabled && "opacity-50 pointer-events-none",
              isRTL && "text-right",
            )}
          />
        </div>
      </div>

      {/* Help Text */}
      {help && <p className="text-xs text-muted-foreground mt-2">{help}</p>}

      {/* Link Modal */}
      <TiptapLinkModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        onInsert={handleLinkInsert}
      />

      {/* Image Modal */}
      {mediaPickerEnabled && (
        <TiptapImageModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          onInsert={handleImageInsert}
        />
      )}
    </div>
  );
}

export default TiptapEditor;
