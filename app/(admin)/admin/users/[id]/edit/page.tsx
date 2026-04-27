import { AlertCircle } from "lucide-react";
import { UserRole } from "@prisma/client";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getUserById } from "@/lib/actions/users";
import { requireRole } from "@/lib/auth-utils";

import { UserFormClient } from "../../user-form-client";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditUserPageProps) {
  const { id } = await params;

  return {
    title: `Edit User ${id} | Damira Admin`,
    description: "Update user profile, role, and password settings",
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireRole([UserRole.ADMIN]);

  const { id } = await params;
  const userResult = await getUserById(id);

  if (!userResult.success || !userResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit User"
          description="Update user account details"
        />
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {userResult.error || "Unable to load this user."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit User"
        description="Update user account details, role, and password"
      />

      <UserFormClient mode="edit" user={userResult.data} />
    </div>
  );
}
