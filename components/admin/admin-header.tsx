"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, Bell, Search, ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-provider";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

function UserDropdown() {
  const { data: session } = useSession();

  const userName = session?.user?.name || "Admin User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        className={cn(
          "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-200",
          "hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-gradient-to-br from-primary to-primary-dark",
            "text-xs font-semibold text-white",
            "ring-2 ring-primary/20",
            "transition-transform duration-200 group-hover:scale-105",
          )}
        >
          {userInitials}
        </div>
        <span className="hidden text-sm font-medium text-foreground md:block">
          {userName}
        </span>
      </button>
    </div>
  );
}

function NotificationBell() {
  const hasNotifications = true;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-muted-foreground hover:text-foreground"
      aria-label="View notifications"
    >
      <Bell className="h-5 w-5" />
      {hasNotifications && (
        <span
          className={cn(
            "absolute right-1.5 top-1.5 h-2 w-2 rounded-full",
            "bg-accent",
            "ring-2 ring-background",
          )}
        />
      )}
    </Button>
  );
}

function SearchButton() {
  return (
    <Button
      variant="ghost"
      className={cn(
        "hidden items-center gap-2 text-muted-foreground md:flex",
        "hover:bg-muted hover:text-foreground",
        "border border-border/50",
        "rounded-lg px-3 py-1.5",
      )}
      aria-label="Search"
    >
      <Search className="h-4 w-4" />
      <span className="text-sm">Search...</span>
      <kbd
        className={cn(
          "ml-4 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium lg:inline-block",
          "text-muted-foreground",
        )}
      >
        Ctrl K
      </kbd>
    </Button>
  );
}

export function AdminHeader({ breadcrumbs }: AdminHeaderProps) {
  const { toggleMobile } = useSidebar();

  const displayBreadcrumbs = breadcrumbs || [
    { label: "Dashboard", href: "/admin" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm",
        "supports-[backdrop-filter]:bg-background/80",
      )}
    >
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="shrink-0 lg:hidden"
        aria-label="Toggle sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-1 text-muted-foreground transition-colors",
            "hover:text-foreground",
          )}
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </Link>

        {displayBreadcrumbs.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  index === displayBreadcrumbs.length - 1 &&
                    "font-medium text-foreground",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-muted-foreground",
                  index === displayBreadcrumbs.length - 1 &&
                    "font-medium text-foreground",
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <SearchButton />

        <NotificationBell />

        {/* Divider */}
        <div className="mx-2 hidden h-6 w-px bg-border md:block" />

        <UserDropdown />
      </div>
    </header>
  );
}
