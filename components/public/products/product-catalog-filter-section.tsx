"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";

import { ProductCard } from "@/components/public/sections/base";
import type { ProductCardData } from "@/components/public/sections/base";
import { type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface CategoryOption {
  id: string;
  label: string;
  value: string;
}

interface ProductCatalogFilterSectionProps {
  locale: Locale;
  title: string;
  description?: string;
  items: ProductCardData[];
  columns?: 2 | 3 | 4;
  categoryOptions?: CategoryOption[];
}

const LABELS: Record<
  Locale,
  {
    searchPlaceholder: string;
    categoryLabel: string;
    allCategories: string;
    results: string;
    noResultsTitle: string;
    noResultsDescription: string;
  }
> = {
  en: {
    searchPlaceholder: "Search products...",
    categoryLabel: "Category",
    allCategories: "All categories",
    results: "results",
    noResultsTitle: "No matching products",
    noResultsDescription:
      "Try another keyword or choose a different category.",
  },
  ar: {
    searchPlaceholder: "ابحث في المنتجات...",
    categoryLabel: "الفئة",
    allCategories: "كل الفئات",
    results: "نتيجة",
    noResultsTitle: "لا توجد منتجات مطابقة",
    noResultsDescription: "جرّب كلمة بحث أخرى أو اختر فئة مختلفة.",
  },
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ProductCatalogFilterSection({
  locale,
  title,
  description,
  items,
  columns = 3,
  categoryOptions,
}: ProductCatalogFilterSectionProps) {
  const labels = LABELS[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const resolvedCategories = useMemo(() => {
    if (categoryOptions?.length) {
      return categoryOptions;
    }

    const seen = new Set<string>();
    return items
      .map((item) => item.category)
      .filter((category) => {
        const key = normalize(category);
        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .map((category) => ({
        id: normalize(category).replace(/\s+/g, "-"),
        label: category,
        value: category,
      }));
  }, [categoryOptions, items]);

  const filteredItems = useMemo(() => {
    const query = normalize(searchQuery);

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        normalize(item.category) === normalize(selectedCategory);

      if (!query) {
        return matchesCategory;
      }

      const searchableText = [
        item.name,
        item.category,
        item.description,
        item.indication || "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [items, searchQuery, selectedCategory]);

  const columnsClass =
    columns === 2
      ? "xl:grid-cols-2"
      : columns === 4
        ? "xl:grid-cols-4"
        : "xl:grid-cols-3";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4 text-primary" />
            {filteredItems.length} {labels.results}
          </p>
        </div>

        <div className="mt-6 grid gap-3  bg-muted/30 p-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr]">
          <label className="space-y-1.5">
            <span className="sr-only">{labels.searchPlaceholder}</span>
            <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={labels.searchPlaceholder}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {/* {labels.categoryLabel} */}
            </span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary"
            >
              <option value="all">{labels.allCategories}</option>
              {resolvedCategories.map((category) => (
                <option key={category.id} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredItems.length ? (
          <div className={cn("mt-6 grid gap-4 sm:grid-cols-2", columnsClass)}>
            {filteredItems.map((item) => (
              <ProductCard key={item.id} data={item} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/80 px-4 py-10 text-center">
            <p className="text-lg font-semibold text-foreground">
              {labels.noResultsTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {labels.noResultsDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
