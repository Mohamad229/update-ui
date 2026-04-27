import { AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUserProfile } from "@/lib/actions/users";

import { UserFormClient } from "../user-form-client";

export const metadata = {
  title: "My Profile | Damira Admin",
  description: "Update your account profile and password",
};

export default async function UserProfilePage() {
  const profileResult = await getCurrentUserProfile();

  if (!profileResult.success || !profileResult.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Profile"
          description="Manage your account settings"
        />
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {profileResult.error || "Unable to load your profile."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your display name, email, and password"
      />

      <UserFormClient mode="profile" user={profileResult.data} />
    </div>
  );
}

export const dynamic = "force-dynamic";
