"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error state - adds red border styling */
  error?: boolean;
  /** Icon or element to render at the start of the input */
  prefixIcon?: React.ReactNode;
  /** Icon or element to render at the end of the input */
  suffixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, prefixIcon, suffixIcon, ...props }, ref) => {
    const hasPrefix = Boolean(prefixIcon);
    const hasSuffix = Boolean(suffixIcon);

    // If no icons, return simple input
    if (!hasPrefix && !hasSuffix) {
      return (
        <input
          type={type}
          ref={ref}
          data-slot="input"
          aria-invalid={error ? "true" : undefined}
          className={cn(
            // Base styles
            "flex h-10 w-full rounded-[var(--radius-md)] border bg-background px-3 py-2 text-sm",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            // Default state
            "border-input",
            // Focus state
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            // Error state
            error &&
              "border-error focus-visible:ring-error/30 focus-visible:border-error",
            // Transitions
            "transition-colors duration-150",
            className,
          )}
          {...props}
        />
      );
    }

    // Wrap with icon container
    return (
      <div
        data-slot="input-wrapper"
        className={cn(
          "relative flex items-center w-full",
          "rounded-[var(--radius-md)] border bg-background",
          "border-input",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-0 has-[:focus-visible]:border-primary",
          "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:disabled]:bg-muted",
          error &&
            "border-error has-[:focus-visible]:ring-error/30 has-[:focus-visible]:border-error",
          "transition-colors duration-150",
        )}
      >
        {prefixIcon && (
          <span
            data-slot="input-prefix"
            className="flex items-center justify-center pl-3 pr-0 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0"
          >
            {prefixIcon}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          data-slot="input"
          aria-invalid={error ? "true" : undefined}
          className={cn(
            "flex h-10 w-full bg-transparent text-sm outline-none",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed",
            hasPrefix ? "pl-2" : "pl-3",
            hasSuffix ? "pr-2" : "pr-3",
            "py-2",
            className,
          )}
          {...props}
        />
        {suffixIcon && (
          <span
            data-slot="input-suffix"
            className="flex items-center justify-center pr-3 pl-0 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0"
          >
            {suffixIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
