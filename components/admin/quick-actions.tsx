import Link from "next/link";

import { FileText, Inbox, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
}

const quickActions: QuickAction[] = [
  {
    label: "Add Product",
    href: "/admin/products/new",
    icon: Package,
  },
  {
    label: "Manage Pages",
    href: "/admin/pages",
    icon: FileText,
  },
  {
    label: "View Submissions",
    href: "/admin/forms",
    icon: Inbox,
  },
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <Card
      variant="elevated"
      className={cn(
        "transition-shadow duration-300 hover:shadow-lg",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              variant="outline"
              size="lg"
              className="w-full justify-start gap-2"
              render={<Link href={action.href} />}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
