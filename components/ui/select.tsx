"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Error state - adds red border styling */
  error?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, placeholder, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          data-slot="select"
          aria-invalid={error ? "true" : undefined}
          className={cn(
            // Base styles
            "flex h-10 w-full appearance-none rounded-[var(--radius-md)] border bg-background pl-3 pr-10 py-2 text-sm",
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
            // Cursor
            "cursor-pointer",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
            "transition-transform duration-150",
          )}
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = "Select";

type SelectOptionProps = React.OptionHTMLAttributes<HTMLOptionElement>;

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <option
        ref={ref}
        data-slot="select-option"
        className={cn("bg-background text-foreground", className)}
        {...props}
      />
    );
  },
);
SelectOption.displayName = "SelectOption";

type SelectGroupProps = React.OptgroupHTMLAttributes<HTMLOptGroupElement>;

const SelectGroup = React.forwardRef<HTMLOptGroupElement, SelectGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <optgroup
        ref={ref}
        data-slot="select-group"
        className={cn("bg-background text-foreground font-medium", className)}
        {...props}
      />
    );
  },
);
SelectGroup.displayName = "SelectGroup";

export { Select, SelectOption, SelectGroup };
export type { SelectProps, SelectOptionProps, SelectGroupProps };
