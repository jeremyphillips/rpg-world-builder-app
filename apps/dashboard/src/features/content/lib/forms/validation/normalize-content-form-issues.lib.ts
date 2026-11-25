import type { ApiValidationIssue } from '@rpg/contracts'
import type { ZodType } from 'zod'
import { evaluateFormSchema, routeFormIssues, type FormIssue, type FormItem } from '@rpg/ui/form'

export const CONTENT_FORM_VALIDATION_OPERATION_MESSAGE =
  'Validation could not complete. Refresh and try again.'

export class ContentFormValidationOperationFailure extends Error {
  constructor(message = CONTENT_FORM_VALIDATION_OPERATION_MESSAGE) {
    super(message)
    this.name = 'ContentFormValidationOperationFailure'
  }
}

export function normalizeContentFormIssues(
  schema: ZodType,
  values: unknown,
  fields: FormItem[],
): FormIssue[] | null {
  const formValues =
    typeof values === 'object' && values !== null ? (values as Record<string, unknown>) : {}
  const evaluation = evaluateFormSchema(schema, values, { items: fields, formValues })
  if (evaluation.kind === 'parsed') return null
  if (evaluation.kind === 'operation-failure') {
    throw new ContentFormValidationOperationFailure(evaluation.message)
  }

  const combined = [...evaluation.issues, ...evaluation.rootIssues]
  return routeFormIssues(combined, fields, formValues)
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
