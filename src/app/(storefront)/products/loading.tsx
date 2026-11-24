import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Loading products">
      <Skeleton className="h-3 w-32 rounded-none" />
      <Skeleton className="mt-5 h-4 w-24 rounded-none" />
      <Skeleton className="mt-3 h-10 w-80 max-w-full rounded-none" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl rounded-none" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Skeleton className="hidden h-96 rounded-none border border-border lg:block" />
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-9 w-24 rounded-none border border-border" />
            <Skeleton className="h-9 w-32 rounded-none border border-border" />
          </div>
          <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6].map((item) => (
              <ProductCardSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
