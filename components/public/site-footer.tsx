import { getLocale, getTranslations } from "next-intl/server";
import { Building2, Mail, MapPin, ShieldCheck } from "lucide-react";

import { localeDirection, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;
  const currentYear = new Date().getFullYear();
  const direction = localeDirection[locale];

  const footerLinks = [
    { href: "/", label: tCommon("home") },
    { href: "/about", label: tCommon("about") },
    { href: "/services", label: tCommon("services") },
    { href: "/products", label: tCommon("products") },
    { href: "/partnerships", label: tCommon("partnerships") },
    { href: "/contact", label: tCommon("contact") },
  ];

  const focusAreas = [
    tFooter("focusOncology"),
    tFooter("focusCriticalCare"),
    tFooter("focusNutrition"),
    tFooter("focusDiagnostics"),
  ];

  const stats = [
    { value: "2025", label: tFooter("founded") },
    { value: "1,500 m2", label: tFooter("facility") },
    { value: "9,000 m3", label: tFooter("storage") },
    { value: "50+", label: tFooter("years") },
  ];

  return (
    <footer className="relative border-t border-primary/10 bg-gradient-to-b from-muted/30 to-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <section className="space-y-5">
            <div>
              <p className="text-lg font-bold text-foreground">Damira Pharma</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {tFooter("description")}
              </p>
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {tFooter("location")}
              </p>
              <a
                href={`mailto:${tFooter("email")}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4 text-primary" />
                {tFooter("email")}
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {tFooter("compliance")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                <Building2 className="h-3.5 w-3.5" />
                {tFooter("coverageValue")}
              </span>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground/90">
              {tFooter("quickLinks")}
            </h3>
            <ul className="mt-4 grid gap-2 text-sm">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative inline-block text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                    <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground/90">
              {tFooter("focusAreas")}
            </h3>
            <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
              {focusAreas.map((area) => (
                <li key={area} className="leading-relaxed">
                  {area}
                </li>
              ))}
            </ul>
          </section>

          {/* <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground/90">
              {tFooter("atAGlance")}
            </h3>
            <ul className="mt-4 grid gap-2.5">
              {stats.map((stat) => (
                <li
                  key={stat.label}
                  className="rounded-xl border border-border/70 bg-background/80 px-3 py-2"
                >
                  <p className="text-sm font-bold text-foreground" dir={direction}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </li>
              ))}
            </ul>
          </section> */}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            <span dir={direction}>{currentYear}</span> Damira Pharma.{" "}
            {tFooter("rights")}.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>{tFooter("coverage")}</span>
            <span>{tFooter("coverageValue")}</span>
            <span>{tFooter("complianceValue")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
