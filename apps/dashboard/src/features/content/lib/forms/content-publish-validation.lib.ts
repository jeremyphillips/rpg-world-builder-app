import type { ApiValidationIssue } from '@rpg/contracts'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodIssue, ZodType } from 'zod'

export function applyValidationIssuesToForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly Pick<ApiValidationIssue, 'path' | 'message'>[],
): void {
  for (const issue of issues) {
    if (!issue.path) continue
    form.setError(issue.path as FieldPath<TFieldValues>, {
      type: 'server',
      message: issue.message,
    })
  }
}

export function zodIssuesToValidationIssues(issues: ZodIssue[]): ApiValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
  }))
}

export function validateContentPublishValues<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
): boolean {
  const result = publishSchema.safeParse(values)
  if (result.success) return true

  form.clearErrors()
  applyValidationIssuesToForm(form, zodIssuesToValidationIssues(result.error.issues))
  return false
}
