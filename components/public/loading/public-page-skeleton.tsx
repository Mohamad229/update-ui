interface PublicPageSkeletonProps {
  blocks?: number;
}

export function PublicPageSkeleton({ blocks = 3 }: PublicPageSkeletonProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-40 rounded-full bg-primary/20" />
        <div className="h-10 w-full max-w-2xl rounded-xl bg-muted" />
        <div className="h-6 w-full max-w-3xl rounded-xl bg-muted/70" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: blocks }).map((_, index) => (
            <article
              key={index}
              className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-[var(--shadow-card)]"
            >
              <div className="h-44 rounded-2xl bg-muted" />
              <div className="mt-4 h-6 w-3/4 rounded-lg bg-muted" />
              <div className="mt-2 h-4 w-full rounded-lg bg-muted/80" />
              <div className="mt-2 h-4 w-2/3 rounded-lg bg-muted/70" />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
