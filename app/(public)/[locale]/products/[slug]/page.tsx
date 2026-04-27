import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { ProductCardData } from "@/components/public/sections/base";

import { HeroSectionV2 } from "@/components/public/sections/v2/hero-section-v2";
import { CtaSection } from "@/components/public/sections/v2/CtaSection-v2";
import {
  ProductInfoSection,
  RelatedProductsSection,
  SpecificationsSection,
} from "@/components/public/sections/product-detail";
import {
  getPublicProductBySlug,
  getPublishedProductSlugs,
  type PublicProductDetail,
} from "@/lib/actions/public-products";
import { buildOgImageUrl, createPublicMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

type ProductDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 900;
export const dynamicParams = true;

function isProductDetailIncomplete(product: PublicProductDetail): boolean {
  const hasNarrative = Boolean(
    product.fullDescription?.trim() || product.shortDescription?.trim(),
  );
  const hasSpecs = Boolean(
    product.advancedDetails?.storageConditions?.trim() ||
      product.advancedDetails?.regulatoryInfo?.trim(),
  );

  return !hasNarrative && !hasSpecs;
}

function getDefaultProductCta(locale: Locale) {
  const isArabic = locale === "ar";

  return {
    eyebrow: isArabic
      ? "هل تحتاج مزيدًا من التفاصيل؟"
      : "Need More Information?",
    title: isArabic
      ? "تواصل مع فريق المنتجات لدى داميرا"
      : "Connect with Damira's Product Team",
    description: isArabic
      ? "يساعدك فريقنا في المعلومات الفنية والتوفر وخطط الإطلاق."
      : "Our team can support technical questions, availability, and launch planning.",
    primaryAction: {
      label: isArabic ? "تواصل معنا" : "Contact Us",
      href: "/contact",
    },
    secondaryAction: {
      label: isArabic ? "استكشف الشراكات" : "Explore Partnerships",
      href: "/partnerships",
    },
  };
}

function buildProductDetailViewModel(
  product: PublicProductDetail,
  locale: Locale,
) {
  const isArabic = locale === "ar";
  const body = [product.fullDescription, product.shortDescription]
    .filter((value): value is string => Boolean(value && value.trim().length > 0))
    .flatMap((value) => value.split(/\n+/))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const productBullets = [
    `${isArabic ? "الفئة" : "Category"}: ${product.category?.name || (isArabic ? "غير محدد" : "Not specified")}`,
    `${isArabic ? "المجال العلاجي" : "Therapeutic Area"}: ${product.therapeuticArea?.name || (isArabic ? "غير محدد" : "Not specified")}`,
    `${isArabic ? "الشركة المصنعة" : "Manufacturer"}: ${product.manufacturer?.name || (isArabic ? "غير محدد" : "Not specified")}`,
  ];

  const specificationItems = [
    {
      label: isArabic ? "الحالة" : "Status",
      value:
        product.status === "AVAILABLE"
          ? isArabic
            ? "متاح"
            : "Available"
          : isArabic
            ? "قيد التطوير"
            : "Pipeline",
    },
    {
      label: isArabic ? "نوع المنتج" : "Product Type",
      value:
        product.type === "ADVANCED"
          ? isArabic
            ? "متقدم"
            : "Advanced"
          : isArabic
            ? "بسيط"
            : "Simple",
    },
    product.advancedDetails?.storageConditions
      ? {
          label: isArabic ? "ظروف التخزين" : "Storage Conditions",
          value: product.advancedDetails.storageConditions,
        }
      : null,
    product.advancedDetails?.regulatoryInfo
      ? {
          label: isArabic ? "معلومات تنظيمية" : "Regulatory Information",
          value: product.advancedDetails.regulatoryInfo,
        }
      : null,
    product.attachments.length > 0
      ? {
          label: isArabic ? "المرفقات" : "Attachments",
          value: isArabic
            ? `${product.attachments.length} ملف`
            : `${product.attachments.length} file(s)`,
        }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  const relatedProducts: ProductCardData[] = product.relatedProducts.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category?.name || (isArabic ? "منتج" : "Product"),
    description:
      item.shortDescription ||
      (isArabic
        ? "لا يوجد وصف متاح حالياً لهذا المنتج."
        : "No description is available for this product yet."),
    indication: item.therapeuticArea?.name,
    badge:
      item.status === "AVAILABLE"
        ? isArabic
          ? "متاح"
          : "Available"
        : isArabic
          ? "قيد التطوير"
          : "Pipeline",
    href: `/products/${item.slug}`,
    image: item.coverImageUrl
      ? {
          src: item.coverImageUrl,
          alt: item.name,
        }
      : undefined,
  }));

  return {
    hero: {
      eyebrow: isArabic ? "تفاصيل المنتج" : "Product Detail",
      title: product.name,
      subtitle: product.shortDescription || undefined,
      actions: [
        {
          label: isArabic ? "العودة إلى المنتجات" : "Back to Products",
          href: "/products",
          variant: "ghost" as const,
        },
      ],
      backgroundImage: product.coverImageUrl
        ? {
            src: product.coverImageUrl,
            alt: product.name,
          }
        : undefined,
    },
    productInfo: {
      eyebrow: isArabic ? "معلومات المنتج" : "Product Information",
      title: product.name,
      subtitle: product.shortDescription || undefined,
      body,
      bullets: productBullets,
      image: product.coverImageUrl
        ? {
            src: product.coverImageUrl,
            alt: product.name,
          }
        : undefined,
    },
    specifications: {
      title: isArabic ? "المواصفات" : "Specifications",
      description: isArabic
        ? "ملخص تقني سريع يدعم فرق الجودة والامتثال والتسجيل."
        : "A quick technical summary for quality, compliance, and registration teams.",
      items: specificationItems,
    },
    relatedProducts: {
      title: isArabic ? "منتجات ذات صلة" : "Related Products",
      description: isArabic
        ? "منتجات أخرى من نفس الفئة أو المجال العلاجي."
        : "Other products from the same category or therapeutic area.",
      items: relatedProducts,
      columns: 3 as const,
    },
    cta: getDefaultProductCta(locale),
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const product = await getPublicProductBySlug(currentLocale, slug);

  if (!product) {
    return createPublicMetadata({
      locale: currentLocale,
      pathname: `/products/${slug}`,
      title: "Product not found",
      description: "The requested product could not be found.",
    });
  }

  const title = product.name;
  const description =
    product.shortDescription ||
    product.fullDescription ||
    (currentLocale === "ar"
      ? "تفاصيل المنتج من داميرا فارما."
      : "Product details from Damira Pharma.");

  return createPublicMetadata({
    locale: currentLocale,
    pathname: `/products/${slug}`,
    title,
    description,
    image: product.coverImageUrl || buildOgImageUrl(title, currentLocale),
    type: "article",
  });
}

export async function generateStaticParams() {
  const slugs = await getPublishedProductSlugs();
  return slugs.map((item) => ({ slug: item.slug }));
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale: Locale = locale === "ar" ? "ar" : "en";
  const product = await getPublicProductBySlug(currentLocale, slug);

  if (!product) {
    notFound();
  }

  const pageData = buildProductDetailViewModel(product, currentLocale);
  const showIncompleteMessage = isProductDetailIncomplete(product);

  return (
    <>
      <HeroSectionV2 data={pageData.hero} />
      {showIncompleteMessage && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#f9d7bf] bg-[#fff5ee] px-5 py-4 text-sm text-[#8a4b1f] sm:px-6 sm:py-5">
            <p className="font-semibold">
              {currentLocale === "ar"
                ? "تفاصيل هذا المنتج غير مكتملة حالياً"
                : "This product detail is currently incomplete"}
            </p>
            <p className="mt-1 text-[#9a6237]">
              {currentLocale === "ar"
                ? "لم يقم المسؤول بإدخال جميع بيانات هذا المنتج بعد. يرجى المحاولة لاحقاً أو التواصل معنا للحصول على التفاصيل."
                : "The admin has not added all required data for this product yet. Please check back later or contact us for full details."}
            </p>
          </div>
        </section>
      )}
      <ProductInfoSection data={pageData.productInfo} />
      <SpecificationsSection data={pageData.specifications} />
      <RelatedProductsSection data={pageData.relatedProducts} />
      <CtaSection data={pageData.cta} />
    </>
  );
}
