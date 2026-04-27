import Image from "next/image";

import { Link } from "@/i18n/navigation";

import { ScrollReveal } from "@/components/public/scroll-reveal";
import { cn } from "@/lib/utils";
import type { PublicPageSection } from "@/lib/public-pages";

type HeroSectionContent = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  overlayOpacity?: number;
  backgroundImage?: { url?: string };
};

type StatsSectionContent = {
  title?: string;
  stats?: Array<{
    id?: string;
    number?: string;
    label?: string;
    unit?: string;
  }>;
};

type CardsSectionContent = {
  title?: string;
  description?: string;
  cardsPerRow?: number;
  cards?: Array<{
    id?: string;
    title?: string;
    description?: string;
    image?: { url?: string };
  }>;
};

type FeaturesSectionContent = {
  title?: string;
  layout?: "list" | "grid";
  features?: Array<{
    id?: string;
    icon?: string;
    title?: string;
    description?: string;
  }>;
};

type CtaSectionContent = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: "primary" | "secondary";
  textColor?: "white" | "dark";
  backgroundImage?: { url?: string };
};

type ImageTextSectionContent = {
  title?: string;
  content?: string;
  image?: { url?: string };
  imagePosition?: "left" | "right";
};

type TextSectionContent = {
  title?: string;
  content?: string;
  alignment?: "left" | "center" | "right";
  backgroundColor?: "white" | "light-gray" | "blue" | "none";
};

export function DynamicSectionRenderer({
  sections,
}: {
  sections: PublicPageSection[];
}) {
  return (
    <div className="space-y-14 pb-16">
      {sections.map((section, index) => {
        const delayMs = index * 80;

        if (section.type === "HERO") {
          return (
            <HeroSection key={section.id} section={section} delayMs={delayMs} />
          );
        }
        if (section.type === "STATS") {
          return (
            <StatsSection
              key={section.id}
              section={section}
              delayMs={delayMs}
            />
          );
        }
        if (section.type === "CARDS") {
          return (
            <CardsSection
              key={section.id}
              section={section}
              delayMs={delayMs}
            />
          );
        }
        if (section.type === "FEATURES") {
          return (
            <FeaturesSection
              key={section.id}
              section={section}
              delayMs={delayMs}
            />
          );
        }
        if (section.type === "CTA") {
          return (
            <CtaSection key={section.id} section={section} delayMs={delayMs} />
          );
        }
        if (section.type === "IMAGE_TEXT") {
          return (
            <ImageTextSection
              key={section.id}
              section={section}
              delayMs={delayMs}
            />
          );
        }
        if (section.type === "TEXT") {
          return (
            <TextSection key={section.id} section={section} delayMs={delayMs} />
          );
        }

        return null;
      })}
    </div>
  );
}

function HeroSection({
  section,
  delayMs,
}: {
  section: PublicPageSection;
  delayMs: number;
}) {
  const content = section.content as HeroSectionContent;
  const overlayOpacity = clampOverlay(content.overlayOpacity);

  return (
    <ScrollReveal delayMs={delayMs}>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/95 to-primary-dark text-white shadow-card">
        {content.backgroundImage?.url && (
          <div className="absolute inset-0">
            <Image
              src={content.backgroundImage.url}
              alt={content.title || "Hero image"}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity / 100 }}
            />
          </div>
        )}
        <div className="relative mx-auto flex min-h-[330px] max-w-6xl flex-col justify-center gap-6 px-6 py-14 sm:px-10">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="max-w-3xl text-lg text-white/90">
              {content.subtitle}
            </p>
          )}
          {content.ctaText && content.ctaLink && (
            <div>
              <Link
                href={content.ctaLink}
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                {content.ctaText}
              </Link>
            </div>
          )}
        </div>
      </section>
    </ScrollReveal>
  );
}

function StatsSection({
  section,
  delayMs,
}: {
  section: PublicPageSection;
  delayMs: number;
}) {
  const content = section.content as StatsSectionContent;
  const stats = content.stats || [];

  if (stats.length === 0) {
    return null;
  }

  return (
    <ScrollReveal delayMs={delayMs}>
      <section className="mx-auto max-w-6xl px-2 sm:px-4">
        {content.title && (
          <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
            {content.title}
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, idx) => (
            <article
              key={stat.id || `${section.id}-${idx}`}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-3xl font-bold text-primary">
                {stat.number}
                {stat.unit}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

function CardsSection({
  section,
  delayMs,
}: {
  section: PublicPageSection;
  delayMs: number;
}) {
  const content = section.content as CardsSectionContent;
  const cards = content.cards || [];

  if (cards.length === 0) {
    return null;
  }

  const columnsClass =
    content.cardsPerRow === 2
      ? "lg:grid-cols-2"
      : content.cardsPerRow === 4
        ? "lg:grid-cols-4"
        : "lg:grid-cols-3";

  return (
    <ScrollReveal delayMs={delayMs}>
      <section className="mx-auto max-w-6xl px-2 sm:px-4">
        {content.title && (
          <h2 className="text-2xl font-bold sm:text-3xl">{content.title}</h2>
        )}
        {content.description && (
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {content.description}
          </p>
        )}
        <div className={cn("mt-6 grid gap-4 sm:grid-cols-2", columnsClass)}>
          {cards.map((card, idx) => (
            <article
              key={card.id || `${section.id}-card-${idx}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              {card.image?.url && (
                <div className="relative mb-4 h-40 overflow-hidden rounded-xl">
                  <Image
                    src={card.image.url}
                    alt={card.title || "Card image"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

function FeaturesSection({
  section,
  delayMs,
}: {
  section: PublicPageSection;
  delayMs: number;
}) {
  const content = section.content as FeaturesSectionContent;
  const features = content.features || [];

  if (features.length === 0) {
    return null;
  }

  return (
    <ScrollReveal delayMs={delayMs}>
      <section className="mx-auto max-w-6xl px-2 sm:px-4">
        {content.title && (
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
            {content.title}
          </h2>
        )}
        <div
          className={cn(
            "gap-4",
            content.layout === "list"
              ? "grid"
              : "grid sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {features.map((feature, idx) => (
            <article
              key={feature.id || `${section.id}-feature-${idx}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-2xl">{feature.icon || "•"}</p>
              <h3 className="mt-2 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

function CtaSection({
  section,
  delayMs,
}: {
  section: PublicPageSection;
  delayMs: number;
}) {
  const content = section.content as CtaSectionContent;
  const isDarkText = content.textColor === "dark";

  return (
    <ScrollReveal delayMs={delayMs}>
      <section
        className={cn(
          "relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border px-6 py-12 text-center shadow-card sm:px-10",
          isDarkText ? "bg-accent/10 text-foreground" : "bg-primary text-white",
        )}
      >
        {content.backgroundImage?.url && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={content.backgroundImage.url}
              alt={content.title || "CTA image"}
              fill
              sizes="(max-width: 1024px) 100vw, 1120px"
              className="object-cover"
            />
            <div
              className={cn(
                "absolute inset-0",
                isDarkText ? "bg-white/80" : "bg-black/50",
              )}
            />
          </div>
        )}
        <h2 className="text-2xl font-bold sm:text-3xl">{content.title}</h2>
        {content.description && (
          <p
            className={cn(
              "mx-auto mt-3 max-w-2xl",
              isDarkText ? "text-foreground/80" : "text-white/90",
            )}
          >
            {content.description}
          </p>
        )}
        {content.buttonText && content.buttonLink && (
          <Link
            href={content.buttonLink}
            className={cn(
              "mt-6 inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold transition",
              content.buttonStyle === "secondary"
                ? "bg-white text-primary hover:bg-white/90"
                : isDarkText
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-white text-primary hover:bg-white/90",
            )}
          >
            {content.buttonText}
          </Link>
        )}
      </section>
    </ScrollReveal>
  );
}

function ImageTextSection({
  section,
  delayMs,
}: {
  section: PublicPageSection;
  delayMs: number;
}) {
  const content = section.content as ImageTextSectionContent;

  return (
    <ScrollReveal delayMs={delayMs}>
      <section className="mx-auto max-w-6xl px-2 sm:px-4">
        <div
          className={cn(
            "grid items-center gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm lg:grid-cols-2",
            content.imagePosition === "right" &&
              "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
          )}
        >
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{content.title}</h2>
            {content.content && (
              <div
                className="prose mt-4 max-w-none text-foreground/90"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            )}
          </div>
          {content.image?.url && (
            <div className="relative h-72 overflow-hidden rounded-2xl bg-muted">
              <Image
                src={content.image.url}
                alt={content.title || "Section image"}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>
    </ScrollReveal>
  );
}

function TextSection({
  section,
  delayMs,
}: {
  section: PublicPageSection;
  delayMs: number;
}) {
  const content = section.content as TextSectionContent;

  const textAlignClass =
    content.alignment === "center"
      ? "text-center"
      : content.alignment === "right"
        ? "text-right"
        : "text-left";

  const backgroundClass =
    content.backgroundColor === "blue"
      ? "bg-primary/5"
      : content.backgroundColor === "light-gray"
        ? "bg-muted"
        : content.backgroundColor === "none"
          ? "bg-transparent"
          : "bg-card";

  return (
    <ScrollReveal delayMs={delayMs}>
      <section className="mx-auto max-w-6xl px-2 sm:px-4">
        <div
          className={cn(
            "rounded-3xl border border-border p-6 shadow-sm sm:p-8",
            backgroundClass,
            textAlignClass,
          )}
        >
          {content.title && (
            <h2 className="text-2xl font-bold sm:text-3xl">{content.title}</h2>
          )}
          {content.content && (
            <div
              className="prose mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          )}
        </div>
      </section>
    </ScrollReveal>
  );
}

function clampOverlay(value: number | undefined) {
  if (typeof value !== "number") {
    return 40;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return value;
}
