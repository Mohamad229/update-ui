import Link from "next/link";
import { AlertCircle, Plus } from "lucide-react";
import { UserRole } from "@prisma/client";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers } from "@/lib/actions/users";
import { requireRole } from "@/lib/auth-utils";

import { UsersTableClient } from "./users-table-client";

export default async function UsersPage() {
  const currentUser = await requireRole([UserRole.ADMIN]);
  const usersResult = await getUsers(1, 10);

  if (!usersResult.success || !usersResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Manage Users"
          description="Manage administrator and internal user access to the CMS"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Management</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {usersResult.error || "Failed to load users."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="Manage administrator and internal user access to the CMS"
        actions={
          <Link href="/admin/users/new">
            <Button size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New User
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UsersTableClient
            initialData={usersResult.data}
            currentUserId={currentUser.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
