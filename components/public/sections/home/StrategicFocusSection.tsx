import {
  CardGrid,
  ServiceCard,
  type CardGridData,
  type ServiceCardData,
} from "@/components/public/sections/base";

interface StrategicFocusSectionData extends CardGridData {
  items: ServiceCardData[];
}

interface StrategicFocusSectionProps {
  data: StrategicFocusSectionData;
}

export function StrategicFocusSection({ data }: StrategicFocusSectionProps) {
  return (
    <CardGrid
      data={{
        title: data.title,
        description: data.description,
        columns: data.columns || 4,
      }}
    >
      {data.items.map((item) => (
        <ServiceCard key={item.id} data={item} />
      ))}
    </CardGrid>
  );
}
