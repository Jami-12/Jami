import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[70dvh] items-center justify-center px-6 py-20"
    >
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary-500 dark:text-accent-300">
          404 · Object not found
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          This one drifted out of orbit.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          The page or product you&apos;re looking for may have moved, sold out,
          or never existed. The rest of the collection is still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/products">Shop the collection</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
