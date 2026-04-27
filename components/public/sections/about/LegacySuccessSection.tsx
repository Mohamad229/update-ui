import {
  type ContentSectionData,
  type StatsSectionData,
} from "@/components/public/sections/base";
import { ContentSection } from "@/components/public/sections/v2/ContentSection-v2";
import { StatsSectionV2 } from "@/components/public/sections/v2/stats-section-v2";

interface LegacySuccessSectionProps {
  data: {
    content: ContentSectionData;
    stats: StatsSectionData;
  };
}

export function LegacySuccessSection({ data }: LegacySuccessSectionProps) {
  return (
    <>
      <ContentSection data={data.content} />
      <StatsSectionV2 data={data.stats} className="pt-0" />
    </>
  );
}
