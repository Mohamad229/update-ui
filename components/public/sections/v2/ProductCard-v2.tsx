import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/components/public/sections/base/types";

interface ProductCardProps {
  data: ProductCardData;
  className?: string;
}

export function ProductCard({ data, className }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8eef7] bg-white p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#91caee] sm:p-6",
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0097dc]">
          {data.category}
        </span>
        {data.badge && (
          <span className="rounded-full border border-[#f9b07d] bg-[#fee2cd] px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#f58238]">
            {data.badge}
          </span>
        )}
      </div>

      {data.image && (
        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#f3f8fd]">
          <div className="absolute inset-0 z-10 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
          <Image
            src={data.image.src}
            alt={data.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="space-y-2.5">
          <h3 className="text-xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
            {data.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            {data.description}
          </p>
        </div>

        {(data.indication || data.storage) && (
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#eaf1f8] pt-4">
            {data.indication && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Indication
                </span>
                <span className="text-xs font-medium text-slate-800">{data.indication}</span>
              </div>
            )}
            {data.storage && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Storage
                </span>
                <span className="text-xs font-medium text-slate-800">{data.storage}</span>
              </div>
            )}
          </div>
        )}

        {data.href && (
          <Link
            href={data.href}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0097dc] transition-colors hover:text-[#00a5e1]"
          >
            Explore Details
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </article>
  );
}