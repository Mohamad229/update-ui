"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

export type HeaderNavItem = {
  href: string;
  label: string;
};

type SiteHeaderClientProps = {
  navItems: HeaderNavItem[];
  mainNavLabel: string;
};

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/"))
    return pathname.slice(0, -1);
  return pathname;
}

function isNavItemActive(pathname: string, href: string): boolean {
  const normalizedPathname = normalizePath(pathname);
  const normalizedHref = normalizePath(href);

  if (normalizedHref === "/") return normalizedPathname === "/";
  return (
    normalizedPathname === normalizedHref ||
    normalizedPathname.startsWith(`${normalizedHref}/`)
  );
}

export function SiteHeaderClient({
  navItems,
  mainNavLabel,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Logo + Name */}
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-[12px] font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:text-sm">
            DP
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
              Damira Pharma
            </span>
            <span className="block truncate text-[11px] text-muted-foreground sm:text-xs">
              Trusted. Healthy.
            </span>
          </span>
        </Link>

        {/* Center: Nav (desktop) */}
        <nav
          aria-label={mainNavLabel}
          className="hidden items-center gap-7 lg:flex"
        >
          {navItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={[
                  "group rounded-xl px-3 py-2 text-sm md:text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <span className="relative inline-block">
                  {item.label}
                  <span
                    className={[
                      "pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] origin-left bg-primary transition-transform duration-300",
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                    ].join(" ")}
                  />
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Language (desktop) + Mobile menu */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu (animated) */}
      <div
        className={[
          "lg:hidden border-t border-border bg-background overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out",
          isMobileMenuOpen
            ? "max-h-[520px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-1",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-7xl space-y-3 px-4 py-4 sm:px-6">
          <nav aria-label={mainNavLabel} className="grid gap-1.5">
            {navItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <span className="relative inline-block">
                    {item.label}
                    <span
                      className={[
                        "pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] origin-left bg-primary transition-transform duration-300",
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                      ].join(" ")}
                    />
                  </span>
                </Link>
              );
            })}

            {/* Language within menu options */}
            <div className="my-2 h-px w-full bg-border" />
            <LanguageSwitcher variant="inline" label="Switch Language" />
          </nav>
        </div>
      </div>
    </header>
  );
}
