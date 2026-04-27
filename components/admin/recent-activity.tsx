import { FileText, Inbox, Package, Settings, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  text: string;
  time: string;
}

const activities: ActivityItem[] = [
  {
    id: "1",
    icon: Package,
    iconBg: "bg-blue-500/10 dark:bg-blue-400/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    text: 'New product "Paracetamol 500mg" added',
    time: "2 minutes ago",
  },
  {
    id: "2",
    icon: FileText,
    iconBg: "bg-green-500/10 dark:bg-green-400/15",
    iconColor: "text-green-600 dark:text-green-400",
    text: "About page updated",
    time: "15 minutes ago",
  },
  {
    id: "3",
    icon: Inbox,
    iconBg: "bg-orange-500/10 dark:bg-orange-400/15",
    iconColor: "text-orange-600 dark:text-orange-400",
    text: "New form submission received",
    time: "1 hour ago",
  },
  {
    id: "4",
    icon: UserPlus,
    iconBg: "bg-cyan-500/10 dark:bg-cyan-400/15",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    text: 'New user "Sarah Johnson" registered',
    time: "3 hours ago",
  },
  {
    id: "5",
    icon: Settings,
    iconBg: "bg-purple-500/10 dark:bg-purple-400/15",
    iconColor: "text-purple-600 dark:text-purple-400",
    text: "Site settings modified",
    time: "Yesterday",
  },
];

interface RecentActivityProps {
  className?: string;
}

export function RecentActivity({ className }: RecentActivityProps) {
  return (
    <Card
      variant="elevated"
      className={cn(
        "transition-shadow duration-300 hover:shadow-lg",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  activity.iconBg,
                )}
              >
                <Icon
                  className={cn("size-4", activity.iconColor)}
                  strokeWidth={1.75}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {activity.text}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
