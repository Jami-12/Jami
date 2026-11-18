/** URL-safe slug from a human title. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const SKU_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function hash(value: string): string {
  let h = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index);
    h = Math.imul(h, 0x01000193);
  }
  let out = "";
  let remaining = Math.abs(h);
  for (let index = 0; index < 5; index += 1) {
    out += SKU_ALPHABET[remaining % SKU_ALPHABET.length];
    remaining = Math.floor(remaining / SKU_ALPHABET.length);
  }
  return out;
}

/** Stable, readable SKU derived from a product title. */
export function generateSku(title: string, prefix = "AETH"): string {
  const base = slugify(title).replace(/-/g, "").slice(0, 8).toUpperCase();
  if (!base) return "";
  return `${prefix}-${base || "ITEM"}-${hash(title)}`;
}
