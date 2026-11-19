import Link from "next/link";
import { Compass, PackageSearch } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[70dvh] items-center justify-center px-4 py-16 sm:px-6"
    >
      <Card className="w-full max-w-lg overflow-hidden">
        <CardHeader className="items-start gap-4 border-b border-border pb-6">
          <Brand href="/" />
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <PackageSearch className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <Badge tone="accent" className="w-fit">
              404 · Piece not found
            </Badge>
            <CardTitle className="font-display text-2xl sm:text-3xl">
              This one drifted out of orbit.
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              The page or product you&apos;re looking for may have moved, sold
              out, or never existed. The rest of the collection is still here.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-start gap-3 pt-6 text-sm text-muted-foreground">
          <Compass className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Try the collection, or head back to the storefront home.</p>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-wrap gap-3 pt-5">
          <Button asChild size="sm">
            <Link href="/products">Shop the collection</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Return home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
