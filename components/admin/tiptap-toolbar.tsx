"use client";

import { useCallback } from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Minus,
  Undo,
  Redo,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TiptapToolbarProps {
  /** Tiptap editor instance */
  editor: Editor | null;
  /** Show image button */
  showImageButton?: boolean;
  /** Callback to open link modal */
  onLinkClick?: () => void;
  /** Callback to open image modal */
  onImageClick?: () => void;
}

/**
 * Rich toolbar for Tiptap editor
 * Provides buttons for formatting, alignment, links, images, and more
 */
export function TiptapToolbar({
  editor,
  showImageButton = true,
  onLinkClick,
  onImageClick,
}: TiptapToolbarProps) {
  if (!editor) return null;

  // Heading dropdown handler
  const handleHeadingClick = useCallback(
    (level: 1 | 2 | 3 | 0) => {
      if (level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    },
    [editor],
  );

  // Formatting button component
  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon: Icon,
    tooltip,
    shortcut,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: React.ComponentType<{ className: string }>;
    tooltip?: string;
    shortcut?: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 rounded-md transition-all duration-200",
        isActive
          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
          : "hover:bg-muted",
      )}
      title={tooltip ? `${tooltip}${shortcut ? ` (${shortcut})` : ""}` : ""}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const Separator_ = () => <div className="w-px h-6 bg-border mx-1" />;

  return (
    <div className="flex flex-wrap gap-1 rounded-t-lg bg-slate-50 dark:bg-slate-900 border-b border-border p-2">
      {/* Undo / Redo */}
      <div className="flex gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={Undo}
          tooltip="Undo"
          shortcut="Ctrl+Z"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={Redo}
          tooltip="Redo"
          shortcut="Ctrl+Y"
        />
      </div>

      <Separator_ />

      {/* Text Formatting */}
      <div className="flex gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          tooltip="Bold"
          shortcut="Ctrl+B"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          tooltip="Italic"
          shortcut="Ctrl+I"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={Underline}
          tooltip="Underline"
          shortcut="Ctrl+U"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon={Strikethrough}
          tooltip="Strikethrough"
        />
      </div>

      <Separator_ />

      {/* Headings */}
      <div className="relative group">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 rounded-md hover:bg-muted flex items-center gap-1"
          title="Heading levels"
        >
          <Heading1 className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </Button>
        {/* Dropdown menu */}
        <div className="absolute left-0 top-full hidden group-hover:flex flex-col bg-popover border border-border rounded-lg shadow-lg z-50 mt-1 min-w-max">
          <button
            onClick={() => handleHeadingClick(0)}
            className={cn(
              "px-3 py-2 text-sm hover:bg-muted transition-colors text-left",
              !editor.isActive("heading") && "bg-muted/50",
            )}
          >
            Paragraph
          </button>
          <div className="border-b border-border" />
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => handleHeadingClick(level as 1 | 2 | 3)}
              className={cn(
                "px-3 py-2 text-sm hover:bg-muted transition-colors text-left",
                editor.isActive("heading", { level }) && "bg-muted/50",
              )}
            >
              Heading {level}
            </button>
          ))}
        </div>
      </div>

      <Separator_ />

      {/* Lists */}
      <div className="flex gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          tooltip="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          tooltip="Numbered List"
        />
      </div>

      <Separator_ />

      {/* Links */}
      <ToolbarButton
        onClick={onLinkClick || (() => {})}
        isActive={editor.isActive("link")}
        icon={LinkIcon}
        tooltip="Insert Link"
        shortcut="Ctrl+Alt+L"
      />

      {/* Images */}
      {showImageButton && (
        <ToolbarButton
          onClick={onImageClick || (() => {})}
          icon={ImageIcon}
          tooltip="Insert Image"
          shortcut="Ctrl+Alt+I"
        />
      )}

      <Separator_ />

      {/* Code & Blockquote */}
      <div className="flex gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          icon={Code}
          tooltip="Code Block"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          tooltip="Blockquote"
        />
      </div>

      <Separator_ />

      {/* Horizontal Rule & Clear Formatting */}
      <div className="flex gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          tooltip="Horizontal Rule"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().run()}
          icon={Trash2}
          tooltip="Clear Formatting"
        />
      </div>
    </div>
  );
}
