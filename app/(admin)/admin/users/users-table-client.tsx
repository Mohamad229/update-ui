"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  deleteUser,
  getUsers,
  type PaginatedUsers,
  type UserWithoutPassword,
} from "@/lib/actions/users";
import { formatDateTime } from "@/lib/utils";

interface UsersTableClientProps {
  initialData: PaginatedUsers;
  currentUserId: string;
}

function formatRole(role: UserWithoutPassword["role"]): string {
  return role === "ADMIN" ? "Admin" : "Internal User";
}

function roleVariant(role: UserWithoutPassword["role"]) {
  return role === "ADMIN" ? ("info" as const) : ("outline" as const);
}

export function UsersTableClient({
  initialData,
  currentUserId,
}: UsersTableClientProps) {
  const [users, setUsers] = useState<UserWithoutPassword[]>(initialData.users);
  const [currentPage, setCurrentPage] = useState(initialData.page);
  const [totalItems, setTotalItems] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [limit, setLimit] = useState(initialData.limit);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const hasUsers = users.length > 0;

  const paginationLabel = useMemo(() => {
    if (totalItems === 0) {
      return "0 of 0";
    }

    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalItems);
    return `${start}-${end} of ${totalItems}`;
  }, [currentPage, limit, totalItems]);

  const loadUsers = (page: number) => {
    startTransition(async () => {
      const result = await getUsers(page, limit);

      if (!result.success || !result.data) {
        toast({
          title: "Error",
          description: result.error || "Failed to load users",
          variant: "error",
        });
        return;
      }

      setUsers(result.data.users);
      setCurrentPage(result.data.page);
      setTotalItems(result.data.total);
      setTotalPages(result.data.totalPages);
      setLimit(result.data.limit);
    });
  };

  const handleDeleteUser = async (user: UserWithoutPassword) => {
    const confirmed = window.confirm(
      `Delete user "${user.name}" (${user.email})? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(user.id);

    try {
      const result = await deleteUser(user.id);

      if (!result.success) {
        toast({
          title: "Unable to delete user",
          description: result.error || "Delete action was rejected",
          variant: "error",
        });
        return;
      }

      toast({
        title: "User deleted",
        description: `${user.name} was removed successfully`,
        variant: "success",
      });

      const nextPage =
        users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      loadUsers(nextPage);
    } finally {
      setDeletingId(null);
    }
  };

  if (!hasUsers) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/25 bg-card/50 p-12">
        <Plus className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          No users found
        </h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Create the first user account to start managing CMS access.
        </p>
        <Link href="/admin/users/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-11 px-4 text-left font-semibold text-foreground">
                Name
              </th>
              <th className="h-11 px-4 text-left font-semibold text-foreground">
                Email
              </th>
              <th className="h-11 px-4 text-left font-semibold text-foreground">
                Role
              </th>
              <th className="h-11 px-4 text-left font-semibold text-foreground">
                Status
              </th>
              <th className="h-11 px-4 text-left font-semibold text-foreground">
                Updated
              </th>
              <th className="h-11 px-4 text-left font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isDeleting = deletingId === user.id;

              return (
                <tr
                  key={user.id}
                  className="border-b last:border-b-0 hover:bg-muted/40"
                >
                  <td className="h-14 px-4 align-middle font-medium text-foreground">
                    {user.name}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </td>
                  <td className="h-14 px-4 align-middle text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="h-14 px-4 align-middle">
                    <Badge variant={roleVariant(user.role)}>
                      {formatRole(user.role)}
                    </Badge>
                  </td>
                  <td className="h-14 px-4 align-middle">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td className="h-14 px-4 align-middle text-muted-foreground">
                    {formatDateTime(user.updatedAt)}
                  </td>
                  <td className="h-14 px-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit user">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={
                          isSelf
                            ? "Cannot delete your own account"
                            : "Delete user"
                        }
                        className="text-destructive hover:text-destructive"
                        disabled={isSelf || isDeleting || isPending}
                        onClick={() => handleDeleteUser(user)}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">{paginationLabel}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm text-muted-foreground">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
