import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageFormClient } from "../page-form-client";

/**
 * Create New Page
 *
 * Server component that renders the page creation form.
 * Passes mode="create" to form component.
 */
export const metadata = {
  title: "Legacy Page Create | Damira Admin",
  description: "Legacy dynamic page creation flow (deprecated)",
};

interface NewPagePageProps {
  searchParams: Promise<{ legacy?: string | string[] }>;
}

export default async function NewPagePage({ searchParams }: NewPagePageProps) {
  const query = await searchParams;
  const legacyParam = Array.isArray(query.legacy)
    ? query.legacy[0]
    : query.legacy;
  const allowLegacy = legacyParam === "1" || legacyParam === "true";

  if (!allowLegacy) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Structured CMS Active"
          description="The old dynamic page creation screen is now legacy-only."
        />

        <Card>
          <CardHeader>
            <CardTitle>Use Structured Page Management</CardTitle>
            <CardDescription>
              Pages are predefined (home, about, services, products, contact).
              Use the structured editor per page and locale.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/admin/pages">
              <Button>Go to Structured Pages</Button>
            </Link>
            <Link href="/admin/pages/new?legacy=1">
              <Button variant="outline">Open Legacy Create Flow</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Page (Legacy)"
        description="Deprecated dynamic flow kept for backward compatibility"
      />

      <PageFormClient mode="create" />
    </div>
  );
}
