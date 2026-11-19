import type { Product } from "@/types";

/**
 * The catalogue has no variant model, so colour and size options are derived
 * from real product copy (title, description and image alt text). Nothing is
 * invented: if a product does not mention a colour, no swatches are shown.
 */

const COLOR_HEX: Record<string, string> = {
  black: "#16242E",
  ivory: "#F5F0E4",
  cream: "#F1ECDF",
  off_white: "#F8F6F0",
  white: "#F8F6F0",
  beige: "#D8DCCF",
  sand: "#D0C4A6",
  camel: "#C6A46A",
  tan: "#D0AE78",
  taupe: "#9E9A8B",
  brown: "#6b4f3a",
  espresso: "#3f2f24",
  chocolate: "#4a3428",
  grey: "#8a8782",
  gray: "#8a8782",
  charcoal: "#2A383F",
  navy: "#172B3A",
  blue: "#244B50",
  sky: "#C8D6D3",
  green: "#4f6b4a",
  olive: "#6b6b45",
  sage: "#9ca88f",
  rust: "#a4532f",
  terracotta: "#b65c3e",
  orange: "#c97a3f",
  wine: "#6d2338",
  burgundy: "#5e1f2f",
  red: "#a32f2a",
  maroon: "#5a1f26",
  pink: "#d8a3a8",
  blush: "#e6c2bb",
  rose: "#c98a92",
  yellow: "#d8b45a",
  mustard: "#C6A46A",
  gold: "#C6A46A",
  purple: "#6b4f7a",
  lavender: "#b9a8c9",
  lilac: "#c3b3d4",
};

export interface ProductColor {
  name: string;
  hex: string;
}

/** A curated palette for the shop filter. Matching still uses product copy. */
export const COLOR_SWATCHES: ProductColor[] = [
  { name: "Black", hex: COLOR_HEX.black ?? "#16242E" },
  { name: "Ivory", hex: COLOR_HEX.ivory ?? "#F5F0E4" },
  { name: "Cream", hex: COLOR_HEX.cream ?? "#F1ECDF" },
  { name: "Beige", hex: COLOR_HEX.beige ?? "#D8DCCF" },
  { name: "Camel", hex: COLOR_HEX.camel ?? "#C6A46A" },
  { name: "Brown", hex: COLOR_HEX.brown ?? "#6b4f3a" },
  { name: "Grey", hex: COLOR_HEX.grey ?? "#8a8782" },
  { name: "Navy", hex: COLOR_HEX.navy ?? "#172B3A" },
  { name: "Olive", hex: COLOR_HEX.olive ?? "#6b6b45" },
  { name: "Rust", hex: COLOR_HEX.rust ?? "#a4532f" },
  { name: "Wine", hex: COLOR_HEX.wine ?? "#6d2338" },
  { name: "Blush", hex: COLOR_HEX.blush ?? "#e6c2bb" },
];

function labelFor(name: string): string {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Colours explicitly mentioned in the product's own copy. */
export function productColors(product: Product): ProductColor[] {
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

/** Size runs for apparel and footwear categories; null for everything else. */
export function productSizes(product: Product): string[] | null {
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
