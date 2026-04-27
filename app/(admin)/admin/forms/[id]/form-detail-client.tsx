"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  deleteFormSubmission,
  updateFormSubmissionStatus,
  type FormSubmissionDetail,
} from "@/lib/actions/forms";
import { formatDateTime } from "@/lib/utils";

interface FormDetailClientProps {
  submission: FormSubmissionDetail;
}

function getStatusBadgeVariant(status: FormSubmissionDetail["status"]) {
  if (status === "NEW") {
    return "warning" as const;
  }
  if (status === "REVIEWED") {
    return "info" as const;
  }
  return "outline" as const;
}

function formatType(type: FormSubmissionDetail["type"]) {
  if (type === "PRODUCT_INQUIRY") {
    return "Product Inquiry";
  }
  return `${type.charAt(0)}${type.slice(1).toLowerCase()}`;
}

function formatStatus(status: FormSubmissionDetail["status"]) {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}`;
}

export function FormDetailClient({ submission }: FormDetailClientProps) {
  const [status, setStatus] = useState<FormSubmissionDetail["status"]>(
    submission.status,
  );
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const canSaveStatus = useMemo(
    () => status !== submission.status,
    [status, submission.status],
  );

  const handleSaveStatus = () => {
    if (!canSaveStatus) {
      return;
    }

    startTransition(async () => {
      const result = await updateFormSubmissionStatus({
        id: submission.id,
        status,
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "error",
        });
        return;
      }

      toast({
        title: "Status updated",
        description: `Submission moved to ${formatStatus(status)}`,
        variant: "success",
      });

      router.refresh();
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this submission permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteFormSubmission(submission.id);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "error",
        });
        return;
      }

      toast({
        title: "Submission deleted",
        description: `${submission.name}'s submission was removed`,
        variant: "success",
      });

      router.push("/admin/forms");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Name
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {submission.name}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {submission.email}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Phone
              </p>
              <p className="mt-1 text-sm text-foreground">
                {submission.phone || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Company
              </p>
              <p className="mt-1 text-sm text-foreground">
                {submission.company || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Type
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatType(submission.type)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Inquiry Type
              </p>
              <p className="mt-1 text-sm text-foreground">
                {submission.inquiryType || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Product ID
              </p>
              <p className="mt-1 break-all text-sm text-foreground">
                {submission.productId || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Submitted
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatDateTime(submission.createdAt)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Message
            </p>
            <div className="mt-2 rounded-md border bg-muted/30 p-4 text-sm leading-6 text-foreground whitespace-pre-wrap">
              {submission.message}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Current Status
              </p>
              <Badge variant={getStatusBadgeVariant(status)}>
                {formatStatus(status)}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Change Status
              </p>
              <Select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as FormSubmissionDetail["status"],
                  )
                }
                disabled={isPending || isDeleting}
              >
                <option value="NEW">New</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>

            <Button
              onClick={handleSaveStatus}
              disabled={!canSaveStatus || isPending || isDeleting}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Status"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
              <p>
                Deleting removes this record permanently from admin history.
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isDeleting}
              className="w-full"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Submission
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
