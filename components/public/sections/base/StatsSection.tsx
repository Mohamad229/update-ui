import { SectionReveal } from "./SectionReveal";
import type { StatsSectionData } from "./types";

import { cn } from "@/lib/utils";

interface StatsSectionProps {
  data: StatsSectionData;
  className?: string;
  delay?: number;
}

export function StatsSection({ data, className, delay }: StatsSectionProps) {
  return (
    <SectionReveal delay={delay}>
      <section
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
          className,
        )}
      >
        {data.title ? (
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h2>
        ) : null}
        {data.description ? (
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            {data.description}
          </p>
        ) : null}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-3xl font-semibold text-foreground">
                    {item.value}
                  </p>
                  {Icon ? (
                    <span className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-medium text-foreground/90">
                  {item.label}
                </p>
                {item.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </SectionReveal>
  );
}
