"use client";

import { useCallback } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type Language = "en" | "ar";

interface LanguageTabsProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  unsavedChanges?: { en?: boolean; ar?: boolean };
  className?: string;
}

interface LanguageTabConfig {
  id: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

// ============================================================================
// Constants
// ============================================================================

const LANGUAGE_TABS: LanguageTabConfig[] = [
  {
    id: "en",
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
  },
  {
    id: "ar",
    label: "العربية",
    nativeLabel: "Arabic",
    flag: "🇸🇦",
  },
];

// ============================================================================
// Component
// ============================================================================

/**
 * Language Tabs Component
 * Provides a bilingual toggle for content editing (EN/AR)
 *
 * Features:
 * - Two language tabs with flags
 * - Active tab highlighting
 * - Unsaved changes indicator (red dot)
 * - Reusable for any bilingual form
 * - Mobile responsive
 * - RTL support for Arabic label
 */
export function LanguageTabs({
  currentLanguage,
  onLanguageChange,
  unsavedChanges,
  className,
}: LanguageTabsProps) {
  const handleTabClick = useCallback(
    (lang: Language) => {
      if (lang !== currentLanguage) {
        onLanguageChange(lang);
      }
    },
    [currentLanguage, onLanguageChange],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-muted p-1 rounded-lg",
        className,
      )}
    >
      {LANGUAGE_TABS.map((tab) => {
        const isActive = tab.id === currentLanguage;
        const hasUnsavedChanges = unsavedChanges?.[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              "relative cursor-pointer",
              isActive
                ? "bg-background text-foreground shadow-sm border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
            aria-label={
              isActive
                ? `${tab.nativeLabel} (current)`
                : `Switch to ${tab.nativeLabel}`
            }
            aria-pressed={isActive}
            title={tab.nativeLabel}
          >
            {/* Flag Icon */}
            <span className="text-base leading-none">{tab.flag}</span>

            {/* Language Label */}
            <span className="hidden sm:inline">{tab.label}</span>

            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges && (
              <div
                className="w-2 h-2 rounded-full bg-destructive/80"
                title="Unsaved changes"
                aria-label="Has unsaved changes"
              />
            )}
          </button>
        );
      })}

      {/* Language Icon */}
      <div className="ml-auto text-muted-foreground">
        <Globe className="h-4 w-4" />
      </div>
    </div>
  );
}

export default LanguageTabs;
