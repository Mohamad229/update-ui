import { Mail, MapPin, PhoneCall } from "lucide-react";

import { SectionReveal } from "@/components/public/sections/base";

interface ContactInfoItem {
  label: string;
  value: string;
  href?: string;
}

interface ContactInfoSectionProps {
  data: {
    title: string;
    description?: string;
    items: ContactInfoItem[];
  };
}

const ICONS = [MapPin, PhoneCall, Mail] as const;

export function ContactInfoSection({ data }: ContactInfoSectionProps) {
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

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {data.items.map((item, index) => {
            const Icon = ICONS[index] || MapPin;

            return (
              <article
                key={item.label}
                className="rounded-3xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-2 block text-sm font-medium text-foreground transition hover:text-primary"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {item.value}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </SectionReveal>
  );
}
