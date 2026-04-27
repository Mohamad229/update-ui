"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/admin/sidebar-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-muted/20">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
