import {
  CardGrid,
  ServiceCard,
  type CardGridData,
  type ServiceCardData,
} from "@/components/public/sections/base";

interface WhyPartnerSectionData extends CardGridData {
  items: ServiceCardData[];
}

interface WhyPartnerSectionProps {
  data: WhyPartnerSectionData;
}

export function WhyPartnerSection({ data }: WhyPartnerSectionProps) {
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
