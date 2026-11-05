import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container-page py-10">
      <Skeleton className="h-4 w-64" />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
