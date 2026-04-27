import { type ContentSectionData } from "@/components/public/sections/base/types";
import { ContentSection as ContentSectionV2 } from "@/components/public/sections/v2/ContentSection-v2";

interface MarketAccessSectionProps {
  data: ContentSectionData;
}

export function MarketAccessSection({ data }: MarketAccessSectionProps) {
  return <ContentSectionV2 data={data} />;
}
