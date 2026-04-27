import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductsTableClient } from "./products-table-client";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Products"
        description="View and manage all pharmaceutical products in the catalog"
        actions={
          <Link href="/admin/products/new">
            <Button size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Suspense
            fallback={
              <div className="p-6 text-center text-muted-foreground">
                Loading products...
              </div>
            }
          >
            <ProductsTableClient />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
