"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state - adds red border styling */
  error?: boolean;
  /** Enable auto-resize based on content */
  autoResize?: boolean;
  /** Show character count (requires maxLength to be set) */
  showCharacterCount?: boolean;
  /** Maximum character count for display (optional, uses maxLength if not set) */
  maxCharacterCount?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      autoResize = false,
      showCharacterCount = false,
      maxCharacterCount,
      maxLength,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = React.useState(
      props.value?.toString().length ||
        props.defaultValue?.toString().length ||
        0,
    );
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const maxChars = maxCharacterCount || maxLength;

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!, []);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = event.target;

        // Update character count
        setCharCount(textarea.value.length);

        // Auto-resize logic
        if (autoResize && textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        // Call original onChange
        onChange?.(event);
      },
      [autoResize, onChange],
    );

    // Initialize auto-resize height
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize, props.value]);

    const isOverLimit = maxChars ? charCount > maxChars : false;

    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          data-slot="textarea"
          aria-invalid={error || isOverLimit ? "true" : undefined}
          maxLength={maxLength}
          onChange={handleChange}
          className={cn(
            // Base styles
            "flex min-h-[80px] w-full rounded-[var(--radius-md)] border bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground",
            // Default state
            "border-input",
            // Focus state
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            // Error state
            (error || isOverLimit) &&
              "border-error focus-visible:ring-error/30 focus-visible:border-error",
            // Auto-resize
            autoResize && "resize-none overflow-hidden",
            // Add bottom padding for character count
            showCharacterCount && maxChars && "pb-7",
            // Transitions
            "transition-colors duration-150",
            className,
          )}
          {...props}
        />
        {showCharacterCount && maxChars && (
          <span
            data-slot="textarea-count"
            className={cn(
              "absolute bottom-2 right-3 text-xs tabular-nums",
              isOverLimit ? "text-error font-medium" : "text-muted-foreground",
            )}
          >
            {charCount}/{maxChars}
          </span>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
