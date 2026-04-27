import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function PublicNotFound() {
  const tCommon = await getTranslations("common");
  const tError = await getTranslations("errors");

  return (
    <div className="relative mx-auto flex min-h-[68vh] w-full max-w-4xl flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--color-primary)/0.18),transparent_50%),radial-gradient(circle_at_80%_30%,hsl(var(--color-secondary)/0.16),transparent_48%)]" />

      <div className="rounded-[2rem] border border-border/80 bg-card/95 px-8 py-10 shadow-[var(--shadow-card)]">
        <p className="text-6xl font-semibold tracking-tight text-primary">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {tError("notFoundTitle")}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {tError("notFoundDescription")}
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex rounded-full border border-primary/40 bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
      >
        {tCommon("backHome")}
      </Link>
    </div>
  );
}
