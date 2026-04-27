import { StatsSectionV2 } from "./stats-section-v2";
import type { StatsSectionData } from "@/components/public/sections/base";

interface AtAGlanceSectionV2Props {
  data: StatsSectionData;
}

export function AtAGlanceSectionV2({ data }: AtAGlanceSectionV2Props) {
  return (
    <div className="relative bg-gradient-to-b from-[#f8fbff] to-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#91caee] to-transparent" />
      <StatsSectionV2 data={data} className="bg-transparent py-16 md:py-20 lg:py-24" />
    </div>
  );
}