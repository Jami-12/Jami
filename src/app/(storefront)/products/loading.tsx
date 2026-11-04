import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Loading products">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-5 h-4 w-24" />
      <Skeleton className="mt-3 h-10 w-80 max-w-full" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Skeleton className="hidden h-96 rounded-2xl lg:block" />
        <div>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6].map((item) => (
              <ProductCardSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
