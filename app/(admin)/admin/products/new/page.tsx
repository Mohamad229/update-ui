import { PageHeader } from "@/components/admin/page-header";
import { ProductFormClient } from "../product-form-client";

/**
 * Create New Product Page
 *
 * Server component that renders the product creation form.
 * Passes null initialData to indicate create mode.
 */
export const metadata = {
  title: "Add New Product | Damira Admin",
  description: "Create a new pharmaceutical product",
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Product"
        description="Create a new pharmaceutical product with all required details"
      />

      <ProductFormClient initialData={null} />
    </div>
  );
}
