import { type ContentSectionData } from "@/components/public/sections/base/types";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";

interface RegulatoryServicesSectionProps {
  data: ContentSectionData;
}

export function RegulatoryServicesSection({ data }: RegulatoryServicesSectionProps) {
  return <ContentSectionV2 data={data} />;
}
