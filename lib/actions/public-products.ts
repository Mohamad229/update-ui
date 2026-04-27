"use server";

import { Prisma, ProductStatus, ProductType } from "@prisma/client";

import db from "@/lib/db";
import { defaultLocale, type Locale } from "@/i18n/config";

const DEFAULT_PAGE_SIZE = 9;

export interface PublicProductCatalogQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  therapeuticAreaId?: string;
  status?: ProductStatus;
}

export interface PublicProductCard {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  status: ProductStatus;
  type: ProductType;
  coverImageUrl: string | null;
  category: { id: string; name: string } | null;
  therapeuticArea: { id: string; name: string } | null;
  manufacturer: { id: string; name: string } | null;
}

export interface PublicProductListResult {
  items: PublicProductCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categories: Array<{ id: string; name: string }>;
  therapeuticAreas: Array<{ id: string; name: string }>;
}

export interface PublicProductDetail {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  fullDescription: string | null;
  status: ProductStatus;
  type: ProductType;
  coverImageUrl: string | null;
  category: { id: string; name: string } | null;
  therapeuticArea: { id: string; name: string } | null;
  manufacturer: { id: string; name: string; country: string | null } | null;
  advancedDetails: {
    storageConditions: string | null;
    regulatoryInfo: string | null;
  } | null;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number | null;
  }>;
  relatedProducts: PublicProductCard[];
}

export interface PublishedProductSlug {
  slug: string;
  updatedAt: Date;
}

export async function getPublicProducts(
  locale: Locale,
  query: PublicProductCatalogQuery = {},
): Promise<PublicProductListResult> {
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.max(
    1,
    Math.min(24, query.pageSize || DEFAULT_PAGE_SIZE),
  );
  const search = query.search?.trim() || undefined;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
  };

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.therapeuticAreaId) {
    where.therapeuticAreaId = query.therapeuticAreaId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (search) {
    where.OR = [
      {
        translations: {
          some: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        translations: {
          some: {
            shortDescription: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        translations: {
          some: {
            fullDescription: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  const [products, total, categories, therapeuticAreas] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        therapeuticArea: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
        translations: {
          where: {
            locale: {
              in: [locale, defaultLocale],
            },
          },
          select: {
            locale: true,
            name: true,
            shortDescription: true,
          },
        },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        nameAr: true,
      },
    }),
    db.therapeuticArea.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        nameAr: true,
      },
    }),
  ]);

  const coverImageUrls = await resolveCoverImageUrls(
    products.map((product) => product.coverImage),
  );

  const items: PublicProductCard[] = products.map((product) => {
    const translation = getProductTranslation(product.translations, locale);

    return {
      id: product.id,
      slug: product.slug,
      name: translation?.name || "Untitled Product",
      shortDescription: translation?.shortDescription || null,
      status: product.status,
      type: product.type,
      coverImageUrl: resolveCoverImageValue(product.coverImage, coverImageUrls),
      category: product.category
        ? {
            id: product.category.id,
            name: getLocalizedLabel(
              product.category.name,
              product.category.nameAr,
              locale,
            ),
          }
        : null,
      therapeuticArea: product.therapeuticArea
        ? {
            id: product.therapeuticArea.id,
            name: getLocalizedLabel(
              product.therapeuticArea.name,
              product.therapeuticArea.nameAr,
              locale,
            ),
          }
        : null,
      manufacturer: product.manufacturer,
    };
  });

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    categories: categories.map((category) => ({
      id: category.id,
      name: getLocalizedLabel(category.name, category.nameAr, locale),
    })),
    therapeuticAreas: therapeuticAreas.map((area) => ({
      id: area.id,
      name: getLocalizedLabel(area.name, area.nameAr, locale),
    })),
  };
}

export async function getPublicProductBySlug(
  locale: Locale,
  slug: string,
): Promise<PublicProductDetail | null> {
  const product = await db.product.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          nameAr: true,
        },
      },
      therapeuticArea: {
        select: {
          id: true,
          name: true,
          nameAr: true,
        },
      },
      manufacturer: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
      translations: {
        where: {
          locale: {
            in: [locale, defaultLocale],
          },
        },
        select: {
          locale: true,
          name: true,
          shortDescription: true,
          fullDescription: true,
        },
      },
      advancedDetails: {
        select: {
          storageConditions: true,
          regulatoryInfo: true,
        },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          url: true,
          type: true,
          size: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const translation = getProductTranslation(product.translations, locale);
  const relatedProducts = await getRelatedPublicProducts(
    locale,
    product.id,
    product.categoryId,
    product.therapeuticAreaId,
  );
  const coverImageUrls = await resolveCoverImageUrls([product.coverImage]);

  return {
    id: product.id,
    slug: product.slug,
    name: translation?.name || "Untitled Product",
    shortDescription: translation?.shortDescription || null,
    fullDescription: translation?.fullDescription || null,
    status: product.status,
    type: product.type,
    coverImageUrl: resolveCoverImageValue(product.coverImage, coverImageUrls),
    category: product.category
      ? {
          id: product.category.id,
          name: getLocalizedLabel(
            product.category.name,
            product.category.nameAr,
            locale,
          ),
        }
      : null,
    therapeuticArea: product.therapeuticArea
      ? {
          id: product.therapeuticArea.id,
          name: getLocalizedLabel(
            product.therapeuticArea.name,
            product.therapeuticArea.nameAr,
            locale,
          ),
        }
      : null,
    manufacturer: product.manufacturer,
    advancedDetails: product.advancedDetails,
    attachments: product.attachments,
    relatedProducts,
  };
}

export async function getPublishedProductSlugs(): Promise<
  PublishedProductSlug[]
> {
  return db.product.findMany({
    where: {
      isPublished: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

async function getRelatedPublicProducts(
  locale: Locale,
  productId: string,
  categoryId: string | null,
  therapeuticAreaId: string | null,
): Promise<PublicProductCard[]> {
  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    id: {
      not: productId,
    },
  };

  if (categoryId || therapeuticAreaId) {
    where.OR = [];

    if (categoryId) {
      where.OR.push({ categoryId });
    }

    if (therapeuticAreaId) {
      where.OR.push({ therapeuticAreaId });
    }
  }

  const related = await db.product.findMany({
    where,
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          nameAr: true,
        },
      },
      therapeuticArea: {
        select: {
          id: true,
          name: true,
          nameAr: true,
        },
      },
      manufacturer: {
        select: {
          id: true,
          name: true,
        },
      },
      translations: {
        where: {
          locale: {
            in: [locale, defaultLocale],
          },
        },
        select: {
          locale: true,
          name: true,
          shortDescription: true,
        },
      },
    },
  });

  const coverImageUrls = await resolveCoverImageUrls(
    related.map((item) => item.coverImage),
  );

  return related.map((item) => {
    const translation = getProductTranslation(item.translations, locale);

    return {
      id: item.id,
      slug: item.slug,
      name: translation?.name || "Untitled Product",
      shortDescription: translation?.shortDescription || null,
      status: item.status,
      type: item.type,
      coverImageUrl: resolveCoverImageValue(item.coverImage, coverImageUrls),
      category: item.category
        ? {
            id: item.category.id,
            name: getLocalizedLabel(
              item.category.name,
              item.category.nameAr,
              locale,
            ),
          }
        : null,
      therapeuticArea: item.therapeuticArea
        ? {
            id: item.therapeuticArea.id,
            name: getLocalizedLabel(
              item.therapeuticArea.name,
              item.therapeuticArea.nameAr,
              locale,
            ),
          }
        : null,
      manufacturer: item.manufacturer,
    };
  });
}

function getProductTranslation(
  translations: Array<{
    locale: string;
    name: string;
    shortDescription: string | null;
    fullDescription?: string | null;
  }>,
  locale: Locale,
) {
  return (
    translations.find((translation) => translation.locale === locale) ||
    translations.find((translation) => translation.locale === defaultLocale) ||
    translations[0]
  );
}

function getLocalizedLabel(
  name: string,
  nameAr: string | null,
  locale: Locale,
) {
  if (locale === "ar") {
    return nameAr || name;
  }

  return name;
}

async function resolveCoverImageUrls(coverImageValues: Array<string | null>) {
  const mediaIds = coverImageValues
    .filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    )
    .filter((value) => !isUrlValue(value))
    .filter((value, index, values) => values.indexOf(value) === index);

  if (mediaIds.length === 0) {
    return new Map<string, string>();
  }

  const mediaRecords = await db.media.findMany({
    where: {
      id: {
        in: mediaIds,
      },
    },
    select: {
      id: true,
      url: true,
    },
  });

  return new Map(mediaRecords.map((media) => [media.id, media.url]));
}

function resolveCoverImageValue(
  value: string | null,
  mediaMap: Map<string, string>,
) {
  if (!value) {
    return null;
  }

  if (isUrlValue(value)) {
    return value;
  }

  return mediaMap.get(value) || null;
}

function isUrlValue(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}
