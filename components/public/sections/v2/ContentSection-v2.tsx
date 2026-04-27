import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ContentSectionData } from "@/components/public/sections/base/types";

interface ContentSectionProps {
  data: ContentSectionData;
  className?: string;
  delay?: number;
}

export function ContentSection({
  data,
  className,
  delay = 0,
}: ContentSectionProps) {
  const imageItems = data.images?.length ? data.images : data.image ? [data.image] : [];
  const isRight = data.imagePosition === "right";

  return (
    <section
      className={cn(
        "overflow-hidden border-y border-[#e9f0f8] bg-white py-16 sm:py-20 md:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div
            className={cn(
              "animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-700",
              isRight ? "order-1" : "order-1 lg:order-2"
            )}
            style={{ animationDelay: `${delay}ms` }}
          >
            {data.eyebrow && (
              <span className="mb-3 inline-flex rounded-full bg-[#c5e1f5]/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0097dc]">
                {data.eyebrow}
              </span>
            )}

            <h2 className="mb-5 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              {data.title}
            </h2>

            {data.subtitle && (
              <p className="mb-7 border-s-4 border-[#f58238] ps-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {data.subtitle}
              </p>
            )}

            {data.body && data.body.length > 0 && (
              <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                {data.body.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}

            {data.bullets && data.bullets.length > 0 && (
              <ul className="mt-7 space-y-2.5 border-t border-[#eaf1f8] pt-6 text-sm text-slate-700 sm:text-base">
                {data.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4cb748]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {data.actions && data.actions.length > 0 && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {data.actions.map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      action.variant === "primary"
                        ? "bg-[#0097dc] text-white hover:bg-[#00a5e1] focus-visible:ring-[#0097dc]"
                        : "border border-[#91caee] bg-white text-[#0097dc] hover:bg-[#c5e1f5]/35 focus-visible:ring-[#0097dc]"
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-[#e8eef7] bg-[#f6faff] shadow-[0_22px_50px_-36px_rgba(15,23,42,0.5)] aspect-[4/3] lg:h-[500px] lg:aspect-auto",
              isRight ? "order-2" : "order-2 lg:order-1"
            )}
          >
            {imageItems.length > 0 && (
              <Image
                src={imageItems[0].src}
                alt={imageItems[0].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}