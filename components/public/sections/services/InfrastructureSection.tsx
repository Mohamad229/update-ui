import { type ContentSectionData } from "@/components/public/sections/base/types";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";

interface InfrastructureSectionProps {
  data: ContentSectionData;
}

export function InfrastructureSection({ data }: InfrastructureSectionProps) {
  return <ContentSectionV2 data={data} />;
}
