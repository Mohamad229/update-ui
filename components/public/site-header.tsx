import { getTranslations } from "next-intl/server";

import { SiteHeaderClient, type HeaderNavItem } from "./site-header-client";

export async function SiteHeader() {
  const tCommon = await getTranslations("common");
  const tHeader = await getTranslations("header");

  const navItems: HeaderNavItem[] = [
    { href: "/", label: tCommon("home") },
    { href: "/about", label: tCommon("about") },
    { href: "/services", label: tCommon("services") },
    { href: "/products", label: tCommon("products") },
    { href: "/quality", label: tCommon("compliance") },
    { href: "/partnerships", label: tCommon("partnerships") },
    { href: "/contact", label: tCommon("contact") },
  ];

  return (
    <SiteHeaderClient
      navItems={navItems}
      mainNavLabel={tHeader("mainNav")}
    />
  );
}