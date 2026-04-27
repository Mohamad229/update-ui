import type { CardGridData, ServiceCardData } from "@/components/public/sections/base";
import { CardGridV2 } from "@/components/public/sections/v2/CardGrid-v2";
import { ServiceCardV2 } from "@/components/public/sections/v2/ServiceCard-v2";

interface CertificationsSectionData extends CardGridData {
  items: ServiceCardData[];
}

interface CertificationsSectionProps {
  data: CertificationsSectionData;
}

export function CertificationsSection({ data }: CertificationsSectionProps) {
  return (
    <CardGridV2
      data={{
        title: data.title,
        description: data.description,
        columns: data.columns || 4,
      }}
    >
      {data.items.map((item) => (
        <ServiceCardV2 key={item.id} data={item} />
      ))}
    </CardGridV2>
  );
}
