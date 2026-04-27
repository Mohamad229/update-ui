"use server";

import { FormType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import db from "@/lib/db";

export type PublicFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const CONTACT_SCHEMA = z.object({
  type: z.literal("CONTACT"),
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please provide a valid email address."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .trim()
    .max(120, "Company name is too long.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please include at least 10 characters.")
    .max(3000, "Message is too long."),
  inquiryType: z
    .string()
    .trim()
    .min(1, "Please select an inquiry type.")
    .max(80, "Inquiry type is too long."),
  locale: z.enum(["en", "ar"]).default("en"),
  honeypot: z.string().optional().default(""),
});

const PARTNERSHIP_SCHEMA = CONTACT_SCHEMA.extend({
  type: z.literal("PARTNERSHIP"),
});

const PRODUCT_INQUIRY_SCHEMA = CONTACT_SCHEMA.extend({
  type: z.literal("PRODUCT_INQUIRY"),
  productId: z
    .string()
    .trim()
    .max(191, "Product reference is too long.")
    .optional()
    .or(z.literal("")),
});

const PUBLIC_FORM_SCHEMA = z.discriminatedUnion("type", [
  CONTACT_SCHEMA,
  PARTNERSHIP_SCHEMA,
  PRODUCT_INQUIRY_SCHEMA,
]);

function getLocalizedMessage(
  locale: "en" | "ar",
  key: "success" | "error",
): string {
  if (locale === "ar") {
    return key === "success"
      ? "تم استلام رسالتك بنجاح. سيتواصل معك فريق داميرا قريباً."
      : "تعذر إرسال النموذج حالياً. يرجى المحاولة مرة أخرى.";
  }

  return key === "success"
    ? "Your request was submitted successfully. The Damira team will contact you shortly."
    : "Unable to submit your request right now. Please try again.";
}

function toStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function mapFormType(
  type: "CONTACT" | "PARTNERSHIP" | "PRODUCT_INQUIRY",
): FormType {
  if (type === "PARTNERSHIP") {
    return FormType.PARTNERSHIP;
  }

  if (type === "PRODUCT_INQUIRY") {
    return FormType.PRODUCT_INQUIRY;
  }

  return FormType.CONTACT;
}

function validationState(
  locale: "en" | "ar",
  fieldErrors: Record<string, string[] | undefined>,
): PublicFormState {
  return {
    success: false,
    message:
      locale === "ar"
        ? "يرجى مراجعة الحقول المحددة."
        : "Please review the highlighted fields.",
    fieldErrors: Object.entries(fieldErrors).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (value && value[0]) {
          acc[key] = value[0];
        }

        return acc;
      },
      {},
    ),
  };
}

export async function submitPublicForm(
  _previousState: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  const localeInput = toStringValue(formData, "locale");
  const locale: "en" | "ar" = localeInput === "ar" ? "ar" : "en";

  const parsed = PUBLIC_FORM_SCHEMA.safeParse({
    type: toStringValue(formData, "type"),
    name: toStringValue(formData, "name"),
    email: toStringValue(formData, "email"),
    phone: toStringValue(formData, "phone"),
    company: toStringValue(formData, "company"),
    inquiryType: toStringValue(formData, "inquiryType"),
    productId: toStringValue(formData, "productId"),
    message: toStringValue(formData, "message"),
    locale,
    honeypot: toStringValue(formData, "website"),
  });

  if (!parsed.success) {
    return validationState(locale, parsed.error.flatten().fieldErrors);
  }

  const payload = parsed.data;

  if (payload.honeypot.trim().length > 0) {
    return {
      success: true,
      message: getLocalizedMessage(payload.locale, "success"),
    };
  }

  try {
    await db.formSubmission.create({
      data: {
        type: mapFormType(payload.type),
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        company: payload.company || null,
        inquiryType: "inquiryType" in payload ? payload.inquiryType : null,
        message: payload.message,
        productId: "productId" in payload ? payload.productId || null : null,
      },
    });

    revalidatePath("/admin/forms");
    revalidatePath("/admin");

    return {
      success: true,
      message: getLocalizedMessage(payload.locale, "success"),
    };
  } catch (error) {
    console.error("Failed to submit public form:", error);
    return {
      success: false,
      message: getLocalizedMessage(payload.locale, "error"),
    };
  }
}
