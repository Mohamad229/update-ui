import { getTranslations } from "next-intl/server";
import {
  Building2,
  Mail,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";

import { localeDirection, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getPublicSiteSettings } from "@/lib/site-settings";

interface SiteFooterV2Props {
  locale: Locale;
}

export async function SiteFooterV2({ locale }: SiteFooterV2Props) {
  const [tCommon, tFooter, siteSettings] = await Promise.all([
    getTranslations("common"),
    getTranslations("footer"),
    getPublicSiteSettings(),
  ]);
  const currentYear = new Date().getFullYear();
  const direction = localeDirection[locale];
  const siteName = siteSettings.siteName || "DAMIRA PHARMA";
  const siteDescription = siteSettings.siteTagline || tFooter("description");
  const contactEmail = siteSettings.contactEmail || tFooter("email");
  const contactAddress = siteSettings.contactAddress || tFooter("location");

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

  return (
    <footer className="relative overflow-hidden border-t border-[#dce9f6] bg-gradient-to-b from-[#f8fbff] via-white to-white pt-16 sm:pt-20 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,#c5e1f5_0%,transparent_30%),radial-gradient(circle_at_92%_8%,#fee2cd_0%,transparent_28%),radial-gradient(circle_at_85%_90%,#daecd4_0%,transparent_28%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-[#e6eef8] pb-10 sm:gap-12 sm:pb-12 lg:grid-cols-12">
          {/* Brand / about */}
          <section className="lg:col-span-5">
            <Link href="/" className="group inline-flex items-center">
              <Image
                src="/Damira_Logo_SVG.svg"
                alt="Damira Pharma"
                width={220}
                height={95}
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
              {siteDescription}
            </p>

            {/* <div className="mt-6 grid gap-3">
              <a
                href={`mailto:${contactEmail}`}
                className="group inline-flex w-fit items-center gap-3 rounded-xl border border-[#dfeaf6] bg-white px-4 py-2.5 text-sm text-slate-700 transition-all hover:border-[#91caee] hover:bg-[#f7fbff]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c5e1f5]/60 text-[#0097dc]">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="font-medium">{contactEmail}</span>
              </a>

              <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-[#dfeaf6] bg-white px-4 py-2.5 text-sm text-slate-700">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fee2cd]/70 text-[#f58238]">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="font-medium">{contactAddress}</span>
              </div>
            </div> */}
          </section>

          {/* Links */}
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:gap-12">
            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {tFooter("quickLinks")}
              </h3>
              <ul className="grid gap-2.5">
                {footerLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#0097dc]"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#0097dc] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {tFooter("focusAreas")}
              </h3>
              <ul className="grid gap-3">
                {focusAreas.map((area, i) => (
                  <li key={area} className="flex items-start gap-3">
                    <span className="mt-[2px] text-[10px] font-bold tracking-[0.14em] text-[#0097dc]">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm text-slate-700">{area}</span>
                  </li>
                ))}
              </ul>
            </section> */}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-4 py-6 text-xs text-slate-500 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-medium">
            &copy; <span dir={direction}>{currentYear}</span>{" "}
            {siteName.toUpperCase()}.{" "}
            {tFooter("rights")?.toUpperCase() || "ALL RIGHTS RESERVED"}.
          </p>

          {/* <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce9f6] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-[#4cb748]" />
              {tFooter("complianceValue")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce9f6] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              <Building2 className="h-3.5 w-3.5 text-[#f58238]" />
              {tFooter("coverageValue")}
            </span>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
