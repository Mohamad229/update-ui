import { CheckCircle2, ArrowUpRight } from "lucide-react";
import type { ServiceCardData } from "@/components/public/sections/base/types";

interface ServiceCardProps {
  data: ServiceCardData;
}

export function ServiceCardV2({ data }: ServiceCardProps) {
  const Icon = data.icon;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-[#e8f0f8] bg-white p-6 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#91caee] hover:bg-[#f8fbff] sm:p-7 lg:p-8">
      <div className="mb-10 flex items-start justify-between">
        <div className="inline-flex rounded-xl bg-[#c5e1f5]/45 p-2.5 text-[#0097dc] transition-colors duration-300 group-hover:bg-[#0097dc] group-hover:text-white">
          {Icon ? <Icon className="h-6 w-6 stroke-[1.75]" /> : <CheckCircle2 className="h-6 w-6 stroke-[1.75]" />}
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-[#f58238]" />
      </div>

      <div className="mt-auto">
        <h3 className="mb-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {data.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base line-clamp-3">
          {data.description}
        </p>

        {data.features?.length ? (
          <ul className="mt-6 space-y-2.5 border-t border-[#eaf1f8] pt-6">
            {data.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4cb748]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}