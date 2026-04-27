import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { CtaSectionData } from "@/components/public/sections/base/types";
import { SectionReveal } from "@/components/public/sections/base";

interface CtaSectionProps {
  data: CtaSectionData;
  className?: string;
  delay?: number;
}

export function CtaSection({ data, className, delay }: CtaSectionProps) {
  return (
    <SectionReveal delay={delay}>
      <section className={cn("bg-white py-16 sm:py-20 md:py-24", className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0097dc] via-[#00a5e1] to-[#0097dc] text-white shadow-[0_35px_80px_-40px_rgba(0,151,220,0.8)]">
            {data.backgroundImage && (
              <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay">
                <Image
                  src={data.backgroundImage.src}
                  alt={data.backgroundImage.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            )}

            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_15%,rgba(254,226,205,0.28),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(218,236,212,0.25),transparent_30%)]" />

            <div className="relative z-10 grid items-center gap-8 p-7 sm:p-10 md:p-12 lg:grid-cols-2 lg:gap-12 lg:p-14">
              <div className="max-w-2xl">
                {data.eyebrow && (
                  <span className="mb-3 inline-flex rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
                    {data.eyebrow}
                  </span>
                )}
                <h2 className="mb-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                  {data.title}
                </h2>
                {data.description && (
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    {data.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-self-end">
                {data.primaryAction && (
                  <Link
                    href={data.primaryAction.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[#0097dc] transition-all duration-300 hover:bg-[#f4faff] hover:shadow-md"
                  >
                    {data.primaryAction.label}
                  </Link>
                )}
                {data.secondaryAction && (
                  <Link
                    href={data.secondaryAction.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/20"
                  >
                    {data.secondaryAction.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}