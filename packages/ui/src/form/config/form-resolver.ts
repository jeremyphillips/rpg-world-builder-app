import type { FieldValues, Resolver, ResolverOptions } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'

import { hiddenFieldNames, type FormItem } from '../field-config'
import { makeFieldErrorMap } from './field-error-map'

/**
 * A schema as duck-typed for the hidden-field omission below. We avoid
 * `instanceof` so it works even if the app and `@rpg/ui` resolve different `zod`
 * copies; a non-object schema simply skips omission.
 */
interface OmittableSchema {
  shape?: Record<string, unknown>
  omit?: (mask: Record<string, true>) => ZodType
  _zod?: { def?: { checks?: unknown[] } }
}

/** Zod 4 attaches refinements to object schemas via `_zod.def.checks`. */
function hasObjectRefinements(schema: OmittableSchema): boolean {
  const checks = schema._zod?.def?.checks
  return Array.isArray(checks) && checks.length > 0
}

/**
 * Drops hidden field keys from an object schema so they aren't validated — i.e.
 * a `required` field is only required while visible. Object schemas also strip
 * the hidden keys from their output, so the submitted payload omits them too.
 * Object schemas with refinements (e.g. `.superRefine`) are returned unchanged:
 * Zod 4 rejects `.omit()` on those schemas; refinements and `shouldUnregister`
 * handle conditional fields instead.
 *
 * **Array item fields**: hidden fields inside array items (e.g. `traits.0.name`)
 * are _not_ stripped by this function — Zod's `.omit` only works on top-level
 * object keys. Item-scoped conditional visibility is instead handled at the RHF
 * level via `shouldUnregister: true`: when the field unmounts, RHF clears the
 * value and omits the key from the submitted payload automatically. The schema
 * for array items should therefore treat conditionally-shown fields as optional.
 */
function omitHidden(schema: ZodType, hidden: string[]): ZodType {
  if (hidden.length === 0) return schema
  const obj = schema as unknown as OmittableSchema
  if (!obj.shape || typeof obj.omit !== 'function') return schema
  const mask: Record<string, true> = {}
  for (const name of hidden) {
    if (name in obj.shape) mask[name] = true
  }
  if (Object.keys(mask).length === 0) return schema
  if (hasObjectRefinements(obj)) return schema
  return obj.omit(mask)
}

/**
 * Builds the RHF resolver that treats currently-hidden fields as optional and
 * formats default Zod issues into shared boilerplate copy using field labels
 * (custom `.refine` / `.superRefine` messages pass through untouched).
 */
export function makeResolver<TFieldValues extends FieldValues>(
  schema: ZodType,
  items: FormItem[],
): Resolver<TFieldValues> {
  const errorMap = makeFieldErrorMap(items)

  return (values, context, options) => {
    const hidden = hiddenFieldNames(items, values as Record<string, unknown>)
    // `zodResolver` over-constrains the schema's input type; the runtime schema
    // is correct, so widen the arguments at this one boundary.
    const resolver = zodResolver(omitHidden(schema, hidden) as never, {
      error: errorMap,
    }) as unknown as Resolver<TFieldValues>
    return resolver(values, context, options)
  }
}

export interface SilentValidationResult {
  valid: boolean
}

const SILENT_RESOLVER_OPTIONS: ResolverOptions<FieldValues> = {
  fields: {},
  shouldUseNativeValidation: false,
}

/**
 * Wraps the same resolver RHF uses at submit so footer gating can check validity
 * without calling `form.trigger()` or populating RHF `errors`.
 */
export function createValidateSilently<TFieldValues extends FieldValues>(
  resolver: Resolver<TFieldValues>,
): (values: TFieldValues) => Promise<SilentValidationResult> {
  return async (values) => {
    const result = await resolver(
      values,
      undefined,
      SILENT_RESOLVER_OPTIONS as ResolverOptions<TFieldValues>,
    )
    return { valid: Object.keys(result.errors).length === 0 }
  }
}
