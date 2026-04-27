import { type ContentSectionData } from "@/components/public/sections/base/types";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";

interface LogisticsDistributionSectionProps {
  data: ContentSectionData;
}

export function LogisticsDistributionSection({ data }: LogisticsDistributionSectionProps) {
  return <ContentSectionV2 data={data} />;
}
