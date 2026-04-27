import { type ContentSectionData } from "@/components/public/sections/base";
import { ContentSection } from "@/components/public/sections/v2/ContentSection-v2";

interface CompanyOverviewSectionProps {
  data: ContentSectionData;
}

export function CompanyOverviewSection({ data }: CompanyOverviewSectionProps) {
  return <ContentSection data={data} />;
}
