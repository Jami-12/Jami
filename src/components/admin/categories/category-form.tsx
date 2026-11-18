import { TaxonomyForm } from "@/components/admin/taxonomy/taxonomy-form";

export function CategoryForm({ categoryId }: { categoryId?: string }) {
  return <TaxonomyForm mode="categories" itemId={categoryId} />;
}
