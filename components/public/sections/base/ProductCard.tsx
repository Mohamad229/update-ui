import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import type { ProductCardData } from "./types";

interface ProductCardProps {
  data: ProductCardData;
}

export function ProductCard({ data }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-[radial-gradient(circle_at_20%_20%,hsl(var(--color-primary)/0.35),transparent_55%),radial-gradient(circle_at_80%_80%,hsl(var(--color-secondary)/0.3),transparent_60%)]">
        {data.image ? (
          <Image
            src={data.image.src}
            alt={data.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {data.category}
          </span>
          {data.badge ? (
            <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-semibold text-secondary-dark">
              {data.badge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 text-xl font-semibold text-foreground">
          {data.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {data.description}
        </p>

        {data.indication ? (
          <p className="mt-3 text-xs text-foreground/80">
            <span className="font-semibold">Indication:</span> {data.indication}
          </p>
        ) : null}

        {data.storage ? (
          <p className="mt-1 text-xs text-foreground/80">
            <span className="font-semibold">Storage:</span> {data.storage}
          </p>
        ) : null}

        {data.href ? (
          <Link
            href={data.href}
            className={cn(
              "mt-5 inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.06em] text-primary",
              "transition hover:bg-primary hover:text-primary-foreground",
            )}
          >
            View Details
          </Link>
        ) : null}
      </div>
    </article>
  );
}
