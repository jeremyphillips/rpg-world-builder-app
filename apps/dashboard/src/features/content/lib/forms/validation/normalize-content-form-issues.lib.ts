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

export function normalizeContentFormIssues(
  schema: ZodType,
  values: unknown,
  fields: FormItem[],
): FormIssue[] | null {
  const formValues =
    typeof values === 'object' && values !== null ? (values as Record<string, unknown>) : {}
  const result = evaluateRoutedFormSchema(schema, values, { items: fields, formValues })

  if (result.kind === 'valid') return null
  if (result.kind === 'operation-failure') {
    throw new ContentFormValidationOperationFailure(result.message)
  }

  return result.issues
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
