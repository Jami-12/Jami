import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="container-page py-16 sm:py-20" aria-busy="true" aria-label="Loading">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-10 w-full max-w-xl rounded-xl sm:h-12" />
        <Skeleton className="h-4 w-full max-w-md rounded-full" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="overflow-hidden">
            <CardContent className="space-y-4 p-4">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
