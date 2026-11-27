import type { ZodType } from 'zod'

import { routeFormIssues } from '../errors/route-form-issues.lib'
import type { FormIssue } from '../errors/form-issue.types'
import { evaluateFormSchema, type EvaluateFormSchemaOptions } from './form-schema-evaluator'

export type EvaluateRoutedFormSchemaResult<T = unknown> =
  | { kind: 'valid'; data: T }
  | { kind: 'invalid'; issues: FormIssue[] }
  | { kind: 'operation-failure'; message: string }

function authoringFormValues(
  input: unknown,
  options: EvaluateFormSchemaOptions,
): Record<string, unknown> {
  if (typeof input === 'object' && input !== null) {
    return input as Record<string, unknown>
  }
  return options.formValues ?? {}
}

/**
 * Pure schema evaluation plus ownership routing — no RHF or ingestion side effects.
 */
export function evaluateRoutedFormSchema<T>(
  schema: ZodType<T>,
  input: unknown,
  options: EvaluateFormSchemaOptions,
): EvaluateRoutedFormSchemaResult<T> {
  const formValues = authoringFormValues(input, options)
  const evaluation = evaluateFormSchema(schema, input, { items: options.items, formValues })

  if (evaluation.kind === 'parsed') {
    return { kind: 'valid', data: evaluation.data }
  }

  if (evaluation.kind === 'operation-failure') {
    return { kind: 'operation-failure', message: evaluation.message }
  }

  // `evaluation.issues` already includes root issues.
  return {
    kind: 'invalid',
    issues: routeFormIssues(evaluation.issues, options.items, formValues),
  }
}
