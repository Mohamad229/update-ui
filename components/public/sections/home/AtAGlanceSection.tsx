import {
  StatsSection,
  type StatsSectionData,
} from "@/components/public/sections/base";

interface AtAGlanceSectionProps {
  data: StatsSectionData;
}

export function AtAGlanceSection({ data }: AtAGlanceSectionProps) {
  return <StatsSection data={data} />;
}
