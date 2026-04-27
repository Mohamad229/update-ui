import { CheckCircle2 } from "lucide-react";

import type { ServiceCardData } from "./types";

interface ServiceCardProps {
  data: ServiceCardData;
}

export function ServiceCard({ data }: ServiceCardProps) {
  const Icon = data.icon;

  return (
    <article className="rounded-3xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/30">
      <div className="inline-flex rounded-2xl bg-primary/10 p-2.5 text-primary">
        {Icon ? (
          <Icon className="h-5 w-5" />
        ) : (
          <CheckCircle2 className="h-5 w-5" />
        )}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-foreground">
        {data.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {data.description}
      </p>
      {data.features?.length ? (
        <ul className="mt-4 space-y-2">
          {data.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-foreground/85"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
