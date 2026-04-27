import { AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getFormSubmissionById } from "@/lib/actions/forms";
import { requireAuth } from "@/lib/auth-utils";

import { FormDetailClient } from "./form-detail-client";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;
  const submissionResult = await getFormSubmissionById(id);

  if (!submissionResult.success) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Submission Details"
          description="Review and moderate form submissions"
        />
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {submissionResult.error || "Unable to load this submission."}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submissionResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Submission Details"
          description="Review and moderate form submissions"
        />
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            This submission was not found or has been deleted.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submission Details"
        description="Review and moderate form submissions"
      />
      <FormDetailClient submission={submissionResult.data} />
    </div>
  );
}
