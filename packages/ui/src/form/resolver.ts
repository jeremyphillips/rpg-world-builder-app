import type { FieldValues, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'

import { hiddenFieldNames, type FormItem } from './field-config'

/**
 * A schema as duck-typed for the hidden-field omission below. We avoid
 * `instanceof` so it works even if the app and `@rpg/ui` resolve different `zod`
 * copies; a non-object schema simply skips omission.
 */
interface OmittableSchema {
  shape?: Record<string, unknown>
  omit?: (mask: Record<string, true>) => ZodType
}

/**
 * Drops hidden field keys from an object schema so they aren't validated — i.e.
 * a `required` field is only required while visible. Object schemas also strip
 * the hidden keys from their output, so the submitted payload omits them too.
 * Non-object (e.g. refined) schemas are returned unchanged (documented limit).
 */
function omitHidden(schema: ZodType, hidden: string[]): ZodType {
  if (hidden.length === 0) return schema
  const obj = schema as unknown as OmittableSchema
  if (!obj.shape || typeof obj.omit !== 'function') return schema
  const mask: Record<string, true> = {}
  for (const name of hidden) {
    if (name in obj.shape) mask[name] = true
  }
  return Object.keys(mask).length > 0 ? obj.omit(mask) : schema
}

/** Builds the RHF resolver that treats currently-hidden fields as optional. */
export function makeResolver<TFieldValues extends FieldValues>(
  schema: ZodType,
  items: FormItem[],
): Resolver<TFieldValues> {
  return (values, context, options) => {
    const hidden = hiddenFieldNames(items, values as Record<string, unknown>)
    // `zodResolver` over-constrains the schema's input type; the runtime schema
    // is correct, so widen the argument at this one boundary.
    const resolver = zodResolver(omitHidden(schema, hidden) as never) as Resolver<TFieldValues>
    return resolver(values, context, options)
  }
}
