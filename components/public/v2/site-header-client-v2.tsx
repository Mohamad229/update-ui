"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";

import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/public/language-switcher";

export type HeaderNavItem = {
  href: string;
  label: string;
  subItems?: { href: string; label: string }[];
};

type SiteHeaderClientV2Props = {
  navItems: HeaderNavItem[];
  mainNavLabel: string;
};

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function isNavItemActive(pathname: string, href: string): boolean {
  const normalizedPathname = normalizePath(pathname);
  const normalizedHref = normalizePath(href);

  if (normalizedHref === "/") return normalizedPathname === "/";
  return (
    normalizedPathname === normalizedHref ||
    normalizedPathname.startsWith(`${normalizedHref}/`)
  );
}

function buildLocalizedHashHref(href: string, locale: string): string {
  const hashIndex = href.indexOf("#");
  const path = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);

  if (!path.startsWith("/")) return href;

  if (locale !== "en" && (path === `/${locale}` || path.startsWith(`/${locale}/`))) {
    return `${path}${hash}`;
  }

  if (locale === "en") return `${path}${hash}`;

  const localizedPath = path === "/" ? `/${locale}` : `/${locale}${path}`;
  return `${localizedPath}${hash}`;
}

export function SiteHeaderClientV2({ navItems, mainNavLabel }: SiteHeaderClientV2Props) {
  const pathname = usePathname();
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 1. تحديد الحالة الأولية للسكرول بدون الحاجة لعمل setState داخل الـ useEffect
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window !== "undefined") {
      return window.scrollY > 16;
    }
    return false;
  });

  // // 2. إغلاق القائمة عند تغير المسار بدون استخدام useEffect (الطريقة الموصى بها في React)
  // const prevPathname = useRef(pathname);
  // if (pathname !== prevPathname.current) {
  //   prevPathname.current = pathname;
  //   setIsMobileMenuOpen(false);
  // }

  // الآن نضع فقط مستمع الحدث (Event Listener) داخل الـ useEffect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    
    // لا نستدعي handleScroll() هنا مباشرة كما كان في السابق
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[#dbe8f5] bg-white/90 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)] backdrop-blur-xl"
          : "border-b border-transparent bg-white/75 backdrop-blur-lg",
      ].join(" ")}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group inline-flex items-center">
          <Image
            src="/Damira_Logo_SVG.svg"
            alt="Damira Pharma"
            width={190}
            height={82}
            priority
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label={mainNavLabel} className="hidden items-center gap-1.5 min-[900px]:flex">
          {navItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] lg:px-2.5 lg:text-[12px] xl:text-[15px] font-semibold transition-all duration-200",
                    active
                      ? "bg-[#c5e1f5]/55 text-[#0097dc]"
                      : "text-slate-600 hover:bg-[#f3f8fd] hover:text-[#0097dc]",
                  ].join(" ")}
                >
                  {item.label}
                  {item.subItems && (
                    <ChevronDown className="h-3 w-3 text-slate-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-[#0097dc]" />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.subItems && (
                  <div className="absolute top-full left-1/2 z-50 mt-1 w-60 -translate-x-1/2 opacity-0 invisible translate-y-3 rounded-2xl border border-slate-100/50 bg-white/95 backdrop-blur-xl p-2.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] shadow-[#0097dc]/5 transition-all duration-300 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="flex w-full flex-col gap-1">
                      {item.subItems.map((sub, i) => (
                        <li key={i}>
                          <a
                            href={buildLocalizedHashHref(sub.href, locale)}
                            className="group/sub flex w-full items-center rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-[#f3f8fd] hover:text-[#0097dc]"
                          >
                            <span className="relative">
                              {sub.label}
                              <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-[#0097dc] opacity-0 transition-all duration-300 group-hover/sub:w-full group-hover/sub:opacity-100" />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden min-[900px]:block">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#dce8f5] bg-white text-slate-700 transition-colors hover:border-[#91caee] hover:text-[#0097dc] min-[900px]:hidden"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={[
          "min-[900px]:hidden overflow-y-auto border-t border-[#e3edf8] bg-white transition-all duration-300",
          isMobileMenuOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      if (!item.subItems) setIsMobileMenuOpen(false);
                    }}
                    className={[
                      "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[#c5e1f5]/60 text-[#0097dc]"
                        : "text-slate-700 hover:bg-[#f3f8fd] hover:text-[#0097dc]",
                    ].join(" ")}
                  >
                    <span>{item.label}</span>
                    {item.subItems && (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </Link>

                  {/* Mobile Submenu Dropdown */}
                  {item.subItems && (
                    <div className="mt-1 flex flex-col gap-1 border-l-2 border-[#dbe8f5] ml-4 pl-3">
                      {item.subItems.map((sub, i) => (
                        <a
                          key={i}
                          href={buildLocalizedHashHref(sub.href, locale)}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-[#0097dc]/5 hover:text-[#0097dc] transition-colors"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mb-4">
            <LanguageSwitcher variant="inline" label="Switch Language" />
          </div>
          
        </div>
      </div>
    </header>
  );
}