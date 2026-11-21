import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Loading content">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5 pt-8">
          <Skeleton className="h-4 w-32 rounded-none" />
          <Skeleton className="h-14 w-full max-w-lg rounded-none" />
          <Skeleton className="h-14 w-3/4 rounded-none" />
          <Skeleton className="h-5 w-full max-w-md rounded-none" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-40 rounded-none border border-border" />
            <Skeleton className="h-12 w-32 rounded-none border border-border" />
          </div>
        </div>
        <Skeleton className="aspect-square w-full rounded-none border border-border" />
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32 rounded-none border border-border" />
        ))}
      </div>
    </div>
  );
}
