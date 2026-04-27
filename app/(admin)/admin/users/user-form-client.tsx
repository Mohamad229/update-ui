"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  createUser,
  updateCurrentUserProfile,
  updateUser,
  type UserWithoutPassword,
} from "@/lib/actions/users";

type UserFormMode = "create" | "edit" | "profile";

interface UserFormClientProps {
  mode: UserFormMode;
  user?: UserWithoutPassword;
}

type FormValues = {
  name: string;
  email: string;
  role: "ADMIN" | "INTERNAL_USER";
  password: string;
  confirmPassword: string;
};

function roleLabel(role: "ADMIN" | "INTERNAL_USER"): string {
  return role === "ADMIN" ? "Admin" : "Internal User";
}

export function UserFormClient({ mode, user }: UserFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "INTERNAL_USER",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreate = mode === "create";
  const isProfile = mode === "profile";
  const showRoleField = mode === "create" || mode === "edit";
  const isPasswordRequired = isCreate;

  const passwordHint = useMemo(() => {
    if (isCreate) {
      return "Password is required and must be at least 8 characters.";
    }

    return "Leave password fields empty to keep the current password.";
  }, [isCreate]);

  const onFieldChange = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string | null => {
    if (values.name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }

    if (!values.email.trim()) {
      return "Email is required";
    }

    if (isPasswordRequired && values.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (values.password.length > 0 && values.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (values.password !== values.confirmPassword) {
      return "Password confirmation does not match";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast({
        title: "Validation error",
        description: validationError,
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", values.name.trim());
      formData.set("email", values.email.trim());
      formData.set("password", values.password);

      if (showRoleField) {
        formData.set("role", values.role);
      }

      const result =
        mode === "create"
          ? await createUser(formData)
          : mode === "edit"
            ? await updateUser(user!.id, formData)
            : await updateCurrentUserProfile(formData);

      if (!result.success) {
        toast({
          title: "Failed to save user",
          description: result.error || "Operation failed",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Success",
        description:
          mode === "create"
            ? "User created successfully"
            : mode === "edit"
              ? "User updated successfully"
              : "Profile updated successfully",
        variant: "success",
      });

      if (isProfile) {
        setValues((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        router.refresh();
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>

      {showRoleField ? (
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            id="role"
            value={values.role}
            onChange={(event) =>
              onFieldChange(
                "role",
                event.target.value as "ADMIN" | "INTERNAL_USER",
              )
            }
            required
          >
            <SelectOption value="INTERNAL_USER">Internal User</SelectOption>
            <SelectOption value="ADMIN">Admin</SelectOption>
          </Select>
        </div>
      ) : (
        user && (
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div>
              <Badge variant={user.role === "ADMIN" ? "info" : "outline"}>
                {roleLabel(user.role)}
              </Badge>
            </div>
          </div>
        )
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">
            {isPasswordRequired ? "Password" : "New Password (Optional)"}
          </Label>
          <Input
            id="password"
            type="password"
            value={values.password}
            onChange={(event) => onFieldChange("password", event.target.value)}
            autoComplete={isCreate ? "new-password" : "current-password"}
            minLength={8}
            required={isPasswordRequired}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {isPasswordRequired ? "Confirm Password" : "Confirm New Password"}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={(event) =>
              onFieldChange("confirmPassword", event.target.value)
            }
            autoComplete={isCreate ? "new-password" : "current-password"}
            minLength={8}
            required={isPasswordRequired || values.password.length > 0}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{passwordHint}</p>

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          render={<Link href="/admin/users" />}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create"
            ? "Create User"
            : mode === "edit"
              ? "Save Changes"
              : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}
