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

export function PartnershipInquirySectionV2({ data, locale }: PartnershipInquirySectionProps) {
  return (
    <SectionReveal>
      <section className="relative overflow-hidden border-y border-[#e8eff7] bg-gradient-to-b from-white to-[#f8fbff] py-16 sm:py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,#c5e1f5_0%,transparent_30%),radial-gradient(circle_at_90%_85%,#daecd4_0%,transparent_28%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-2 flex flex-col justify-center">
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                {data.title}
              </h2>
              <div className="mb-5 h-1 w-16 rounded-full bg-[#f58238]" />
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
                {data.description}
              </p>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-[#e4edf8] bg-white p-5 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.45)] sm:p-7 md:p-8">
                <PublicInquiryForm
                  locale={locale}
                  type="PARTNERSHIP"
                  labels={{
                    ...data.fields,
                    submitting: locale === "ar" ? "جاري الإرسال..." : "Submitting...",
                    privacyNote:
                      locale === "ar"
                        ? "نحترم خصوصية بياناتك وسنستخدمها فقط للرد على استفسارك."
                        : "We respect your privacy and only use your details to respond to your inquiry.",
                    genericError:
                      locale === "ar"
                        ? "حدث خطأ ما. يرجى المحاولة مرة أخرى."
                        : "Something went wrong. Please try again.",
                    successTitle: locale === "ar" ? "تم الإرسال بنجاح" : "Success",
                    errorTitle: locale === "ar" ? "فشل الإرسال" : "Error",
                  }}
                  inquiryTypeOptions={data.fields.inquiryTypeOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}