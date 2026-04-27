"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Converts a URL segment to a human-readable label
 * e.g., "product-catalog" -> "Product Catalog"
 */
function segmentToLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Breadcrumbs component for admin dashboard navigation.
 * Auto-generates from current pathname or accepts custom items via props.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // If custom items are provided, use them
    if (items && items.length > 0) {
      return items;
    }

    // Auto-generate from pathname
    const segments = pathname
      .split("/")
      .filter(
        (segment) => segment !== "" && segment !== "en" && segment !== "ar",
      );

    if (segments.length === 0) {
      return [];
    }

    // Build breadcrumb items from path segments
    const generatedItems: BreadcrumbItem[] = [];
    let currentPath = "";

    // Detect locale prefix for proper href construction
    const localeMatch = pathname.match(/^\/(en|ar)/);
    const localePrefix = localeMatch ? localeMatch[0] : "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      generatedItems.push({
        label: segmentToLabel(segment),
        href: isLast ? undefined : `${localePrefix}${currentPath}`,
      });
    });

    return generatedItems;
  }, [items, pathname]);

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            href="/"
            className={cn(
              "flex items-center rounded-md p-1 transition-colors",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Home"
          >
            <Home className="size-4" />
          </Link>
        </li>

        {/* Separator after home */}
        <li aria-hidden="true" className="flex items-center text-border">
          <ChevronRight className="size-4 rtl:rotate-180" />
        </li>

        {/* Breadcrumb items */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {/* Item content */}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "max-w-[120px] truncate px-1 font-medium sm:max-w-[200px]",
                    isLast && "text-foreground",
                  )}
                  aria-current={isLast ? "page" : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "max-w-[120px] truncate rounded-md px-1 transition-colors sm:max-w-[200px]",
                    "hover:bg-muted hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}

              {/* Separator (not after last item) */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="flex items-center text-border ltr:ml-1 rtl:mr-1"
                >
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
