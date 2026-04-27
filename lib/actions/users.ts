"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import db from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";

// Constants
const SALT_ROUNDS = 12;
const ADMIN_USERS_PATH = "/admin/users";

// Zod Schemas
const createUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "INTERNAL_USER"]).default("INTERNAL_USER"),
});

const updateUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "INTERNAL_USER"]),
});

const updateCurrentUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

// Types
export type ActionState = {
  error?: string;
  success?: boolean;
  data?: unknown;
};

export type UserWithoutPassword = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedUsers = {
  users: UserWithoutPassword[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Helper to exclude password from user object
function excludePassword(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}): UserWithoutPassword {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get all users with pagination support
 * Only accessible by ADMIN role
 */
export async function getUsers(
  page: number = 1,
  limit: number = 10,
): Promise<ActionState & { data?: PaginatedUsers }> {
  try {
    await requireRole([UserRole.ADMIN]);

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.user.count(),
    ]);

    return {
      success: true,
      data: {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching users:", error);
    return { error: "Failed to fetch users" };
  }
}

/**
 * Get a single user by ID
 * Only accessible by ADMIN role
 */
export async function getUserById(
  id: string,
): Promise<ActionState & { data?: UserWithoutPassword }> {
  try {
    await requireRole([UserRole.ADMIN]);

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching user:", error);
    return { error: "Failed to fetch user" };
  }
}

/**
 * Create a new user
 * Only accessible by ADMIN role
 */
export async function createUser(formData: FormData): Promise<ActionState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      role: (formData.get("role") as string) || "INTERNAL_USER",
    };

    // Validate form data
    const validatedFields = createUserSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage =
        errors.email?.[0] ||
        errors.password?.[0] ||
        errors.name?.[0] ||
        errors.role?.[0] ||
        "Invalid input";
      return { error: errorMessage };
    }

    const { email, password, name, role } = validatedFields.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "A user with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
      },
    });

    revalidatePath(ADMIN_USERS_PATH);

    return {
      success: true,
      data: excludePassword(newUser),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error creating user:", error);
    return { error: "Failed to create user" };
  }
}

/**
 * Update an existing user
 * Only accessible by ADMIN role
 */
export async function updateUser(
  id: string,
  formData: FormData,
): Promise<ActionState> {
  try {
    const currentUser = await requireRole([UserRole.ADMIN]);

    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      role: formData.get("role") as string,
    };

    // Validate form data
    const validatedFields = updateUserSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage =
        errors.email?.[0] ||
        errors.password?.[0] ||
        errors.name?.[0] ||
        errors.role?.[0] ||
        "Invalid input";
      return { error: errorMessage };
    }

    const { email, password, name, role } = validatedFields.data;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { error: "User not found" };
    }

    // Check email uniqueness (excluding current user)
    const emailInUse = await db.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (emailInUse) {
      return { error: "A user with this email already exists" };
    }

    // Prevent user from demoting themselves if they're the only admin
    if (
      currentUser.id === id &&
      existingUser.role === UserRole.ADMIN &&
      role !== "ADMIN"
    ) {
      const adminCount = await db.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        return {
          error: "Cannot demote yourself as you are the only admin",
        };
      }
    }

    // Prepare update data
    const updateData: {
      email: string;
      name: string;
      role: UserRole;
      password?: string;
    } = {
      email,
      name,
      role: role as UserRole,
    };

    // Hash password if provided
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(ADMIN_USERS_PATH);

    return {
      success: true,
      data: excludePassword(updatedUser),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error updating user:", error);
    return { error: "Failed to update user" };
  }
}

/**
 * Delete a user
 * Only accessible by ADMIN role
 */
export async function deleteUser(id: string): Promise<ActionState> {
  try {
    const currentUser = await requireRole([UserRole.ADMIN]);

    // Prevent self-deletion
    if (currentUser.id === id) {
      return { error: "You cannot delete your own account" };
    }

    // Check if user exists
    const userToDelete = await db.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return { error: "User not found" };
    }

    // Prevent deleting the last admin user
    if (userToDelete.role === UserRole.ADMIN) {
      const adminCount = await db.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        return { error: "Cannot delete the last admin user" };
      }
    }

    // Delete user
    await db.user.delete({
      where: { id },
    });

    revalidatePath(ADMIN_USERS_PATH);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUserProfile(): Promise<
  ActionState & { data?: UserWithoutPassword }
> {
  try {
    const sessionUser = await requireAuth();

    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching current user profile:", error);
    return { error: "Failed to fetch profile" };
  }
}

/**
 * Update current authenticated user profile
 */
export async function updateCurrentUserProfile(
  formData: FormData,
): Promise<ActionState> {
  try {
    const sessionUser = await requireAuth();

    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
    };

    const validatedFields = updateCurrentUserSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const errorMessage =
        errors.email?.[0] ||
        errors.password?.[0] ||
        errors.name?.[0] ||
        "Invalid input";
      return { error: errorMessage };
    }

    const { email, password, name } = validatedFields.data;

    const emailInUse = await db.user.findFirst({
      where: {
        email,
        NOT: { id: sessionUser.id },
      },
    });

    if (emailInUse) {
      return { error: "A user with this email already exists" };
    }

    const updateData: {
      email: string;
      name: string;
      password?: string;
    } = {
      email,
      name,
    };

    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updatedUser = await db.user.update({
      where: { id: sessionUser.id },
      data: updateData,
    });

    revalidatePath(ADMIN_USERS_PATH);
    revalidatePath(`${ADMIN_USERS_PATH}/profile`);

    return {
      success: true,
      data: excludePassword(updatedUser),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error updating current user profile:", error);
    return { error: "Failed to update profile" };
  }
}
