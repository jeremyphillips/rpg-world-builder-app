import type { ZodType } from 'zod'

import type { FormItem } from '../field-config'
import type { FormSchemaEvaluationResult } from './form-evaluation.types'
import { evaluateFormSchema } from './form-schema-evaluator'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/** Structural equality for authoring snapshots; non-plain objects compare by identity. */
export function isEquivalentFormInput(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => isEquivalentFormInput(item, b[index]))
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a)
    return (
      keys.length === Object.keys(b).length &&
      keys.every((key) => key in b && isEquivalentFormInput(a[key], b[key]))
    )
  }
  return false
}

/**
 * One evaluation per equivalent (schema, items, input). The evaluator is pure, so the last
 * settled result is reused for a structurally equal input snapshot. RHF re-invokes its
 * resolver for `isValid` bookkeeping with the same values; those calls share one parse.
 */
export function createMemoizedFormEvaluator<T>(
  schema: ZodType<T>,
  items: FormItem[],
): (input: unknown) => FormSchemaEvaluationResult<T> {
  let last: { input: unknown; result: FormSchemaEvaluationResult<T> } | null = null
  return (input) => {
    if (last && isEquivalentFormInput(last.input, input)) return last.result
    const result = evaluateFormSchema(schema, input, {
      items,
      formValues: input as Record<string, unknown>,
    })
    last = { input: structuredCloneSafe(input), result }
    return result
  }
}

/** Snapshot the input so later in-place mutation cannot alias the cached key. */
function structuredCloneSafe(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(structuredCloneSafe)
  if (isPlainObject(input)) {
    return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, structuredCloneSafe(v)]))
  }
  return input
}
