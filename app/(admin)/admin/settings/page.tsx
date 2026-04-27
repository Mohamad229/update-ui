import { AlertCircle } from "lucide-react";

import { SettingsManagementClient } from "@/app/(admin)/admin/settings/settings-management-client";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSiteSettings,
  listCategories,
  listManufacturers,
  listTherapeuticAreas,
} from "@/lib/actions/settings";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";

export default async function SettingsPage() {
  await requireRole([UserRole.ADMIN]);

  const [
    categoriesResult,
    therapeuticAreasResult,
    manufacturersResult,
    siteSettingsResult,
  ] = await Promise.all([
    listCategories(),
    listTherapeuticAreas(),
    listManufacturers(),
    getSiteSettings(),
  ]);

  if (
    !categoriesResult.success ||
    !categoriesResult.data ||
    !therapeuticAreasResult.success ||
    !therapeuticAreasResult.data ||
    !manufacturersResult.success ||
    !manufacturersResult.data ||
    !siteSettingsResult.success ||
    !siteSettingsResult.data
  ) {
    const errorMessage =
      categoriesResult.error ||
      therapeuticAreasResult.error ||
      manufacturersResult.error ||
      siteSettingsResult.error ||
      "Failed to load settings data.";

    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure platform behavior and default administration preferences"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {errorMessage}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure platform behavior and default administration preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsManagementClient
            initialCategories={categoriesResult.data}
            initialTherapeuticAreas={therapeuticAreasResult.data}
            initialManufacturers={manufacturersResult.data}
            initialSiteSettings={siteSettingsResult.data}
          />
        </CardContent>
      </Card>
    </div>
  );
}
