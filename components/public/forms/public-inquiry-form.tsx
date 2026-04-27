"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send, ShieldCheck } from "lucide-react";

import {
  submitPublicForm,
  type PublicFormState,
} from "@/lib/actions/public-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type InquiryFormType = "CONTACT" | "PARTNERSHIP" | "PRODUCT_INQUIRY";

interface InquiryOption {
  value: string;
  label: string;
}

interface InquiryFormLabels {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: string;
  inquiryTypePlaceholder: string;
  message: string;
  submit: string;
  submitting: string;
  privacyNote: string;
  genericError: string;
  successTitle: string;
  errorTitle: string;
}

interface PublicInquiryFormProps {
  locale: "en" | "ar";
  type: InquiryFormType;
  labels: InquiryFormLabels;
  inquiryTypeOptions?: InquiryOption[];
  productId?: string;
}

const INITIAL_STATE: PublicFormState = {
  success: false,
};

export function PublicInquiryForm({
  locale,
  type,
  labels,
  inquiryTypeOptions = [],
  productId,
}: PublicInquiryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(submitPublicForm, INITIAL_STATE);

  const showInquiryType = type !== "CONTACT" || inquiryTypeOptions.length > 0;

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="productId" value={productId || ""} />

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">
            {labels.fullName}
          </label>
          <Input
            className="h-11 rounded-xl border-[#dce8f5] bg-white px-4 text-slate-700 transition-all focus-visible:border-[#0097dc] focus-visible:ring-[#c5e1f5]"
            id="name"
            name="name"
            autoComplete="name"
            error={Boolean(state.fieldErrors?.name)}
          />
          {state.fieldErrors?.name ? (
            <p className="text-xs font-medium text-error">{state.fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            {labels.email}
          </label>
          <Input
            className="h-11 rounded-xl border-[#dce8f5] bg-white px-4 text-slate-700 transition-all focus-visible:border-[#0097dc] focus-visible:ring-[#c5e1f5]"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            error={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email ? (
            <p className="text-xs font-medium text-error">{state.fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
            {labels.phone}
          </label>
          <Input
            className="h-11 rounded-xl border-[#dce8f5] bg-white px-4 text-slate-700 transition-all focus-visible:border-[#0097dc] focus-visible:ring-[#c5e1f5]"
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            error={Boolean(state.fieldErrors?.phone)}
          />
          {state.fieldErrors?.phone ? (
            <p className="text-xs font-medium text-error">{state.fieldErrors.phone}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="company" className="text-sm font-semibold text-slate-700">
            {labels.company}
          </label>
          <Input
            className="h-11 rounded-xl border-[#dce8f5] bg-white px-4 text-slate-700 transition-all focus-visible:border-[#0097dc] focus-visible:ring-[#c5e1f5]"
            id="company"
            name="company"
            autoComplete="organization"
            error={Boolean(state.fieldErrors?.company)}
          />
          {state.fieldErrors?.company ? (
            <p className="text-xs font-medium text-error">{state.fieldErrors.company}</p>
          ) : null}
        </div>
      </div>

      {showInquiryType ? (
        <div className="space-y-1.5">
          <label htmlFor="inquiryType" className="text-sm font-semibold text-slate-700">
            {labels.inquiryType}
          </label>
          <Select
            id="inquiryType"
            name="inquiryType"
            defaultValue=""
            error={Boolean(state.fieldErrors?.inquiryType)}
            placeholder={labels.inquiryTypePlaceholder}
          >
            {inquiryTypeOptions.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
          {state.fieldErrors?.inquiryType ? (
            <p className="text-xs font-medium text-error">{state.fieldErrors.inquiryType}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-semibold text-slate-700">
          {labels.message}
        </label>
        <Textarea
          className="rounded-xl border-[#dce8f5] bg-white p-4 text-slate-700 transition-all focus-visible:border-[#0097dc] focus-visible:ring-[#c5e1f5]"
          id="message"
          name="message"
          rows={6}
          autoResize
          error={Boolean(state.fieldErrors?.message)}
          maxLength={3000}
          showCharacterCount
        />
        {state.fieldErrors?.message ? (
          <p className="text-xs font-medium text-error">{state.fieldErrors.message}</p>
        ) : null}
      </div>

      {state.message ? (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm",
            state.success
              ? "border-[#76c266]/40 bg-[#daecd4]/45 text-[#2f6f2c]"
              : "border-error/40 bg-error/10 text-error",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <p className="font-semibold">{state.success ? labels.successTitle : labels.errorTitle}</p>
          <p className="mt-1">{state.message || labels.genericError}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-[#4cb748]" />
          {labels.privacyNote}
        </p>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="min-w-44 rounded-xl bg-[#0097dc] text-white hover:bg-[#00a5e1]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isPending ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  );
}