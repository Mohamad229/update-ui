import {
  type ContentSectionData,
} from "@/components/public/sections/base";
import { ContentSection } from "@/components/public/sections/v2/ContentSection-v2";

interface ProductInfoSectionProps {
  data: ContentSectionData;
}

export function ProductInfoSection({ data }: ProductInfoSectionProps) {
  return <ContentSection data={data} />;
}
