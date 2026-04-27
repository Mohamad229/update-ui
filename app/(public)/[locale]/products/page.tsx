import type { Metadata } from "next";

import type { ProductCardData } from "@/components/public/sections/base";

import { HeroSectionV2 } from "@/components/public/sections/v2/hero-section-v2";

import { ProductCatalogFilterSectionV2 } from "@/components/public/products/product-catalog-filter-section-v2";
import {
  CategoriesSection,
  CurrentPortfolioSection,
  PipelineSegmentsSection,
} from "@/components/public/sections/products";
import { getPublicProducts } from "@/lib/actions/public-products";
import { getManagedPublicPageData } from "@/lib/content/public-ui";
import { buildOgImageUrl, createPublicMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 900;

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const pageData = await getManagedPublicPageData("products", currentLocale);

  const title = pageData.metadata.title;
  const description = pageData.metadata.description;

  return createPublicMetadata({
    locale: currentLocale,
    pathname: "/products",
    title,
    description,
    image: buildOgImageUrl(title, currentLocale),
  });
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const [pageData, publicProducts] = await Promise.all([
    getManagedPublicPageData("products", currentLocale),
    getPublicProducts(currentLocale, { page: 1, pageSize: 24 }),
  ]);

  const catalogItems: ProductCardData[] =
    publicProducts.items.length > 0
      ? publicProducts.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category?.name || (currentLocale === "ar" ? "منتج" : "Product"),
          description:
            item.shortDescription ||
            (currentLocale === "ar"
              ? "لا يوجد وصف متاح حالياً لهذا المنتج."
              : "No description is available for this product yet."),
          indication: item.therapeuticArea?.name,
          storage: undefined,
          badge: item.status === "AVAILABLE"
            ? currentLocale === "ar"
              ? "متاح"
              : "Available"
            : currentLocale === "ar"
              ? "قيد التطوير"
              : "Pipeline",
          href: `/products/${item.slug}`,
          image: item.coverImageUrl
            ? {
                src: item.coverImageUrl,
                alt: item.name,
              }
            : undefined,
        }))
      : pageData.catalog.items;

  const categoryOptions =
    publicProducts.categories.length > 0
      ? publicProducts.categories.map((category) => ({
          id: category.id,
          label: category.name,
          value: category.name,
        }))
      : undefined;

  return (
    <>
      <section id="products-overview" className="scroll-mt-32">
        <HeroSectionV2 data={pageData.hero} />
      </section>
      <section id="products-categories" className="scroll-mt-32">
        <CategoriesSection data={pageData.categories} />
      </section>
      {/* <CurrentPortfolioSection data={pageData.currentPortfolio} /> */}
      <section id="products-pipeline" className="scroll-mt-32">
        <PipelineSegmentsSection data={pageData.pipelineSegments} />
      </section>
      <section id="products-catalog" className="scroll-mt-32">
        <ProductCatalogFilterSectionV2
          locale={currentLocale}
          title={pageData.catalog.title}
          description={pageData.catalog.description}
          items={catalogItems}
          columns={pageData.catalog.columns}
          categoryOptions={categoryOptions}
        />
      </section>
    </>
  );
}
