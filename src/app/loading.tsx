import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="container-page py-20" aria-busy="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-12 w-full max-w-xl" />
      <Skeleton className="mt-3 h-5 w-full max-w-md" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
