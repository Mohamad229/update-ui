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
  const submitting = locale === "ar" ? "جاري الإرسال..." : "Submitting...";
  const privacyNote =
    locale === "ar"
      ? "نحترم خصوصية بياناتك وسنستخدمها للرد على طلبك فقط."
      : "We respect your privacy and will only use your details to respond to your inquiry.";
  const genericError =
    locale === "ar"
      ? "تعذر إرسال الطلب حاليًا. يرجى المحاولة مرة أخرى."
      : "Unable to submit your inquiry right now. Please try again.";
  const successTitle = locale === "ar" ? "تم إرسال الطلب بنجاح" : "Inquiry submitted successfully";
  const errorTitle = locale === "ar" ? "فشل الإرسال" : "Submission failed";

  return (
    <SectionReveal>
      <section className="relative overflow-hidden border-y border-[#e8eff7] bg-gradient-to-b from-white to-[#f8fbff] py-16 sm:py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,#c5e1f5_0%,transparent_30%),radial-gradient(circle_at_88%_88%,#fee2cd_0%,transparent_28%)]" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              {data.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
              {data.description}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e4edf8] bg-white p-5 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.45)] sm:p-7 md:p-8">
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