import {
  CardGrid,
  ServiceCard,
  type CardGridData,
  type ServiceCardData,
} from "@/components/public/sections/base";

interface KeyStrengthsSectionData extends CardGridData {
  items: ServiceCardData[];
}

interface KeyStrengthsSectionProps {
  data: KeyStrengthsSectionData;
}

export function KeyStrengthsSection({ data }: KeyStrengthsSectionProps) {
  return (
    <CardGrid
      data={{
        title: data.title,
        description: data.description,
        columns: data.columns || 3,
      }}
    >
      {data.items.map((item) => (
        <ServiceCard key={item.id} data={item} />
      ))}
    </CardGrid>
  );
}
