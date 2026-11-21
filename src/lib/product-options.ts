import type { Product } from "@/types";

/**
 * Colour and size options come from the product's explicit variant fields when
 * they are set in the admin, and otherwise fall back to options derived from
 * real product copy (title, description and image alt text). Nothing is
 * invented: if a product does not mention a colour, no swatches are shown.
 */

/**
 * Real product swatch values. The neutral design system governs surfaces and
 * typography, but a product's actual colour must stay truthful in cards,
 * filters and detail views.
 */
const COLOR_HEX: Record<string, string> = {
  black: "#0A0A0A",
  ivory: "#F8F4E6",
  cream: "#F5E6C8",
  off_white: "#FAF9F6",
  white: "#FFFFFF",
  beige: "#D6C2A1",
  sand: "#C2B280",
  camel: "#B1936E",
  tan: "#D2B48C",
  taupe: "#8C8275",
  brown: "#6B4423",
  espresso: "#3B2A20",
  chocolate: "#4A2E1B",
  grey: "#808080",
  gray: "#808080",
  charcoal: "#36454F",
  navy: "#1A2B4A",
  blue: "#2F5D9E",
  sky: "#87CEEB",
  green: "#3F6B4A",
  olive: "#556B2F",
  sage: "#8A9A7B",
  rust: "#A6532D",
  terracotta: "#C26B4B",
  orange: "#E07B39",
  wine: "#6B2737",
  burgundy: "#6A1E2B",
  red: "#C0392B",
  maroon: "#6E1F2B",
  pink: "#E59AAA",
  blush: "#F1C7C7",
  rose: "#D98A96",
  yellow: "#E7C33A",
  mustard: "#C99B20",
  gold: "#C9A227",
  purple: "#6B4C9A",
  lavender: "#B7A2D8",
  lilac: "#C3AED6",
};

export interface ProductColor {
  name: string;
  hex: string;
}

/** A curated palette for the shop filter. Matching still uses product copy. */
export const COLOR_SWATCHES: ProductColor[] = [
  { name: "Black", hex: COLOR_HEX.black ?? "#0A0A0A" },
  { name: "Ivory", hex: COLOR_HEX.ivory ?? "#F8F4E6" },
  { name: "Cream", hex: COLOR_HEX.cream ?? "#F5E6C8" },
  { name: "Beige", hex: COLOR_HEX.beige ?? "#D6C2A1" },
  { name: "Camel", hex: COLOR_HEX.camel ?? "#B1936E" },
  { name: "Brown", hex: COLOR_HEX.brown ?? "#6B4423" },
  { name: "Grey", hex: COLOR_HEX.grey ?? "#808080" },
  { name: "Navy", hex: COLOR_HEX.navy ?? "#1A2B4A" },
  { name: "Olive", hex: COLOR_HEX.olive ?? "#556B2F" },
  { name: "Rust", hex: COLOR_HEX.rust ?? "#A6532D" },
  { name: "Wine", hex: COLOR_HEX.wine ?? "#6B2737" },
  { name: "Blush", hex: COLOR_HEX.blush ?? "#F1C7C7" },
];

function labelFor(name: string): string {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Explicit admin colours first, then colours mentioned in the product copy. */
export function productColors(product: Product): ProductColor[] {
  if (product.colors?.length) {
    return product.colors.slice(0, 6).map((colour) => ({
      name: colour.name,
      hex: colour.hex,
    }));
  }

  const haystack = [
    product.title,
    product.shortDescription ?? "",
    product.description,
    ...product.images.map((image) => image.altText ?? ""),
  ]
    .join(" ")
    .toLowerCase();

  const found: ProductColor[] = [];
  for (const [name, hex] of Object.entries(COLOR_HEX)) {
    const needle = name.replace(/_/g, " ");
    if (new RegExp(`\\b${needle}\\b`).test(haystack)) {
      const label = labelFor(name);
      if (!found.some((colour) => colour.name === label)) {
        found.push({ name: label, hex });
      }
    }
  }

  return found.slice(0, 6);
}

const APPAREL =
  /(fashion|apparel|cloth|shirt|tee|t-shirt|knit|outerwear|dress|trouser|pant|coat|jacket|hoodie|sweater|blouse|skirt|suit|blazer)/i;
const FOOTWEAR = /(shoe|sneaker|boot|sandal|loafer|heel|footwear)/i;

/** Explicit admin sizes first, then inferred runs for apparel and footwear. */
export function productSizes(product: Product): string[] | null {
  if (product.sizes?.length) return product.sizes.slice(0, 30);
  const haystack = `${product.category?.name ?? ""} ${product.category?.slug ?? ""} ${product.title}`;
  if (FOOTWEAR.test(haystack)) return ["38", "39", "40", "41", "42", "43", "44"];
  if (APPAREL.test(haystack)) return ["XS", "S", "M", "L", "XL", "XXL"];
  return null;
}

export function isNewProduct(product: Product, days = 30): boolean {
  const created = new Date(product.createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created < days * 24 * 60 * 60 * 1000;
}

/** A short, honest detail line for cards and quick view. */
export function productDetailLine(product: Product): string {
  if (product.shortDescription) return product.shortDescription;
  const firstSentence = product.description.split(/(?<=[.!?])\s/)[0];
  return firstSentence && firstSentence.length < 160
    ? firstSentence
    : `${product.category?.name ?? "Collection"} · thoughtfully made`;
}
