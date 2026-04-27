import { cn } from "@/lib/utils";
import type { StatsSectionData } from "@/components/public/sections/base/types";

interface CoverageReachSectionProps {
  data: StatsSectionData;
  className?: string;
}

export function CoverageReachSection({ data, className }: CoverageReachSectionProps) {
  return (
    <section className={cn("bg-white py-16 sm:py-20 md:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 border-b border-[#e8eff7] pb-8 md:mb-16 md:flex-row md:items-end md:justify-between">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {data.title || "Coverage & Reach"}
          </h2>
          {data.description && (
            <p className="max-w-md text-sm leading-relaxed text-slate-600 md:text-right md:text-base">
              {data.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 lg:gap-10">
          {data.items.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                className="group rounded-2xl border border-[#e7eef7] bg-[#f8fbff] p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-[#91caee] hover:bg-white sm:p-7"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="mb-4 flex items-end gap-3">
                  {Icon && <Icon className="h-5 w-5 text-[#4cb748]" />}
                  <span className="text-4xl font-extrabold tracking-tight text-[#0097dc] sm:text-5xl lg:text-6xl">
                    {item.value}
                  </span>
                </div>

                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#f58238]">
                  {item.label}
                </h3>

                {item.description && (
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {item.description}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}