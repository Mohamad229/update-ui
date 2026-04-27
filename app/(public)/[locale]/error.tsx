"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

interface PublicErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  const tCommon = useTranslations("common");
  const tError = useTranslations("errors");

  useEffect(() => {
    console.error("Public route error", error);
  }, [error]);

  return (
    <div className="relative mx-auto flex min-h-[68vh] w-full max-w-4xl flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--color-accent)/0.16),transparent_54%),radial-gradient(circle_at_80%_28%,hsl(var(--color-primary)/0.14),transparent_52%)]" />

      <div className="rounded-[2rem] border border-border/80 bg-card/95 px-8 py-10 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-destructive">
          500
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {tError("serverErrorTitle")}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {tError("serverErrorDescription")}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex rounded-full border border-primary/40 bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
        >
          {tCommon("tryAgain")}
        </button>
        <Link
          href="/"
          className="inline-flex rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
        >
          {tCommon("backHome")}
        </Link>
      </div>
    </div>
  );
}
