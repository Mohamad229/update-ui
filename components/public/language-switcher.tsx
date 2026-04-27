"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/i18n/config";

type LanguageSwitcherProps = {
  className?: string;
  variant?: "dropdown" | "inline";
  label?: string; // للموبايل مثلاً "تبديل اللغة"
};

export function LanguageSwitcher({
  className,
  variant = "dropdown",
  label = "Language",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const currentLabel = useMemo(() => locale.toUpperCase(), [locale]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // ===== Inline variant (mobile): no dropdown =====
  if (variant === "inline") {
    return (
      <div
        className={[
          "flex items-center justify-between gap-3 bg-muted/20 px-3 py-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="text-sm font-medium text-muted-foreground">{label}</span>

        <div className="inline-flex overflow-hidden rounded-full border border-border bg-background">
          {locales.map((nextLocale) => {
            const isActive = locale === nextLocale;

            return (
              <Link
                key={nextLocale}
                href={pathname}
                locale={nextLocale}
                className={[
                  "px-3 py-1.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
                aria-current={isActive ? "true" : undefined}
              >
                {nextLocale.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== Dropdown variant (desktop) =====
  

  return (
    <div
      ref={rootRef}
      className={["relative", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        {currentLabel}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Select language"
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        >
          {locales.map((nextLocale) => {
            const isActive = locale === nextLocale;

            return (
              <Link
                key={nextLocale}
                href={pathname}
                locale={nextLocale}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <span>{nextLocale.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">
                  {localeNames[nextLocale]}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}