import { PublicInquiryForm } from "@/components/public/forms/public-inquiry-form";
import { SectionReveal } from "@/components/public/sections/base";
import type { Locale } from "@/i18n/config";

interface InquiryTypeOption {
  value: string;
  label: string;
}

interface PartnershipInquirySectionData {
  title: string;
  description: string;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    inquiryType: string;
    inquiryTypePlaceholder: string;
    inquiryTypeOptions: InquiryTypeOption[];
    message: string;
    submit: string;
  };
}

interface PartnershipInquirySectionProps {
  data: PartnershipInquirySectionData;
  locale: Locale;
}

export function PartnershipInquirySection({
  data,
  locale,
}: PartnershipInquirySectionProps) {
  const submitting = locale === "ar" ? "جارٍ الإرسال..." : "Submitting...";
  const privacyNote =
    locale === "ar"
      ? "تُستخدم بياناتك لتقييم فرص الشراكة فقط وسيتواصل معك الفريق المختص."
      : "Your details are used only to assess partnership opportunities and route your request to the right team.";
  const genericError =
    locale === "ar"
      ? "تعذر إرسال طلب الشراكة حالياً. يرجى المحاولة مرة أخرى."
      : "Unable to submit your partnership request right now. Please try again.";
  const successTitle =
    locale === "ar" ? "تم استلام طلب الشراكة" : "Partnership request submitted";
  const errorTitle = locale === "ar" ? "فشل الإرسال" : "Submission failed";

  return (
    <SectionReveal>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 shadow-[var(--shadow-card)] sm:p-7">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            {data.description}
          </p>

          <div className="mt-6">
            <PublicInquiryForm
              locale={locale}
              type="PARTNERSHIP"
              labels={{
                fullName: data.fields.fullName,
                email: data.fields.email,
                phone: data.fields.phone,
                company: data.fields.company,
                inquiryType: data.fields.inquiryType,
                inquiryTypePlaceholder: data.fields.inquiryTypePlaceholder,
                message: data.fields.message,
                submit: data.fields.submit,
                submitting,
                privacyNote,
                genericError,
                successTitle,
                errorTitle,
              }}
              inquiryTypeOptions={data.fields.inquiryTypeOptions}
            />
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
