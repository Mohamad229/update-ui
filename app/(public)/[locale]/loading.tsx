import { getTranslations } from "next-intl/server";

import { PublicPageSkeleton } from "@/components/public/loading/public-page-skeleton";

export default async function PublicLoading() {
  const t = await getTranslations("errors");

  return (
    <div>
      <PublicPageSkeleton blocks={6} />
      <div className="-mt-4 pb-8 text-center">
        <p className="text-sm font-semibold text-foreground">
          {t("loadingTitle")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("loadingDescription")}
        </p>
      </div>
    </div>
  );
}
