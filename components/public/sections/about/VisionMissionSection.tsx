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

export function VisionMissionSection({ data }: VisionMissionSectionProps) {
  return (
    <SectionReveal>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {data.title}
        </h2>
        {data.description ? (
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            {data.description}
          </p>
        ) : null}
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {[data.vision, data.mission].map((block) => (
            <article
              key={block.title}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]"
            >
              <h3 className="text-2xl font-semibold text-foreground">
                {block.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {block.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </SectionReveal>
  );
}
