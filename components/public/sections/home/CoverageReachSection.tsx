import {
  StatsSection,
  type StatsSectionData,
} from "@/components/public/sections/base";

interface CoverageReachSectionProps {
  data: StatsSectionData;
}

export function CoverageReachSection({ data }: CoverageReachSectionProps) {
  return <StatsSection data={data} className="py-4" />;
}
