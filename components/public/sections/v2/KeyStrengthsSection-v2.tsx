import { type CardGridData, type ServiceCardData } from "@/components/public/sections/base/types";
import { CardGridV2 } from "./CardGrid-v2";
import { ServiceCardV2 } from "./ServiceCard-v2";

interface KeyStrengthsSectionData extends CardGridData {
  items: ServiceCardData[];
}

interface KeyStrengthsSectionProps {
  data: KeyStrengthsSectionData;
}

export function KeyStrengthsSectionV2({ data }: KeyStrengthsSectionProps) {
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