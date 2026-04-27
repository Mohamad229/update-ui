"use client";

import Link from "next/link";
import { Tooltip } from "@base-ui/react/tooltip";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  collapsed?: boolean;
  isActive?: boolean;
}

/**
 * Navigation item component for admin sidebar.
 * Supports collapsed mode with tooltip, active state, and notification badge.
 */
export function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  collapsed = false,
  isActive = false,
}: NavItemProps) {
  const content = (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Default state
        "text-muted-foreground",
        // Hover state
        "hover:bg-muted hover:text-foreground",
        // Active state
        isActive && "bg-primary/10 text-primary hover:bg-primary/15",
        // Collapsed mode adjustments
        collapsed && "justify-center px-2",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon */}
      <Icon
        className={cn(
          "size-5 shrink-0 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden="true"
      />

      {/* Label (hidden when collapsed) */}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
            collapsed
              ? "absolute -top-1 size-5 ltr:-right-1 rtl:-left-1"
              : "min-w-[1.25rem] px-1.5 py-0.5",
          )}
          aria-label={`${badge} notifications`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  // Wrap in tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger render={<div className="w-full" />}>
            {content}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="right" sideOffset={8}>
              <Tooltip.Popup
                className={cn(
                  "z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background",
                  "shadow-md animate-in fade-in-0 zoom-in-95",
                  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                )}
              >
                <Tooltip.Arrow className="fill-foreground" />
                {label}
                {badge !== undefined && badge > 0 && (
                  <span className="ml-1.5 text-primary-foreground/80">
                    ({badge})
                  </span>
                )}
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return content;
}
