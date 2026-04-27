"use server";

import { z } from "zod";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";

// Zod validation schema for login
const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validate form data
  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const errorMessage =
      errors.email?.[0] || errors.password?.[0] || "Invalid input";
    return { error: errorMessage };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "An error occurred during sign in" };
      }
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
}
