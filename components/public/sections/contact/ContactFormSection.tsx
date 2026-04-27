import { PublicInquiryForm } from "@/components/public/forms/public-inquiry-form";
import { SectionReveal } from "@/components/public/sections/base";
import type { Locale } from "@/i18n/config";

interface ContactFormSectionData {
  title: string;
  description: string;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    inquiryType: string;
    inquiryTypePlaceholder: string;
    inquiryTypeOptions: Array<{
      value: string;
      label: string;
    }>;
    message: string;
    submit: string;
  };
}

interface ContactFormSectionProps {
  data: ContactFormSectionData;
  locale: Locale;
}

export function ContactFormSection({ data, locale }: ContactFormSectionProps) {
  const submitting = locale === "ar" ? "جارٍ الإرسال..." : "Submitting...";
  const privacyNote =
    locale === "ar"
      ? "نحترم خصوصية بياناتك وسنستخدمها للرد على طلبك فقط."
      : "We respect your privacy and will only use your details to respond to your inquiry.";
  const genericError =
    locale === "ar"
      ? "تعذر إرسال الطلب حاليًا. يرجى المحاولة مرة أخرى."
      : "Unable to submit your inquiry right now. Please try again.";
  const successTitle =
    locale === "ar" ? "تم إرسال الطلب بنجاح" : "Inquiry submitted successfully";
  const errorTitle = locale === "ar" ? "فشل الإرسال" : "Submission failed";

  return (
    <SectionReveal>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-secondary/20 bg-gradient-to-br from-card via-card to-secondary/[0.05] p-6 shadow-[var(--shadow-card)] sm:p-7">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            {data.description}
          </p>

          <div className="mt-6">
            <PublicInquiryForm
              locale={locale}
              type="CONTACT"
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
