import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { PublicProductCard } from "@/lib/actions/public-products";

interface ProductCardLabels {
  details: string;
  available: string;
  pipeline: string;
  category: string;
  therapeuticArea: string;
}

interface ProductCardProps {
  product: PublicProductCard;
  locale: "en" | "ar";
  view: "grid" | "list";
  labels: ProductCardLabels;
}

export function ProductCard({
  product,
  locale,
  view,
  labels,
}: ProductCardProps) {
  const isRtl = locale === "ar";
  const statusLabel =
    product.status === "AVAILABLE" ? labels.available : labels.pipeline;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card",
        "shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        view === "list" && "flex flex-col md:flex-row",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15",
          view === "grid" ? "h-52" : "h-52 md:h-auto md:w-72",
        )}
      >
        {product.coverImageUrl ? (
          <Image
            src={product.coverImageUrl}
            alt={product.name}
            fill
            sizes={
              view === "grid"
                ? "(max-width: 1024px) 100vw, 33vw"
                : "(max-width: 768px) 100vw, 320px"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--color-primary)/0.45),transparent_60%),radial-gradient(circle_at_70%_65%,hsl(var(--color-secondary)/0.3),transparent_55%)]" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              product.status === "AVAILABLE"
                ? "bg-secondary/15 text-secondary-dark"
                : "bg-accent/20 text-accent-dark",
            )}
          >
            {statusLabel}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {product.type}
          </span>
        </div>

        <h2 className="mt-3 text-xl font-semibold leading-tight text-foreground">
          {product.name}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {product.shortDescription || " "}
        </p>

        <dl
          className={cn(
            "mt-4 grid gap-2 text-xs text-muted-foreground",
            view === "grid" ? "grid-cols-1" : "sm:grid-cols-2",
            isRtl && "text-right",
          )}
        >
          <div>
            <dt className="font-semibold text-foreground/85">
              {labels.category}
            </dt>
            <dd>{product.category?.name || "-"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground/85">
              {labels.therapeuticArea}
            </dt>
            <dd>{product.therapeuticArea?.name || "-"}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-xs font-semibold tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {labels.details}
          </Link>
        </div>
      </div>
    </article>
  );
}
