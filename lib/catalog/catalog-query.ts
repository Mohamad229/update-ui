import { type ProductStatus } from "@prisma/client";

export type CatalogView = "grid" | "list";

export interface ParsedCatalogParams {
  search?: string;
  category?: string;
  therapeuticArea?: string;
  status?: ProductStatus;
  page: number;
  view: CatalogView;
}

export function parseCatalogSearchParams(
  query: Record<string, string | string[] | undefined>,
): ParsedCatalogParams {
  const search = toSingleValue(query.search);
  const category = toSingleValue(query.category);
  const therapeuticArea = toSingleValue(query.therapeuticArea);
  const statusRaw = toSingleValue(query.status);
  const pageRaw = Number(toSingleValue(query.page) || "1");
  const viewRaw = toSingleValue(query.view);

  const status =
    statusRaw === "AVAILABLE" || statusRaw === "PIPELINE"
      ? statusRaw
      : undefined;
  const view: CatalogView = viewRaw === "list" ? "list" : "grid";
  const page = Number.isNaN(pageRaw) ? 1 : Math.max(1, pageRaw);

  return {
    search,
    category,
    therapeuticArea,
    status,
    page,
    view,
  };
}

export function buildCatalogUrl(
  pathname: string,
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>,
) {
  const nextParams = new URLSearchParams(current.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
  });

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildCatalogPaginationHref(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  nextPage: number,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (nextPage > 1) {
    params.set("page", String(nextPage));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function toSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}
