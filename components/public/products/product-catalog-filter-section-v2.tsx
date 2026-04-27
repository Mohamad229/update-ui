"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ProductCard as ProductCardV2 } from "@/components/public/sections/v2/ProductCard-v2";
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
    noResultsDescription: "Try another keyword or choose a different category.",
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

export function ProductCatalogFilterSectionV2({
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
    if (categoryOptions?.length) return categoryOptions;

    const seen = new Set<string>();
    return items
      .map((item) => item.category)
      .filter((category) => {
        const key = normalize(category);
        if (seen.has(key)) return false;
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

      if (!query) return matchesCategory;

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
    <section className="relative overflow-hidden border-y border-[#e8eff7] bg-gradient-to-b from-white to-[#f8fbff] py-16 sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,#c5e1f5_0%,transparent_30%),radial-gradient(circle_at_88%_14%,#fee2cd_0%,transparent_28%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 border-b border-[#e8eff7] pb-8 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl"
            >
              {title}
            </motion.h2>
            {description ? (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 }}
                className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base"
              >
                {description}
              </motion.p>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#91caee] bg-[#c5e1f5]/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0097dc]"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>
              {filteredItems.length} {labels.results}
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mb-10 grid gap-4 sm:grid-cols-[1fr_260px] md:mb-12"
        >
          <div className="relative">
            <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="h-12 w-full rounded-xl border border-[#dce8f5] bg-white ps-11 pe-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0097dc] focus:ring-2 focus:ring-[#c5e1f5]"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label={labels.categoryLabel}
              className="h-12 w-full appearance-none rounded-xl border border-[#dce8f5] bg-white px-4 pe-10 text-sm text-slate-700 outline-none transition-all focus:border-[#0097dc] focus:ring-2 focus:ring-[#c5e1f5]"
            >
              <option value="all">{labels.allCategories}</option>
              {resolvedCategories.map((category) => (
                <option key={category.id} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div layout className={cn("grid gap-6 sm:grid-cols-2", columnsClass)}>
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.28, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <ProductCardV2 data={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-[#e2ebf7] bg-white px-6 py-14 text-center shadow-[0_16px_40px_-34px_rgba(15,23,42,0.35)]"
            >
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {labels.noResultsTitle}
              </p>
              <p className="mt-2 text-sm text-slate-600">{labels.noResultsDescription}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}