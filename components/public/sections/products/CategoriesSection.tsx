import type { CardGridData, ServiceCardData } from "@/components/public/sections/base/types";

import { CardGridV2 } from "@/components/public/sections/v2/CardGrid-v2";
import { ServiceCardV2 } from "@/components/public/sections/v2/ServiceCard-v2";

interface CategoriesSectionData extends CardGridData {
  items: ServiceCardData[];
}

interface CategoriesSectionProps {
  data: CategoriesSectionData;
}

export function CategoriesSection({ data }: CategoriesSectionProps) {
  return (
    <CardGridV2
      data={{
        title: data.title,
        description: data.description,
        columns: data.columns || 3,
      }}
    >
      {data.items.map((item) => (
        <ServiceCardV2 key={item.id} data={item} />
      ))}
    </CardGridV2>
  );
}
