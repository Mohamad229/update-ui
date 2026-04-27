import {
  CardGrid,
  ProductCard,
  type CardGridData,
  type ProductCardData,
} from "@/components/public/sections/base";

interface PortfolioPreviewSectionData extends CardGridData {
  items: ProductCardData[];
}

interface PortfolioPreviewSectionProps {
  data: PortfolioPreviewSectionData;
}

export function PortfolioPreviewSection({
  data,
}: PortfolioPreviewSectionProps) {
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
