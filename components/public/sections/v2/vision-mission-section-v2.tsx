import { SectionReveal } from "@/components/public/sections/base";

interface VisionMissionBlock {
  title: string;
  description: string;
}

interface VisionMissionSectionProps {
  data: {
    title: string;
    description?: string;
    vision: VisionMissionBlock;
    mission: VisionMissionBlock;
  };
}

export function VisionMissionSectionV2({ data }: VisionMissionSectionProps) {
  return (
    <SectionReveal>
      <section className="relative overflow-hidden border-y border-[#e8eff7] bg-white py-16 sm:py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#c5e1f5_0%,transparent_30%),radial-gradient(circle_at_85%_15%,#fee2cd_0%,transparent_28%),radial-gradient(circle_at_50%_100%,#daecd4_0%,transparent_30%)]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 border-b border-[#e8eff7] pb-8 md:mb-14 md:flex-row md:items-end md:justify-between">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {data.title}
            </h2>
            {data.description && (
              <p className="max-w-xl border-s-4 border-[#0097dc] ps-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                {data.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {[data.vision, data.mission].map((block, index) => (
              <article
                key={block.title}
                className="group relative overflow-hidden rounded-2xl border border-[#e7eef7] bg-white p-6 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#91caee] sm:p-7 md:p-8"
              >
                <span className="absolute right-4 top-4 text-5xl font-extrabold tracking-tight text-[#c5e1f5] sm:text-6xl">
                  0{index + 1}
                </span>

                <div className="relative z-10">
                  <h3 className="mb-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {block.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {block.description}
                  </p>

                  <div className="mt-6">
                    <div className="h-[3px] w-14 rounded-full bg-[#f58238] transition-all duration-500 group-hover:w-full group-hover:bg-[#0097dc]" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}