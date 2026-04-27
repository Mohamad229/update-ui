import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import {
  getAboutPageContent,
  getHomePageContent,
  getServicesPageContent,
} from "@/lib/content/loaders";
import type { Locale } from "@/i18n/config";

interface PublicPageContentProps {
  slug: string;
  locale: Locale;
}

export async function PublicPageContent({
  slug,
  locale,
}: PublicPageContentProps) {
  const normalizedSlug = slug === "/" || slug === "" ? "home" : slug;

  if (normalizedSlug === "home") {
    const content = await getHomePageContent(locale);
    return <StructuredHomePage locale={locale} content={content} />;
  }

  if (normalizedSlug === "about") {
    const content = await getAboutPageContent(locale);
    return <StructuredAboutPage content={content} />;
  }

  if (normalizedSlug === "services") {
    const content = await getServicesPageContent(locale);
    return <StructuredServicesPage content={content} />;
  }

  notFound();
}

type JsonItem = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asItems(value: unknown): JsonItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is JsonItem => typeof item === "object" && item !== null,
  );
}

function StructuredHomePage({
  locale,
  content,
}: {
  locale: Locale;
  content: Awaited<ReturnType<typeof getHomePageContent>>;
}) {
  const hero = content?.hero;
  const metrics = asItems(content?.trustMetrics?.items);
  const cards = asItems(content?.capabilities?.cards);
  const cta = content?.cta;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {asString(hero?.title, content?.title || "Damira Pharma")}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
          {asString(
            hero?.subtitle,
            "Trusted healthcare leadership with strong local execution.",
          )}
        </p>
        {hero?.buttonText && hero?.buttonLink && (
          <div className="mt-6">
            <Link
              href={hero.buttonLink}
              className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {hero.buttonText}
            </Link>
          </div>
        )}
      </section>

      {metrics.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {asString(content?.trustMetrics?.title, "Trust Metrics")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((item, index) => (
              <article
                key={`metric-${index}`}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="text-3xl font-bold text-primary">
                  {asString(item.value, "-")}
                </p>
                <p className="mt-1 font-medium">
                  {asString(item.label, "Metric")}
                </p>
                {asString(item.description) && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {asString(item.description)}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {cards.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold">
            {asString(content?.capabilities?.title, "Capabilities")}
          </h2>
          {content?.capabilities?.description && (
            <p className="mt-2 max-w-3xl text-muted-foreground">
              {asString(content.capabilities.description)}
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <article
                key={`capability-${index}`}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold">
                  {asString(card.title, "Capability")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {asString(card.description)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-border bg-card p-8 text-center">
        <h2 className="text-2xl font-semibold">
          {asString(cta?.title, "Ready to partner?")}
        </h2>
        {cta?.description && (
          <p className="mt-2 text-muted-foreground">{cta.description}</p>
        )}
        {cta?.buttonText && cta?.buttonLink && (
          <div className="mt-6">
            <Link
              href={cta.buttonLink}
              locale={locale}
              className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {cta.buttonText}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function StructuredAboutPage({
  content,
}: {
  content: Awaited<ReturnType<typeof getAboutPageContent>>;
}) {
  const values = asItems(content?.values?.values);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {asString(content?.hero?.title, content?.title || "About")}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
          {asString(
            content?.hero?.subtitle,
            "Learn who we are and why healthcare partners trust us.",
          )}
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-card p-8">
        <h2 className="text-2xl font-semibold">
          {asString(content?.story?.title, "Our Story")}
        </h2>
        <p className="mt-3 whitespace-pre-line text-muted-foreground">
          {asString(
            content?.story?.content,
            "Our company story content will be updated from the CMS.",
          )}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-8">
          <h3 className="text-xl font-semibold">
            {asString(content?.missionVision?.missionTitle, "Mission")}
          </h3>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">
            {asString(
              content?.missionVision?.missionContent,
              "Mission statement goes here.",
            )}
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-8">
          <h3 className="text-xl font-semibold">
            {asString(content?.missionVision?.visionTitle, "Vision")}
          </h3>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">
            {asString(
              content?.missionVision?.visionContent,
              "Vision statement goes here.",
            )}
          </p>
        </article>
      </section>

      {values.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {asString(content?.values?.title, "Core Values")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, index) => (
              <article
                key={`value-${index}`}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold">
                  {asString(value.title, `Value ${index + 1}`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {asString(value.description)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StructuredServicesPage({
  content,
}: {
  content: Awaited<ReturnType<typeof getServicesPageContent>>;
}) {
  const services = asItems(content?.serviceBlocks?.services);
  const highlights = asItems(content?.infrastructure?.highlights);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-secondary/10 to-primary/10 p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {asString(content?.hero?.title, content?.title || "Services")}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
          {asString(
            content?.hero?.subtitle,
            "Integrated healthcare services from strategy to execution.",
          )}
        </p>
      </section>

      {services.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {asString(content?.serviceBlocks?.title, "Service Blocks")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={`service-${index}`}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold">
                  {asString(service.title, `Service ${index + 1}`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {asString(service.description)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {highlights.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            {asString(content?.infrastructure?.title, "Infrastructure")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((highlight, index) => (
              <article
                key={`highlight-${index}`}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold">
                  {asString(highlight.title, `Highlight ${index + 1}`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {asString(highlight.description)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
