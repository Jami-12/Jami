import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Loading content">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5 pt-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-full max-w-lg" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-5 w-full max-w-md" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
        <Skeleton className="aspect-square w-full rounded-3xl" />
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
