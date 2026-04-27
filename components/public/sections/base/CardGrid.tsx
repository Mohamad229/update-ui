import { SectionReveal } from "./SectionReveal";
import type { CardGridData } from "./types";

import { cn } from "@/lib/utils";

interface CardGridProps {
  data?: CardGridData;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function CardGrid({ data, children, className, delay }: CardGridProps) {
  const columnsClass =
    data?.columns === 2
      ? "lg:grid-cols-2"
      : data?.columns === 4
        ? "lg:grid-cols-4"
        : "lg:grid-cols-3";

  return (
    <SectionReveal delay={delay}>
      <section
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
          className,
        )}
      >
        {data?.title && (
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h2>
        )}
        {data?.description && (
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            {data.description}
          </p>
        )}
        <div className={cn("mt-7 grid gap-4 sm:grid-cols-2", columnsClass)}>
          {children}
        </div>
      </section>
    </SectionReveal>
  );
}
