import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { SectionReveal } from "./SectionReveal";
import type { HeroSectionData } from "./types";

interface HeroSectionProps {
  data: HeroSectionData;
  className?: string;
}

export function HeroSection({ data, className }: HeroSectionProps) {
  return (
    <SectionReveal>
      <section
        className={cn(
          "relative overflow-hidden border-b border-border/70 bg-[linear-gradient(135deg,hsl(var(--color-primary)/0.13),transparent_45%),linear-gradient(230deg,hsl(var(--color-secondary)/0.1),transparent_55%),linear-gradient(180deg,#f8fcff,#ffffff)]",
          className,
        )}
      >
        {data.backgroundImage ? (
          <div className="absolute inset-0 opacity-[0.18]">
            <Image
              src={data.backgroundImage.src}
              alt={data.backgroundImage.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          {data.eyebrow ? (
            <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {data.eyebrow}
            </p>
          ) : null}

          <h1 className="mt-4 max-w-4xl font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>

          {data.subtitle ? (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {data.subtitle}
            </p>
          ) : null}

          {data.tagline ? (
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              {data.tagline}
            </p>
          ) : null}

          {data.actions?.length ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {data.actions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className={cn(
                    "inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition",
                    action.variant === "secondary"
                      ? "bg-accent text-white hover:bg-accent/90"
                      : action.variant === "ghost"
                        ? "border border-primary/25 bg-white text-primary hover:bg-primary/10"
                        : "bg-primary text-white hover:bg-primary/90",
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}

          {data.metrics?.length ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {data.metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-border/70 bg-white/90 p-4 shadow-[var(--shadow-sm)] backdrop-blur"
                >
                  <p className="text-2xl font-semibold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {metric.label}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </SectionReveal>
  );
}
