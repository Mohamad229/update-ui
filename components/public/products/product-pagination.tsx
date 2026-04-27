import { Link } from "@/i18n/navigation";

import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  pathname: string;
  searchParams: Record<string, string | undefined>;
  labels: {
    previous: string;
    next: string;
    page: string;
  };
}

export function ProductPagination({
  page,
  totalPages,
  pathname,
  searchParams,
  labels,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const goTo = (nextPage: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);
  const pages: number[] = [];

  for (let value = windowStart; value <= windowEnd; value += 1) {
    pages.push(value);
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Product pages"
    >
      <Link
        href={goTo(Math.max(1, page - 1))}
        className={cn(
          "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
          page <= 1 && "pointer-events-none opacity-50",
          page > 1 &&
            "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
        )}
      >
        {labels.previous}
      </Link>

      {pages.map((value) => (
        <Link
          key={value}
          href={goTo(value)}
          className={cn(
            "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
            value === page
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
          )}
          aria-current={value === page ? "page" : undefined}
        >
          <span className="sr-only">{labels.page} </span>
          {value}
        </Link>
      ))}

      <Link
        href={goTo(Math.min(totalPages, page + 1))}
        className={cn(
          "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
          page >= totalPages && "pointer-events-none opacity-50",
          page < totalPages &&
            "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
        )}
      >
        {labels.next}
      </Link>
    </nav>
  );
}
