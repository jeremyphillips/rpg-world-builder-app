import type { ApiValidationIssue } from '@rpg/contracts'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodIssue, ZodType } from 'zod'
import { safeParseWithFieldErrors, type FormItem } from '@rpg/ui/form'

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

export function applyContentPublishValidation<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): ApiValidationIssue[] | null {
  const result = safeParseWithFieldErrors(publishSchema, values, items)
  if (result.success) return null

  const issues = zodIssuesToValidationIssues(result.error.issues)
  form.clearErrors()
  applyValidationIssuesToForm(form, issues)
  return issues
}

export function validateContentPublishValues<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): boolean {
  return applyContentPublishValidation(form, publishSchema, values, items) === null
}
