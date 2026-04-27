/**
 * Tiptap Extensions Configuration
 * Centralized setup for all Tiptap editor instances across the application
 */

import { Extensions } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

// Create lowlight instance for syntax highlighting
const lowlight = createLowlight(common);

/**
 * Get configured Tiptap extensions for the editor
 * Includes all formatting, links, images, and code highlighting
 */
export function getTiptapExtensions(): Extensions {
  return [
    // Core functionality (Document, Paragraph, Text, History, etc.)
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      codeBlock: false, // Disable default code block, use CodeBlockLowlight instead
    }),

    // Links with auto-linking
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["http", "https", "mailto"],
      isAllowedUri: (url, ctx) => {
        try {
          const parsedUrl = url.startsWith("mailto:") ? url : new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      shouldAutoLink: (url) => {
        try {
          const parsedUrl = url.startsWith("mailto:") ? url : new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      validate: (href) => !!href,
    }),

    // Images with custom handling
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: "rounded-lg max-w-full h-auto",
      },
    }),

    // Code blocks with syntax highlighting
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: "javascript",
    }),

    // Placeholder text when editor is empty
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading") {
          return `Heading ${node.attrs.level}`;
        }
        return "Start typing...";
      },
      showOnlyWhenEditable: true,
      includeChildren: true,
    }),
  ];
}

/**
 * Get default editor props for consistent styling
 */
export function getTiptapEditorProps() {
  return {
    attributes: {
      class:
        "prose dark:prose-invert max-w-none focus:outline-none prose-p:leading-7 " +
        "prose-headings:font-bold prose-headings:font-serif " +
        "prose-a:text-blue-600 dark:prose-a:text-blue-400 " +
        "prose-strong:font-bold prose-em:italic " +
        "prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 " +
        "prose-code:rounded prose-code:text-red-500 prose-code:before:hidden prose-code:after:hidden " +
        "prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 " +
        "prose-pre:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-gray-300 " +
        "dark:prose-blockquote:border-gray-700 prose-blockquote:italic " +
        "prose-img:rounded-lg prose-hr:my-6",
    },
  };
}
