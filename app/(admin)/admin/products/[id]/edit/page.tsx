import { PageHeader } from "@/components/admin/page-header";
import { ProductFormClient } from "../../product-form-client";

/**
 * Edit Product Page
 *
 * Server component that renders the edit form.
 * Product data is fetched by the client component.
 * Uses async params per Next.js 16+ requirements.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Edit Product ${id} | Damira Admin`,
    description: "Edit pharmaceutical product details",
  };
}

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Product"
        description="Update pharmaceutical product details"
      />

      <ProductFormClient productId={id} />
    </div>
  );
}
