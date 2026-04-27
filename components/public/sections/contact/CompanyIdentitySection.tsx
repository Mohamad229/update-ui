import {
  ContentSection,
  type ContentSectionData,
} from "@/components/public/sections/base";

interface CompanyIdentitySectionProps {
  data: ContentSectionData;
}

export function CompanyIdentitySection({ data }: CompanyIdentitySectionProps) {
  return <ContentSection data={data} />;
}
