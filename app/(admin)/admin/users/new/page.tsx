import { PageHeader } from "@/components/admin/page-header";
import { UserRole } from "@prisma/client";

import { requireRole } from "@/lib/auth-utils";

import { UserFormClient } from "../user-form-client";

export const metadata = {
  title: "Create User | Damira Admin",
  description: "Create a new admin or internal CMS user",
};

export default async function NewUserPage() {
  await requireRole([UserRole.ADMIN]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create User"
        description="Add a new user account and assign the appropriate role"
      />

      <UserFormClient mode="create" />
    </div>
  );
}
