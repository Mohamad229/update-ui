import { SectionReveal } from "@/components/public/sections/base";

interface SpecificationItem {
  label: string;
  value: string;
}

interface SpecificationsSectionProps {
  data: {
    title: string;
    description?: string;
    items: SpecificationItem[];
  };
}

export function SpecificationsSection({ data }: SpecificationsSectionProps) {
  return (
    <SectionReveal>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 md:py-20">
        <div className="mb-6 border-b border-[#e8eff7] pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            {data.title}
          </h2>
          {data.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
              {data.description}
            </p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e3edf8] bg-white shadow-[0_20px_44px_-34px_rgba(15,23,42,0.4)]">
          <dl className="divide-y divide-[#eaf1f8]">
            {data.items.map((item) => (
              <div
                key={item.label}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:px-6 sm:py-4"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0097dc] sm:text-xs">
                  {item.label}
                </dt>
                <dd className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </SectionReveal>
  );
}