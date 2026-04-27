import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { SectionReveal } from "@/components/public/sections/base/SectionReveal";
import type { HeroSectionData } from "@/components/public/sections/base/types";

interface HeroSectionV2Props {
  data: HeroSectionData;
  className?: string;
}

export function HeroSectionV2({ data, className }: HeroSectionV2Props) {
  return (
    <SectionReveal>
      <section
        className={cn(
          "relative overflow-hidden bg-white pt-24 pb-14 sm:pt-28 sm:pb-16 lg:min-h-[88vh] lg:pt-32 lg:pb-20",
          className
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#c5e1f5_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#fee2cd_0%,transparent_30%),linear-gradient(to_bottom,#ffffff,#f8fbff)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#91caee] to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:gap-12 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="max-w-2xl space-y-6 sm:space-y-7">
            <div className="inline-flex items-center rounded-full border border-[#91caee] bg-[#c5e1f5]/60 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#0097dc] sm:text-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#f58238]" />
              Excellence in Healthcare
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
              {data.title || "The Future of Pharma"}
            </h1>

            <p className="max-w-xl border-s-4 border-[#4cb748] ps-4 text-base leading-relaxed text-slate-600 sm:ps-5 sm:text-lg md:text-xl">
              {data.subtitle ||
                "A new vision for healthcare excellence and scientific discovery."}
            </p>

            {data.actions?.length ? (
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4">
                {data.actions.map((action, index) => (
                  <Link
                    key={action.href + action.label}
                    href={action.href}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      index === 0
                        ? "bg-[#0097dc] text-white shadow-[0_10px_28px_-14px_rgba(0,151,220,0.7)] hover:bg-[#00a5e1] focus-visible:ring-[#0097dc]"
                        : "border border-[#91caee] bg-white text-[#0097dc] hover:border-[#0097dc] hover:bg-[#c5e1f5]/35 focus-visible:ring-[#0097dc]"
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-[#c5e1f5] via-[#ffffff] to-[#daecd4] blur-xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-[#e7f1fa] bg-white shadow-[0_30px_70px_-35px_rgba(15,23,42,0.35)] sm:aspect-[16/11] lg:aspect-square">
              {data.backgroundImage && (
                <Image
                  src={data.backgroundImage.src}
                  alt={data.backgroundImage.alt || data.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-[#91caee]/40" />
            </div>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}