"use server";

import { revalidatePath } from "next/cache";
import { FormType, Prisma, SubmissionStatus } from "@prisma/client";
import { z } from "zod";

import { requireAuth } from "@/lib/auth-utils";
import db from "@/lib/db";

const ADMIN_FORMS_PATH = "/admin/forms";
const ADMIN_DASHBOARD_PATH = "/admin";

const FORM_TYPES = ["CONTACT", "PARTNERSHIP", "PRODUCT_INQUIRY"] as const;
const SUBMISSION_STATUSES = ["NEW", "REVIEWED", "ARCHIVED"] as const;

const FormSubmissionFilterSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
  type: z.enum(FORM_TYPES).optional(),
  status: z.enum(SUBMISSION_STATUSES).optional(),
  search: z.string().optional(),
  fromDate: z.union([z.string(), z.date()]).optional(),
  toDate: z.union([z.string(), z.date()]).optional(),
  sortBy: z
    .enum(["name", "email", "type", "status", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const FormSubmissionIdSchema = z.object({
  id: z.string().min(1, "Submission ID is required"),
});

const UpdateSubmissionStatusSchema = z.object({
  id: z.string().min(1, "Submission ID is required"),
  status: z.enum(SUBMISSION_STATUSES),
});

export type ActionState<T = unknown> = {
  error?: string;
  success?: boolean;
  data?: T;
};

export type FormSubmissionFilterOptions = z.infer<
  typeof FormSubmissionFilterSchema
>;

export type FormSubmissionListItem = {
  id: string;
  type: FormType;
  status: SubmissionStatus;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  inquiryType: string | null;
  createdAt: Date;
};

export type FormSubmissionDetail = {
  id: string;
  type: FormType;
  status: SubmissionStatus;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  inquiryType: string | null;
  message: string;
  productId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedFormSubmissions = {
  items: FormSubmissionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type FormSubmissionStats = {
  total: number;
  new: number;
  reviewed: number;
  archived: number;
};

function shouldRethrowNextError(error: unknown): boolean {
  if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
    return true;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  ) {
    return true;
  }

  return false;
}

function parseDateInput(
  dateValue: string | Date | undefined,
  mode: "start" | "end",
): Date | undefined {
  if (!dateValue) {
    return undefined;
  }

  const date =
    dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  if (mode === "start") {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

export async function getFormSubmissions(
  options?: Partial<FormSubmissionFilterOptions>,
): Promise<ActionState<PaginatedFormSubmissions>> {
  try {
    await requireAuth();

    const validatedOptions = FormSubmissionFilterSchema.safeParse(options);

    if (!validatedOptions.success) {
      return { error: "Invalid filter options provided" };
    }

    const {
      page,
      pageSize,
      type,
      status,
      search,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
    } = validatedOptions.data;

    const skip = (page - 1) * pageSize;

    const where: Prisma.FormSubmissionWhereInput = {};

    if (type) {
      where.type = type as FormType;
    }

    if (status) {
      where.status = status as SubmissionStatus;
    }

    const parsedFromDate = parseDateInput(fromDate, "start");
    const parsedToDate = parseDateInput(toDate, "end");

    if (parsedFromDate || parsedToDate) {
      where.createdAt = {
        ...(parsedFromDate && { gte: parsedFromDate }),
        ...(parsedToDate && { lte: parsedToDate }),
      };
    }

    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();

      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { company: { contains: searchTerm, mode: "insensitive" } },
        { inquiryType: { contains: searchTerm, mode: "insensitive" } },
        { message: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.FormSubmissionOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await Promise.all([
      db.formSubmission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          type: true,
          status: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          inquiryType: true,
          createdAt: true,
        },
      }),
      db.formSubmission.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }
    console.error("Error fetching form submissions:", error);
    return { error: "Failed to fetch form submissions" };
  }
}

export async function getFormSubmissionById(
  id: string,
): Promise<ActionState<FormSubmissionDetail | null>> {
  try {
    await requireAuth();

    const validatedId = FormSubmissionIdSchema.safeParse({ id });

    if (!validatedId.success) {
      return { error: "Invalid submission ID" };
    }

    const submission = await db.formSubmission.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!submission) {
      return { success: true, data: null };
    }

    return { success: true, data: submission };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }
    console.error("Error fetching form submission:", error);
    return { error: "Failed to fetch form submission" };
  }
}

export async function updateFormSubmissionStatus(
  input: z.infer<typeof UpdateSubmissionStatusSchema>,
): Promise<ActionState> {
  try {
    await requireAuth();

    const validatedInput = UpdateSubmissionStatusSchema.safeParse(input);

    if (!validatedInput.success) {
      const errors = validatedInput.error.flatten().fieldErrors;
      const errorMessage =
        errors.id?.[0] || errors.status?.[0] || "Invalid status update payload";
      return { error: errorMessage };
    }

    const { id, status } = validatedInput.data;

    const existingSubmission = await db.formSubmission.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingSubmission) {
      return { error: "Submission not found" };
    }

    await db.formSubmission.update({
      where: { id },
      data: { status: status as SubmissionStatus },
    });

    revalidatePath(ADMIN_FORMS_PATH);
    revalidatePath(`${ADMIN_FORMS_PATH}/${id}`);
    revalidatePath(ADMIN_DASHBOARD_PATH);

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }
    console.error("Error updating form submission status:", error);
    return { error: "Failed to update submission status" };
  }
}

export async function markFormSubmissionReviewed(
  id: string,
): Promise<ActionState> {
  return updateFormSubmissionStatus({ id, status: "REVIEWED" });
}

export async function deleteFormSubmission(id: string): Promise<ActionState> {
  try {
    await requireAuth();

    const validatedId = FormSubmissionIdSchema.safeParse({ id });

    if (!validatedId.success) {
      return { error: "Invalid submission ID" };
    }

    const existingSubmission = await db.formSubmission.findUnique({
      where: { id: validatedId.data.id },
      select: { id: true },
    });

    if (!existingSubmission) {
      return { error: "Submission not found" };
    }

    await db.formSubmission.delete({
      where: { id: validatedId.data.id },
    });

    revalidatePath(ADMIN_FORMS_PATH);
    revalidatePath(`${ADMIN_FORMS_PATH}/${id}`);
    revalidatePath(ADMIN_DASHBOARD_PATH);

    return { success: true };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }
    console.error("Error deleting form submission:", error);
    return { error: "Failed to delete form submission" };
  }
}

export async function getFormSubmissionStats(): Promise<
  ActionState<FormSubmissionStats>
> {
  try {
    await requireAuth();

    const [total, newCount, reviewed, archived] = await Promise.all([
      db.formSubmission.count(),
      db.formSubmission.count({ where: { status: SubmissionStatus.NEW } }),
      db.formSubmission.count({ where: { status: SubmissionStatus.REVIEWED } }),
      db.formSubmission.count({ where: { status: SubmissionStatus.ARCHIVED } }),
    ]);

    return {
      success: true,
      data: {
        total,
        new: newCount,
        reviewed,
        archived,
      },
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }
    console.error("Error fetching form submission stats:", error);
    return { error: "Failed to fetch submission stats" };
  }
}

export async function getNewSubmissionsCount(): Promise<
  ActionState<{ count: number }>
> {
  try {
    await requireAuth();

    const count = await db.formSubmission.count({
      where: {
        status: SubmissionStatus.NEW,
      },
    });

    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    if (shouldRethrowNextError(error)) {
      throw error;
    }
    console.error("Error fetching new submissions count:", error);
    return { error: "Failed to fetch new submissions count" };
  }
}
