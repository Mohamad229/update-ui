import { type ContentSectionData } from "@/components/public/sections/base/types";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";

interface SafetyVigilanceSectionProps {
  data: ContentSectionData;
}

export function SafetyVigilanceSection({ data }: SafetyVigilanceSectionProps) {
  return <ContentSectionV2 data={data} />;
}
