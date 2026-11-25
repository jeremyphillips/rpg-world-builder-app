import type { ZodType } from 'zod'

import { hiddenFieldNames, type FormItem } from '../field-config'

interface OmittableSchema {
  shape?: Record<string, unknown>
  omit?: (mask: Record<string, true>) => ZodType
  _zod?: { def?: { checks?: unknown[] } }
}

function hasObjectRefinements(schema: OmittableSchema): boolean {
  const checks = schema._zod?.def?.checks
  return Array.isArray(checks) && checks.length > 0
}

export function hiddenFieldNamesForValues(
  items: FormItem[],
  formValues?: Record<string, unknown>,
): string[] {
  if (!formValues) return []
  return hiddenFieldNames(items, formValues)
}

export function omitHiddenSchema(schema: ZodType, hidden: string[]): ZodType {
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
