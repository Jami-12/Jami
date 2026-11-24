"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MoveHorizontal,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { RatingStars } from "@/components/ui/rating-stars";
import { SmartImage } from "@/components/ui/smart-image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { productSizes } from "@/lib/product-options";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";
import {
  discountPercentOf,
  hasDiscount,
  productImage,
  productImages,
  productName,
} from "@/types";

type GarmentShape = "shirt" | "hoodie" | "jacket" | "trouser" | "dress" | "card";

const SHAPES: GarmentShape[] = ["shirt", "hoodie", "jacket", "trouser", "dress"];

const GARMENT_PATHS: Record<Exclude<GarmentShape, "card">, string> = {
  shirt:
 "M .28 .07 L .38 .02 L .50 .09 L .62 .02 L .72 .07 L .94 .23 L .86 .40 L .78 .35 L .80 .97 L .20 .97 L .22 .35 L .14 .40 L .06 .23 Z",
  hoodie:
 "M .32 .04 C .36 0 .64 0 .68 .04 L .74 .09 L .95 .25 L .87 .42 L .79 .36 L .81 .97 L .19 .97 L .21 .36 L .13 .42 L .05 .25 L .26 .09 Z",
  jacket:
 "M .30 .05 L .40 .01 L .50 .07 L .60 .01 L .70 .05 L .94 .22 L .86 .40 L .78 .34 L .80 .97 L .20 .97 L .22 .34 L .14 .40 L .06 .22 Z",
  trouser:
 "M .29 .04 L .71 .04 L .73 .97 L .55 .97 L .50 .44 L .45 .97 L .27 .97 Z",
  dress:
 "M .34 .04 L .44 .01 L .50 .07 L .56 .01 L .66 .04 L .74 .30 L .84 .97 L .16 .97 L .26 .30 Z",
};

const DEMO_IMAGES: Record<Exclude<GarmentShape, "card">, string> = {
  shirt:
 "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  hoodie:
 "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
  jacket:
 "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
  trouser:
 "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
  dress:
 "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
};

function isUsableImage(src: string | null | undefined): src is string {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  if (/google\.[^/]+\/imgres/i.test(src) || src.includes("imgurl=")) return false;

  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return !/\.(html?|php)(\?|$)/i.test(url.pathname);
  } catch {
    return false;
  }
}

function garmentShapeFor(product: Product): GarmentShape {
  const text = `${productName(product)} ${product.category?.name ?? ""}`.toLowerCase();

  if (/trouser|pant|jean|short|skirt/.test(text)) return "trouser";
  if (/dress|gown/.test(text)) return "dress";
  if (/hoodie|sweatshirt|pullover/.test(text)) return "hoodie";
  if (/jacket|coat|blazer|outerwear/.test(text)) return "jacket";
  if (/shirt|tee|top|fashion|clothing|apparel/.test(text)) return "shirt";

  return "card";
}

function displayImageFor(product: Product, shape: GarmentShape): string | null {
  const primary = productImage(product);

  if (shape === "card") {
    if (isUsableImage(primary)) return primary;
    return productImages(product).find(isUsableImage) ?? null;
  }

  if (isUsableImage(primary)) return primary;
  return DEMO_IMAGES[shape];
}

function clipStyle(shape: GarmentShape): React.CSSProperties | undefined {
  return shape === "card" ? undefined : { clipPath: `url(#wardrobe-clip-${shape})` };
}

function Hanger({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 76" fill="none" aria-hidden="true" className={className}>
      <path
        d="M90 33V22.5C90 15.6 95.6 10 102.5 10S115 15.6 115 22.5 109.4 35 102.5 35c-3.6 0-6.8-1.5-9.1-4"
        className="stroke-muted-foreground"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M90 32 18 61h144L90 32Z" className="fill-border stroke-foreground" strokeWidth="2" />
      <path d="M90 32 44 55h92L90 32Z" className="fill-background" />
    </svg>
  );
}

function GarmentVisual({
  product,
  shape,
  image,
  priority = false,
  className,
}: {
  product: Product;
  shape: GarmentShape;
  image: string | null;
  priority?: boolean;
  className?: string;
}) {
  const frame = (
    <div
      className={cn(
 "relative h-full w-full overflow-hidden",
        shape === "card" && "rounded-none border border-border bg-card",
        className,
      )}
      style={clipStyle(shape)}
    >
      <SmartImage
        src={image}
        alt={productName(product)}
        fill
        priority={priority}
        sizes="(max-width: 640px) 76vw, 340px"
        className="object-cover"
      />

    </div>
  );

  return (
    <div className="relative h-full w-full drop-shadow-none">
      {frame}
    </div>
  );
}

export function WardrobeRail({ products }: { products: Product[] }) {
  const reducedMotion = Boolean(useReducedMotion());
  const finePointer = useMediaQuery("(pointer: fine)");

  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const suppressClick = React.useRef(false);

  const x = useMotionValue(0);
  const [minX, setMinX] = React.useState(0);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(true);
  const middleIndex = Math.floor(products.length / 2);
  const [activeIndex, setActiveIndex] = React.useState(middleIndex);
  const [selected, setSelected] = React.useState<Product | null>(null);

  const productKey = products.map((product) => product.id).join("|");
  const progress = useTransform(x, [Math.min(minX, -1), 0], [1, 0]);

  // Cached geometry keeps the highlighted garment in sync without measuring
  // the DOM on every animation frame.
  const centersRef = React.useRef<number[]>([]);
  const viewportCenterRef = React.useRef(0);

  const syncActive = React.useCallback((value: number) => {
    const centers = centersRef.current;
    if (centers.length === 0) return;

    const target = viewportCenterRef.current - value;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    centers.forEach((center, index) => {
      const distance = Math.abs(center - target);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex((current) => (current === closest ? current : closest));
  }, []);

  const measure = React.useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const offset = x.get();
    const viewportRect = viewport.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const trackOrigin = trackRect.left - offset;

    centersRef.current = itemRefs.current.map((node) => {
      if (!node) return Number.POSITIVE_INFINITY;
      const rect = node.getBoundingClientRect();
      return rect.left - trackOrigin + rect.width / 2;
    });
    viewportCenterRef.current = viewportRect.left + viewportRect.width / 2 - trackOrigin;

    const nextMin = Math.min(0, viewport.clientWidth - track.scrollWidth);
    setMinX(nextMin);
    setAtStart(offset >= -1);
    setAtEnd(offset <= nextMin + 1);
    if (offset < nextMin) x.set(nextMin);

    syncActive(offset);
  }, [syncActive, x]);

  React.useEffect(() => {
    measure();

    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (trackRef.current) observer.observe(trackRef.current);

    return () => observer.disconnect();
  }, [measure]);

  React.useEffect(() => {
    x.set(0);
    setActiveIndex(Math.floor(products.length / 2));
    setSelected(null);
    measure();
  }, [productKey, products.length, x, measure]);

  React.useEffect(() => {
    setAtStart(x.get() >= -1);
    setAtEnd(x.get() <= minX + 1);
  }, [minX, x]);

  const step = () => (itemRefs.current[0]?.offsetWidth ?? 330) + 32;

  const scrollBy = (direction: 1 | -1) => {
    const target = Math.max(minX, Math.min(0, x.get() - direction * step()));
    animate(x, target, {
      type: "spring",
      stiffness: 260,
      damping: 34,
      mass: 0.8,
    });
  };

  // Track the rail continuously so the emphasised garment follows both a drag
  // and its inertia. `syncActive` only updates state when the nearest changes.
  React.useEffect(() => {
    const unsubscribe = x.on("change", (value) => {
      syncActive(value);
      setAtStart(value >= -1);
      setAtEnd(value <= minX + 1);
    });

    return () => unsubscribe();
  }, [x, minX, syncActive]);

  const openPreview = (product: Product) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setSelected(product);
  };

  return (
    <section
      className="relative mt-4 overflow-hidden rounded-none border border-border bg-card text-card-foreground"
      aria-roledescription="carousel"
      aria-label="Interactive clothing rail"
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          {SHAPES.filter((shape): shape is Exclude<GarmentShape, "card"> => shape !== "card").map(
            (shape) => (
              <clipPath
                key={shape}
                id={`wardrobe-clip-${shape}`}
                clipPathUnits="objectBoundingBox"
              >
                <path d={GARMENT_PATHS[shape]} />
              </clipPath>
            ),
          )}
        </defs>
      </svg>

      <div className="relative flex flex-col gap-4 px-5 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              The rail edit
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight not-italic sm:text-2xl">
              Hanging pieces, ready to explore.
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag the rail, hover a garment, then open a piece for the full preview.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-none border border-border bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:inline-flex">
              <MoveHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Drag to browse
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              aria-label="Scroll the rail left"
              className="border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label="Scroll the rail right"
              className="border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="relative -mx-2 h-[510px] overflow-hidden px-2 sm:h-[570px]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[3.2rem] z-10 h-px rounded-none bg-foreground"
          >
            <span className="absolute -left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-none border border-foreground bg-background" />
            <span className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-none border border-foreground bg-background" />
          </div>

          <motion.div
            ref={trackRef}
            drag={minX < 0 ? "x" : false}
            dragConstraints={{ left: minX, right: 0 }}
            dragElastic={0.08}
            dragMomentum={!reducedMotion}
            dragTransition={{ bounceStiffness: 240, bounceDamping: 30 }}
            onDragStart={() => {
              suppressClick.current = false;
            }}
            onDrag={() => {
              suppressClick.current = true;
            }}
            onDragEnd={() => {
              window.setTimeout(() => {
                suppressClick.current = false;
              }, 140);
            }}
            style={{ x, touchAction: "pan-y" }}
            className="flex h-full items-start gap-8 pt-9"
          >
            {products.map((product, index) => {
              const shape = garmentShapeFor(product);
              const image = displayImageFor(product, shape);
              const delta = index - activeIndex;
              const rotateY = Math.max(-17, Math.min(17, delta * 7));
              const scale = delta === 0 ? 1.045 : Math.max(0.86, 1 - Math.abs(delta) * 0.045);
              const opacity = Math.abs(delta) > 2 ? 0.72 : 1;
              const discounted = hasDiscount(product);
              const percent = discountPercentOf(product);

              return (
                <div
                  key={product.id}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className="relative w-[78vw] max-w-[330px] shrink-0 sm:w-[320px] lg:w-[42%] lg:max-w-[380px]"
                  style={{
                    zIndex: 20 - Math.abs(delta),
                    opacity,
                    transform: `perspective(1300px) rotateY(${rotateY}deg) scale(${scale})`,
                    transformOrigin: "center 18%",
                    transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease",
                  }}
                >
                  <WardrobeItem
                    product={product}
                    shape={shape}
                    image={image}
                    priority={index < 3}
                    active={delta === 0}
                    finePointer={finePointer}
                    reducedMotion={reducedMotion}
                    onActivate={() => setActiveIndex(index)}
                    onOpen={() => openPreview(product)}
                  />

                  {discounted && percent > 0 ? (
                    <span className="absolute right-1 top-[4.1rem] z-30 rounded-none border border-foreground bg-foreground px-2.5 py-1 text-[10px] font-bold text-background">
                      −{percent}%
                    </span>
                  ) : null}
                </div>
              );
            })}
          </motion.div>


        </div>

        <div className="flex items-center gap-3">
          <div className="h-[2px] flex-1 overflow-hidden rounded-none bg-border">
            <motion.span
              className="block h-full origin-left rounded-none bg-foreground"
              style={{ scaleX: progress }}
            />
          </div>
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {products.length} piece{products.length === 1 ? "" : "s"} on the rail
          </p>
        </div>
      </div>

      <WardrobePreview
        product={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

function WardrobeItem({
  product,
  shape,
  image,
  priority,
  active,
  finePointer,
  reducedMotion,
  onActivate,
  onOpen,
}: {
  product: Product;
  shape: GarmentShape;
  image: string | null;
  priority: boolean;
  active: boolean;
  finePointer: boolean;
  reducedMotion: boolean;
  onActivate: () => void;
  onOpen: () => void;
}) {
  const rotateX = useSpring(useMotionValue(0), { stiffness: 170, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 170, damping: 18 });
  const spotlightX = useSpring(useMotionValue(50), { stiffness: 160, damping: 22 });
  const spotlightY = useSpring(useMotionValue(50), { stiffness: 160, damping: 22 });
  const markerLeft = useMotionTemplate`${spotlightX}%`;
  const markerTop = useMotionTemplate`${spotlightY}%`;

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!finePointer || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 16);
    rotateX.set((0.5 - py) * 10);
    spotlightX.set(px * 100);
    spotlightY.set(py * 100);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    spotlightX.set(50);
    spotlightY.set(50);
  };

  const discounted = hasDiscount(product);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={onActivate}
      onFocus={onActivate}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      aria-label={`Preview ${productName(product)}`}
      className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      <motion.div
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformOrigin: "center 8%",
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        <Hanger className="pointer-events-none absolute left-1/2 top-0 z-20 h-[76px] w-[180px] -translate-x-1/2 drop-shadow-none" />

        <div className="relative mx-auto h-[340px] w-[88%] pt-[62px] sm:h-[390px]">
          <GarmentVisual
            product={product}
            shape={shape}
            image={image}
            priority={priority}
          />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-none border border-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ left: markerLeft, top: markerTop }}
          />
        </div>

        <div className="relative z-20 -mt-5 px-3">
          <div className="rounded-none border border-border bg-card px-3 py-2.5 transition-colors duration-300 group-hover:border-foreground">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {product.category?.name ?? "The collection"}
              </span>
              {outOfStock ? (
                <span className="shrink-0 border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-foreground">
                  Sold out
                </span>
              ) : active ? (
                <span className="shrink-0 border border-foreground bg-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-background">
                  Selected
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm font-bold tracking-tight">
              {productName(product)}
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <Price
                amount={product.finalPrice}
                compareAt={discounted ? product.originalPrice : null}
                size="sm"
                inline
                className="text-foreground"
              />
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground transition group-hover:text-foreground">
                Preview
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </button>
  );
}

function WardrobePreview({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  if (!product) return null;

  return (
    <Dialog
      open={Boolean(product)}
      onClose={onClose}
      title="The fitting room"
      description="Inspect the piece, choose a quantity and add it to your bag."
      size="xl"
    >
      <WardrobePreviewBody key={product.id} product={product} />
    </Dialog>
  );
}

function WardrobePreviewBody({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(1);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistIds = useWishlistStore((state) => state.ids);

  const shape = garmentShapeFor(product);
  const images = productImages(product).filter(isUsableImage);
  const [activeImage, setActiveImage] = React.useState(0);
  const fallbackImage = displayImageFor(product, shape);
  const image = images[activeImage] ?? fallbackImage;
  const discounted = hasDiscount(product);
  const percent = discountPercentOf(product);
  const saved = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
  const maxQuantity = Math.max(1, Math.min(product.stock, 10));
  const sizes = React.useMemo(() => productSizes(product), [product]);
  const needsSize = sizes.length > 0 && !selectedSize;

  React.useEffect(() => setSelectedSize(null), [product.id]);

  const handleAdd = async () => {
    if (outOfStock || needsSize) return;
    setAdding(true);
    try {
      const added = await addItem(product, quantity, { size: selectedSize });
      if (added) router.push("/cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[1.02fr_1fr] sm:gap-7">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-none border border-border bg-muted p-5">

          <Hanger className="absolute left-1/2 top-2 z-20 h-[76px] w-[180px] -translate-x-1/2" />
          <div className="relative mx-auto h-full w-[84%] pt-[58px]">
            <GarmentVisual
              product={product}
              shape={shape}
              image={image}
              priority
            />
          </div>
        </div>

        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {images.slice(0, 5).map((thumb, index) => (
              <button
                key={`${thumb}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={activeImage === index}
                className={cn(
 "relative h-16 w-16 shrink-0 overflow-hidden rounded-none border-2 bg-card transition",
                  activeImage === index
                    ? "border-foreground"
                    : "border-transparent opacity-65 hover:opacity-100",
                )}
              >
                <SmartImage src={thumb} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{product.category?.name ?? "The collection"}</Badge>
          {product.brand ? <Badge tone="neutral">{product.brand.name}</Badge> : null}
          {discounted && percent > 0 ? <Badge tone="success">−{percent}%</Badge> : null}
        </div>

        <h3 className="mt-3 text-2xl font-bold tracking-tight not-italic sm:text-3xl">
          {productName(product)}
        </h3>

        {product.reviewCount > 0 ? (
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={product.averageRating} size={13} showValue />
            <span className="text-[11px] text-muted-foreground">
              {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : null}

        <div className="mt-4">
          <Price
            amount={product.finalPrice}
            compareAt={discounted ? product.originalPrice : null}
            size="xl"
          />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {product.shortDescription ?? product.description.slice(0, 220)}
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Colour
            </p>
            {images.length > 1 ? (
              <div className="mt-2 flex items-center gap-2">
                {images.slice(0, 5).map((thumb, index) => (
                  <button
                    key={`colour-${thumb}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Choose colourway ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={cn(
 "relative h-8 w-8 overflow-hidden rounded-none border-2 transition",
                      activeImage === index
                        ? "border-foreground"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <SmartImage src={thumb} alt="" fill sizes="32px" className="object-cover" />
                  </button>
                ))}
                <span className="text-[11px] text-muted-foreground">
                  Colourway {activeImage + 1} of {Math.min(images.length, 5)}
                </span>
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-2 rounded-none border border-border bg-card px-3 py-1.5 text-[11px] font-semibold">
                <span className="h-3 w-3 rounded-none border border-border bg-muted" aria-hidden="true" />
                As shown
              </div>
            )}
          </div>

          <div>
            {sizes.length > 0 ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Size
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedSize ?? "Select a size"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Product size">
                  {sizes.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "inline-flex min-h-10 min-w-11 items-center justify-center rounded-none border px-3 py-1.5 text-[11px] font-bold transition-colors",
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-foreground hover:border-foreground",
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Size
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex min-w-11 items-center justify-center rounded-none border border-border px-3 py-1.5 text-[11px] font-semibold">
                    One size
                  </span>
                </div>
              </>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Quantity
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={maxQuantity}
                disabled={outOfStock}
                label={`Quantity of ${productName(product)}`}
              />
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-semibold",
                  outOfStock
                    ? "text-danger"
                    : product.stock <= product.minimumStockLevel
                      ? "text-warning"
                      : "text-success",
                )}
              >
                <Package className="h-3.5 w-3.5" aria-hidden="true" />
                {outOfStock
                  ? "Out of stock"
                  : product.stock <= product.minimumStockLevel
                    ? `Only ${product.stock} left`
                    : `${product.stock} in stock`}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
          <Button
            size="lg"
            onClick={handleAdd}
            loading={adding}
            disabled={outOfStock || needsSize}
            className="min-w-0"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {outOfStock ? "Sold out" : `Add ${quantity} to bag`}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => void toggleWishlist(product.id, productName(product))}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
            className="h-11 w-11 justify-self-start border-border sm:justify-self-auto hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
          </Button>
        </div>

        <Button asChild variant="outline" size="lg" className="mt-2 w-full">
          <Link href={`/products/${product.slug}`}>
            View product
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
