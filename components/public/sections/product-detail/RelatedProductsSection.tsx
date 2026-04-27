import {
  CardGrid,
  type CardGridData,
  type ProductCardData,
} from "@/components/public/sections/base";
import { ProductCard } from "@/components/public/sections/v2/ProductCard-v2";

interface RelatedProductsSectionData extends CardGridData {
  items: ProductCardData[];
}

interface RelatedProductsSectionProps {
  data: RelatedProductsSectionData;
}

export function RelatedProductsSection({ data }: RelatedProductsSectionProps) {
  return (
    <CardGrid
      data={{
        title: data.title,
        description: data.description,
        columns: data.columns || 3,
      }}
    >
      {data.items.map((item) => (
        <ProductCard key={item.id} data={item} />
      ))}
    </CardGrid>
  );
}
