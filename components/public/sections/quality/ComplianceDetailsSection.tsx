import type { ContentSectionData } from "@/components/public/sections/base";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";

interface ComplianceDetailsSectionProps {
  data: ContentSectionData;
}

export function ComplianceDetailsSection({
  data,
}: ComplianceDetailsSectionProps) {
  return <ContentSectionV2 data={data} />;
}
