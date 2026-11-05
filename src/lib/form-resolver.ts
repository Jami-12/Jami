import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Zod v4 infers different input and output types for schemas that use
 * `z.coerce`, unions or transforms. React Hook Form exposes the raw form
 * values to the resolver, so a direct `zodResolver(schema)` is typed against
 * the schema's *input* type. This helper keeps the form typed to the parsed
 * output while letting Zod perform coercion at validation time.
 */
export function formResolver<T extends FieldValues>(schema: ZodType): Resolver<T> {
  return zodResolver(schema as never) as unknown as Resolver<T>;
}
