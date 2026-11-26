import type { ApiValidationIssue } from '@rpg/contracts'
import type { ZodType } from 'zod'
import { evaluateRoutedFormSchema, type FormIssue, type FormItem } from '@rpg/ui/form'

export const CONTENT_FORM_VALIDATION_OPERATION_MESSAGE =
  'Validation could not complete. Refresh and try again.'

export class ContentFormValidationOperationFailure extends Error {
  constructor(message = CONTENT_FORM_VALIDATION_OPERATION_MESSAGE) {
    super(message)
    this.name = 'ContentFormValidationOperationFailure'
  }
}

export type ContentFormEvaluation<T> =
  | { kind: 'parsed'; data: T }
  | { kind: 'invalid'; issues: FormIssue[] }

/** Evaluates once and returns parsed output (coercions, defaults) or routed issues. */
export function evaluateContentFormSchema<T>(
  schema: ZodType<T>,
  values: unknown,
  fields: FormItem[],
): ContentFormEvaluation<T> {
  const formValues =
    typeof values === 'object' && values !== null ? (values as Record<string, unknown>) : {}
  const result = evaluateRoutedFormSchema(schema, values, { items: fields, formValues })

  if (result.kind === 'valid') return { kind: 'parsed', data: result.data }
  if (result.kind === 'operation-failure') {
    throw new ContentFormValidationOperationFailure(result.message)
  }

  return { kind: 'invalid', issues: result.issues }
}

export function normalizeContentFormIssues(
  schema: ZodType,
  values: unknown,
  fields: FormItem[],
): FormIssue[] | null {
  const evaluation = evaluateContentFormSchema(schema, values, fields)
  return evaluation.kind === 'invalid' ? evaluation.issues : null
}

export function apiValidationIssuesToFormIssues(
  issues: readonly Pick<ApiValidationIssue, 'path' | 'message'>[],
): FormIssue[] {
  return issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
    severity: 'field' as const,
  }))
}
