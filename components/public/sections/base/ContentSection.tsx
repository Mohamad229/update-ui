import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { SectionReveal } from "./SectionReveal";
import type { ContentSectionData } from "./types";

interface ContentSectionProps {
  data: ContentSectionData;
  className?: string;
  delay?: number;
}

export function ContentSection({
  data,
  className,
  delay,
}: ContentSectionProps) {
  const imageItems = data.images?.length
    ? data.images
    : data.image
      ? [data.image]
      : [];

  return (
    <SectionReveal delay={delay}>
      <section
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
          className,
        )}
      >
        <div
          className={cn(
            "grid items-start gap-7 rounded-[2rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8 lg:grid-cols-2",
            data.imagePosition === "left" && "lg:[&>*:first-child]:order-2",
          )}
        >
          <div>
            {data.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {data.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {data.title}
            </h2>
            {data.subtitle ? (
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                {data.subtitle}
              </p>
            ) : null}

            {data.body?.length ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
                {data.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {data.bullets?.length ? (
              <ul className="mt-4 space-y-2 text-sm text-foreground/90 sm:text-base">
                {data.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {data.actions?.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {data.actions.map((action) => (
                  <Link
                    key={action.label + action.href}
                    href={action.href}
                    className={cn(
                      "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition",
                      action.variant === "secondary"
                        ? "bg-accent text-white hover:bg-accent/90"
                        : action.variant === "ghost"
                          ? "border border-primary/25 bg-primary/5 text-primary hover:bg-primary/10"
                          : "bg-primary text-white hover:bg-primary/90",
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "grid gap-3",
              imageItems.length > 1 && "sm:grid-cols-2",
            )}
          >
            {imageItems.length ? (
              imageItems.map((image) => (
                <div
                  key={image.src + image.alt}
                  className={cn(
                    "relative min-h-52 overflow-hidden rounded-2xl border border-border/70 bg-muted",
                    data.carousel && "overflow-x-auto scroll-smooth",
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
                Section media placeholder
              </div>
            )}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
