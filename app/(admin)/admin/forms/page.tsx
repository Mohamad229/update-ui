import { AlertCircle } from "lucide-react";

import { FormsTableClient } from "@/app/(admin)/admin/forms/forms-table-client";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFormSubmissionStats,
  getFormSubmissions,
} from "@/lib/actions/forms";
import { requireAuth } from "@/lib/auth-utils";

export default async function FormsPage() {
  await requireAuth();

  const [submissionsResult, statsResult] = await Promise.all([
    getFormSubmissions({
      page: 1,
      pageSize: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    getFormSubmissionStats(),
  ]);

  if (!submissionsResult.success || !submissionsResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Form Submissions"
          description="Review and manage incoming contact and partnership submissions"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission Inbox</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {submissionsResult.error || "Failed to load form submissions."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = statsResult.data;
  const initialNewCount = submissionsResult.data.items.filter(
    (item) => item.status === "NEW",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Form Submissions"
        description="Review and manage incoming contact and partnership submissions"
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold text-foreground">
              {stats.total}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold text-foreground">
              {stats.new}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reviewed
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold text-foreground">
              {stats.reviewed}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Archived
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold text-foreground">
              {stats.archived}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submission Inbox</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <FormsTableClient
            initialData={submissionsResult.data}
            initialNewCount={initialNewCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
