import { SectionReveal } from "@/components/public/sections/base/SectionReveal";
import type { StatsSectionData } from "@/components/public/sections/base/types";
import { cn } from "@/lib/utils";

interface StatsSectionV2Props {
  data: StatsSectionData;
  className?: string;
  delay?: number;
}

export function StatsSectionV2({ data, className, delay }: StatsSectionV2Props) {
  return (
    <SectionReveal delay={delay}>
      <section
        className={cn(
          "relative overflow-hidden border-y border-[#eaf2fa] bg-white py-14 sm:py-16 md:py-20",
          className
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {data.title && (
            <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                {data.title}
              </h2>
              {data.description && (
                <p className="mx-auto mt-3 inline-block border-b-2 border-[#0097dc] pb-1.5 text-sm text-slate-600 sm:text-base md:text-lg">
                  {data.description}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {data.items.map((stat, idx) => (
              <article
                key={idx}
                className="group rounded-2xl border border-[#e6eff8] bg-white p-6 text-center shadow-[0_18px_40px_-34px_rgba(15,23,42,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-[#91caee] hover:shadow-[0_24px_50px_-30px_rgba(0,151,220,0.35)] sm:p-7"
              >
                <div className="text-3xl font-extrabold tracking-tight text-[#0097dc] sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-700 sm:text-base">
                  {stat.label}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}