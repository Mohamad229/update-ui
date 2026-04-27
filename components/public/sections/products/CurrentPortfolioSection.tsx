import type { CardGridData, ProductCardData } from "@/components/public/sections/base/types";
import { CardGridV2 } from "@/components/public/sections/v2/CardGrid-v2";
import { ProductCard as ProductCardV2 } from "@/components/public/sections/v2/ProductCard-v2";

interface CurrentPortfolioSectionData extends CardGridData {
  items: ProductCardData[];
}

interface CurrentPortfolioSectionProps {
  data: CurrentPortfolioSectionData;
}

export function CurrentPortfolioSection({ data }: CurrentPortfolioSectionProps) {
  return (
    <CardGridV2
      data={{
        title: data.title,
        description: data.description,
        columns: data.columns || 3,
      }}
    >
      {data.items.map((item) => (
        <ProductCardV2 key={item.id} data={item} />
      ))}
    </CardGridV2>
  );
}
