// Backwards-compatible entry point. The collection finder used to live here;
// it now lives in `product-finder` so the homepage can compose it with the
// other editorial sections.
export { ProductFinder as HeroBanner } from "./product-finder";
