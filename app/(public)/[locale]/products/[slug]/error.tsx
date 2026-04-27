"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const isArabic =
    typeof window !== "undefined" && window.location.pathname.startsWith("/ar/");

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 text-center sm:px-6">
      <div className="rounded-2xl border border-[#f9d7bf] bg-[#fff5ee] p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-[#8a4b1f] sm:text-2xl">
          {isArabic ? "تعذر عرض تفاصيل المنتج" : "Unable to load product details"}
        </h1>
        <p className="mt-2 text-sm text-[#9a6237] sm:text-base">
          {isArabic
            ? "حدثت مشكلة في الخادم أو أن بيانات المنتج لم تكتمل بعد من لوحة الإدارة."
            : "A server issue occurred or the product details have not been fully completed in the admin panel yet."}
        </p>
        <p className="mt-2 text-xs text-[#ab744a]">{error.message}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={reset}>
          {isArabic ? "إعادة المحاولة" : "Try again"}
        </Button>
        <Button
          variant="outline"
          render={<Link href={isArabic ? "/ar/products" : "/products"} />}
        >
          {isArabic ? "العودة للمنتجات" : "Back to products"}
        </Button>
      </div>
    </div>
  );
}
