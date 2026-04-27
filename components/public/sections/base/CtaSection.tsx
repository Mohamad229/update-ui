import Image from "next/image";

import { Link } from "@/i18n/navigation";

import { SectionReveal } from "./SectionReveal";
import type { CtaSectionData } from "./types";

interface CtaSectionProps {
  data: CtaSectionData;
  className?: string;
}

export function CtaSection({ data, className }: CtaSectionProps) {
  return (
    <SectionReveal>
      <section className={className}>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary to-[#007fb8] p-7 text-white shadow-[var(--shadow-card)] sm:p-10">
            {data.backgroundImage ? (
              <div className="absolute inset-0 opacity-25">
                <Image
                  src={data.backgroundImage.src}
                  alt={data.backgroundImage.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1280px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
              </div>
            ) : null}

            <div className="relative">
              {data.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {data.eyebrow}
                </p>
              ) : null}
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {data.title}
              </h2>
              {data.description ? (
                <p className="mt-3 max-w-3xl text-base text-white/90 sm:text-lg">
                  {data.description}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                {data.primaryAction ? (
                  <Link
                    href={data.primaryAction.href}
                    className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
                  >
                    {data.primaryAction.label}
                  </Link>
                ) : null}
                {data.secondaryAction ? (
                  <Link
                    href={data.secondaryAction.href}
                    className="inline-flex rounded-full border border-white/50 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {data.secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
