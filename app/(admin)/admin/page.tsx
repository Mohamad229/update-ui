import { Activity, FileText, Image, Inbox, Package, Users } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { QuickActions } from "@/components/admin/quick-actions";
import { RecentActivity } from "@/components/admin/recent-activity";
import { StatsCard } from "@/components/admin/stats-card";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    products,
    pagesV2,
    pagesLegacy,
    mediaFiles,
    formSubmissions,
    users,
  ] = await Promise.all([
    db.product.count(),
    db.pageContent.count(),
    db.page.count(),
    db.media.count(),
    db.formSubmission.count(),
    db.user.count(),
  ]);

  const managedPages = Math.max(pagesV2, pagesLegacy);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of products, content, media, and submissions"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard label="Products" value={products} icon={Package} accent="blue" />
        <StatsCard label="Pages" value={managedPages} icon={FileText} accent="green" />
        <StatsCard label="Media Files" value={mediaFiles} icon={Image} accent="orange" />
        <StatsCard
          label="Form Submissions"
          value={formSubmissions}
          icon={Inbox}
          accent="cyan"
        />
        <StatsCard label="Users" value={users} icon={Users} accent="purple" />
        <StatsCard
          label="System Health"
          value="OK"
          icon={Activity}
          accent="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <QuickActions className="lg:col-span-1" />
        <RecentActivity className="lg:col-span-2" />
      </div>
    </div>
  );
}
