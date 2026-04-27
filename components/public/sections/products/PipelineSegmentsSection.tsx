import type { CardGridData, ServiceCardData } from "@/components/public/sections/base/types";

import { CardGridV2 } from "@/components/public/sections/v2/CardGrid-v2";
import { ServiceCardV2 } from "@/components/public/sections/v2/ServiceCard-v2";

interface PipelineSegmentsSectionData extends CardGridData {
  items: ServiceCardData[];
}

interface PipelineSegmentsSectionProps {
  data: PipelineSegmentsSectionData;
}

export function PipelineSegmentsSection({ data }: PipelineSegmentsSectionProps) {
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
