import { TaxonomyForm } from "@/components/admin/taxonomy/taxonomy-form";

export function BrandForm({ brandId }: { brandId?: string }) {
  return <TaxonomyForm mode="brands" itemId={brandId} />;
}
