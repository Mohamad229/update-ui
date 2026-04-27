import { auth } from "./auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

/**
 * Get the current authenticated user from the session.
 * Returns undefined if not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Require authentication for a server component or action.
 * Redirects to login page if not authenticated.
 * @returns The authenticated user
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return session.user;
}

/**
 * Require specific role(s) for a server component or action.
 * Redirects to login if not authenticated, or to admin dashboard if role not allowed.
 * @param allowedRoles - Array of roles that are allowed access
 * @returns The authenticated user with the required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role as UserRole)) {
    // User is authenticated but doesn't have the required role
    redirect("/admin");
  }

  return user;
}

/**
 * Check if the current user has one of the specified roles.
 * Returns false if not authenticated or role doesn't match.
 * @param allowedRoles - Array of roles to check against
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role as UserRole);
}

/**
 * Check if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole([UserRole.ADMIN]);
}
