import { SectionReveal } from "@/components/public/sections/base/SectionReveal";
import type { CardGridData } from "@/components/public/sections/base/types";
import { cn } from "@/lib/utils";

interface CardGridProps {
  data?: CardGridData;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function CardGridV2({ data, children, className, delay }: CardGridProps) {
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
          "w-full border-y border-foreground/10 bg-background py-16 sm:py-24",
          className,
        )}
      >
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              {data?.title && (
                <h2 className="text-4xl font-normal tracking-tighter text-foreground sm:text-6xl md:text-7xl uppercase">
                  {data.title}
                </h2>
              )}
            </div>
            {data?.description && (
              <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                {data.description}
              </p>
            )}
          </div>
          <div
            className={cn(
              "grid gap-6 ",
              columnsClass,
            )}
          >
            {/* The gap-px and bg-foreground/10 act as 1px borders for the inner grid items */}
            {children}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
