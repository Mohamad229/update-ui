import { cn } from "@/lib/utils";
import type { CardGridData, ProductCardData } from "@/components/public/sections/base/types";
import { ProductCard } from "./ProductCard-v2";

interface PortfolioPreviewSectionData extends CardGridData {
  items: ProductCardData[];
}

interface PortfolioPreviewSectionProps {
  data: PortfolioPreviewSectionData;
  className?: string;
}

export function PortfolioPreviewSection({
  data,
  className,
}: PortfolioPreviewSectionProps) {
  const columns = data.columns || 3;

  return (
    <section className={cn("bg-gradient-to-b from-white to-[#f8fbff] py-16 sm:py-20 md:py-24", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-5 border-b border-[#e8eff7] pb-8 md:mb-14 md:grid-cols-12 md:gap-8">
          {data.title && (
            <div className="md:col-span-7 lg:col-span-8">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                {data.title}
              </h2>
            </div>
          )}
          {data.description && (
            <div className="md:col-span-5 lg:col-span-4 md:self-end">
              <p className="border-s-2 border-[#91caee] ps-4 text-sm leading-relaxed text-slate-600 sm:text-base md:ps-5">
                {data.description}
              </p>
            </div>
          )}
        </div>

        <div
          className={cn("grid gap-6 sm:gap-7 lg:gap-8", {
            "sm:grid-cols-2 lg:grid-cols-2": columns === 2,
            "sm:grid-cols-2 lg:grid-cols-3": columns === 3,
            "sm:grid-cols-2 lg:grid-cols-4": columns === 4,
          })}
        >
          {data.items.map((item, index) => (
            <div
              key={item.id}
              className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-700"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <ProductCard data={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}