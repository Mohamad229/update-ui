import assert from "node:assert/strict";
import test from "node:test";

import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

const REQUIRED_PRODUCTS_PAGE_KEYS = [
  "kicker",
  "title",
  "subtitle",
  "searchPlaceholder",
  "status",
  "allCategories",
  "allAreas",
  "allStatuses",
  "apply",
  "reset",
  "filters",
  "gridView",
  "listView",
  "results",
  "page",
  "previous",
  "next",
  "emptyTitle",
  "emptyDescription",
] as const;

test("products catalog translations expose required keys in EN and AR", () => {
  const enProductsPage = enMessages.productsPage;
  const arProductsPage = arMessages.productsPage;

  for (const key of REQUIRED_PRODUCTS_PAGE_KEYS) {
    assert.equal(
      typeof enProductsPage[key],
      "string",
      `en.productsPage.${key} must be a string`,
    );
    assert.equal(
      typeof arProductsPage[key],
      "string",
      `ar.productsPage.${key} must be a string`,
    );
    assert.notEqual(
      enProductsPage[key].trim(),
      "",
      `en.productsPage.${key} must not be empty`,
    );
    assert.notEqual(
      arProductsPage[key].trim(),
      "",
      `ar.productsPage.${key} must not be empty`,
    );
  }
});

test("catalog labels are explicitly localized between EN and AR", () => {
  assert.notEqual(enMessages.productsPage.title, arMessages.productsPage.title);
  assert.notEqual(
    enMessages.productsPage.filters,
    arMessages.productsPage.filters,
  );
  assert.notEqual(enMessages.products.available, arMessages.products.available);
  assert.notEqual(enMessages.products.pipeline, arMessages.products.pipeline);
});
