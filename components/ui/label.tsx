"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none text-foreground transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

interface LabelProps
  extends
    React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  /** Show required indicator (asterisk) */
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      data-slot="label"
      className={cn(labelVariants(), className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-error" aria-hidden="true">
          *
        </span>
      )}
    </label>
  ),
);
Label.displayName = "Label";

export { Label, labelVariants };
