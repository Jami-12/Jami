import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Loading product">
      <Skeleton className="h-4 w-64 rounded-none" />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-none border border-border" />
        <div className="min-w-0 space-y-4">
          <Skeleton className="h-4 w-28 rounded-none" />
          <Skeleton className="h-10 w-4/5 rounded-none" />
          <Skeleton className="h-6 w-44 rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-16 w-full rounded-none border border-border" />
          <Skeleton className="h-40 w-full rounded-none border border-border" />
        </div>
      </div>
    </div>
  );
}
