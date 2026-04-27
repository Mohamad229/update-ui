import { Mail, MapPin, PhoneCall } from "lucide-react";
import { SectionReveal } from "@/components/public/sections/base";

interface ContactInfoItem {
  label: string;
  value: string;
  href?: string;
}

interface ContactInfoSectionProps {
  data: {
    title: string;
    description?: string;
    items: ContactInfoItem[];
  };
}

const ICONS = [MapPin, PhoneCall, Mail] as const;

export function ContactInfoSectionV2({ data }: ContactInfoSectionProps) {
  return (
    <SectionReveal>
      <section className="bg-white py-20 md:py-28 font-sans">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl text-center mx-auto">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {data.title}
            </h2>
            {data.description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item, idx) => {
              const Icon = ICONS[idx % ICONS.length];
              
              const Wrapper = item.href ? "a" : "div";
              const wrapperProps = item.href ? { href: item.href, className: "group relative flex flex-col items-center text-center rounded-2xl bg-gray-50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-gray-100" } : { className: "group relative flex flex-col items-center text-center rounded-2xl bg-gray-50 p-8 shadow-sm border border-gray-100" };

              return (
                <Wrapper key={idx} {...wrapperProps as any}>
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#0097dc]/10 text-[#0097dc] transition-colors group-hover:bg-[#0097dc] group-hover:text-white">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    {item.label}
                  </h3>
                  <div className="text-lg font-medium text-gray-900 break-words group-hover:text-[#0097dc] transition-colors">
                    {item.value}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
