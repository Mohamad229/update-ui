import Link from "next/link";
import { Languages, FileText } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAllPageKeys,
  getPageDefinition,
} from "@/lib/content/page-definitions";

/**
 * Admin Pages Listing Page
 *
 * Server component that displays all pages with management capabilities.
 * Provides table view with sorting, searching, and bulk operations.
 */
export const metadata = {
  title: "Structured Pages | Damira Admin",
  description: "Manage predefined structured pages and localized content",
};

export default function AdminPagesPage() {
  const pages = getAllPageKeys()
    .map((pageKey) => getPageDefinition(pageKey))
    .filter((page): page is NonNullable<typeof page> => Boolean(page));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Structured Pages"
        description="Each page has predefined sections. Edit content per locale (EN/AR)."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.pageKey}>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {page.label}
              </CardTitle>
              <CardDescription>
                Key: {page.pageKey} | Sections: {page.sections.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Languages className="h-3.5 w-3.5" />
                Locales
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/pages/${page.pageKey}/edit?locale=en`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Edit EN
                  </Button>
                </Link>
                <Link
                  href={`/admin/pages/${page.pageKey}/edit?locale=ar`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Edit AR
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
