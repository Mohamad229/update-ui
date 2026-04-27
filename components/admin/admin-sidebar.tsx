"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FileText,
  Image,
  Inbox,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-provider";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Forms", href: "/admin/forms", icon: Inbox },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Users", href: "/admin/users", icon: Users },
];

function NavItem({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: (typeof navItems)[0];
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive && [
          "bg-primary/10 text-primary",
          "before:absolute before:left-0 before:top-1/2 before:h-6 before:-translate-y-1/2",
          "before:w-[3px] before:rounded-r-full before:bg-primary",
        ],
        !isActive && "text-sidebar-foreground/70",
        isCollapsed && "justify-center px-2",
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-transform duration-200",
          "group-hover:scale-110",
          isActive && "text-primary",
        )}
      />
      <span
        className={cn(
          "truncate transition-all duration-200",
          isCollapsed && "sr-only",
        )}
      >
        {item.label}
      </span>
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <span
          className={cn(
            "absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs text-background",
            "group-hover:block",
            "shadow-md",
          )}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

function UserProfile({ isCollapsed }: { isCollapsed: boolean }) {
  const { data: session } = useSession();

  const userName = session?.user?.name || "Admin User";
  const userEmail = session?.user?.email || "admin@damira.com";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-2 transition-all duration-200",
        isCollapsed && "justify-center",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          "bg-gradient-to-br from-primary to-primary-dark",
          "text-sm font-semibold text-white",
          "ring-2 ring-primary/20",
          "shadow-sm",
        )}
      >
        {userInitials}
        {/* Online indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-secondary" />
      </div>

      {/* User info */}
      {!isCollapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {userName}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {userEmail}
          </p>
        </div>
      )}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } =
    useSidebar();

  // Track if component has mounted (for hydration-safe rendering)
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use layoutEffect to set hasMounted immediately after render but before paint
  // This prevents cascading renders while still being hydration-safe
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional for hydration handling
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Only apply collapsed state on desktop after mount
  // Before mount, default to expanded to match server render
  const effectiveCollapsed = hasMounted && !isMobile && isCollapsed;

  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    closeMobile();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-sidebar-border px-4 py-5",
          effectiveCollapsed && "justify-center px-2",
        )}
      >
        {/* Logo mark */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-primary via-primary to-primary-dark",
            "shadow-md shadow-primary/25",
          )}
        >
          <Shield className="h-5 w-5 text-white" />
        </div>

        {!effectiveCollapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
              Damira Pharma
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                "bg-accent/15 text-accent-dark",
              )}
            >
              Admin
            </span>
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className={cn(
            "ml-auto flex h-8 w-8 items-center justify-center rounded-lg lg:hidden",
            "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            "transition-colors duration-200",
          )}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive}
              isCollapsed={effectiveCollapsed}
              onClick={handleNavClick}
            />
          );
        })}
      </nav>

      {/* User Profile & Actions */}
      <div className="border-t border-sidebar-border p-3">
        <UserProfile isCollapsed={effectiveCollapsed} />

        {/* Logout button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "mt-2 w-full justify-start gap-3 text-sidebar-foreground/70",
            "hover:bg-destructive/10 hover:text-destructive",
            effectiveCollapsed && "justify-center px-2",
          )}
          title={effectiveCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!effectiveCollapsed && <span>Sign out</span>}
        </Button>
      </div>

      {/* Collapse toggle - desktop only */}
      <div className="hidden border-t border-sidebar-border p-3 lg:block">
        <Button
          variant="ghost"
          onClick={toggleCollapse}
          className={cn(
            "w-full justify-center gap-2 text-sidebar-foreground/60",
            "hover:bg-sidebar-accent hover:text-sidebar-foreground",
          )}
          size="sm"
        >
          {effectiveCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar",
          "border-r border-sidebar-border",
          "shadow-lg lg:shadow-none",
          "transition-all duration-300 ease-in-out",
          // Width handling
          effectiveCollapsed ? "lg:w-[72px]" : "lg:w-[280px]",
          // Always 280px width for the sidebar itself
          "w-[280px]",
        )}
        style={{
          transform:
            // Before mount: hide on what we assume is mobile (SSR safe - will flash but prevents hydration mismatch)
            !hasMounted
              ? undefined // Let CSS handle it via media query below
              : // After mount: use JS-based state
                isMobile && !isMobileOpen
                ? "translateX(-100%)"
                : "translateX(0)",
        }}
        data-mobile-hidden={!hasMounted ? "true" : undefined}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for main content - only on desktop */}
      <div
        className={cn(
          "hidden shrink-0 lg:block",
          "transition-all duration-300 ease-in-out",
          effectiveCollapsed ? "w-[72px]" : "w-[280px]",
        )}
        aria-hidden="true"
      />
    </>
  );
}
