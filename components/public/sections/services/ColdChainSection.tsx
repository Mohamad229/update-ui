import { type ContentSectionData } from "@/components/public/sections/base/types";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";

interface ColdChainSectionProps {
  data: ContentSectionData;
}

export function ColdChainSection({ data }: ColdChainSectionProps) {
  return <ContentSectionV2 data={data} />;
}
