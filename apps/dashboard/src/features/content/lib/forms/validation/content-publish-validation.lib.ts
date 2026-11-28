import type { ApiValidationIssue } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodIssue, ZodType } from 'zod'
import { type FormIssue, type FormItem } from '@rpg/ui/form'

import { applyCanonicalFormIssuesToRhf } from './content-form-validation-rhf.lib'
import { normalizeContentFormIssues } from './normalize-content-form-issues.lib'

export const CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE =
  'Publish validation could not run. Refresh and try again.'

export function createContentPublishRoutingFailedIssues(): FormIssue[] {
  return [
    {
      path: '',
      message: CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE,
      severity: 'crossRow',
    },
  ]
}

export function tryEvaluateContentPublishFormIssues<TFieldValues extends FieldValues>(
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): { issues: FormIssue[]; routingFailed: boolean } {
  try {
    const issues = evaluateContentPublishFormIssues(publishSchema, values, items)
    if (issues === null) return { issues: [], routingFailed: false }
    return { issues, routingFailed: false }
  } catch {
    return { issues: createContentPublishRoutingFailedIssues(), routingFailed: true }
  }
}

export function formIssuesToPathMessages(
  issues: readonly Pick<FormIssue, 'path' | 'message'>[],
): Pick<ApiValidationIssue, 'path' | 'message'>[] {
  return issues.map((issue) => ({ path: issue.path, message: issue.message }))
}

export function zodIssuesToValidationIssues(issues: ZodIssue[]): ApiValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
    code: issue.code,
  }))
}

export function evaluateContentPublishFormIssues<TFieldValues extends FieldValues>(
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): FormIssue[] | null {
  return normalizeContentFormIssues(publishSchema, values, items)
}

export function evaluateContentPublishValidation<TFieldValues extends FieldValues>(
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): ApiValidationIssue[] | null {
  const issues = evaluateContentPublishFormIssues(publishSchema, values, items)
  if (!issues) return null
  return formIssuesToPathMessages(issues).map((issue) => ({
    ...issue,
    code: 'custom',
  }))
}

function paintCanonicalPublishIssues<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly FormIssue[],
): ApiValidationIssue[] {
  applyCanonicalFormIssuesToRhf(form, issues)
  return formIssuesToPathMessages(issues).map((issue) => ({
    ...issue,
    code: 'custom',
  }))
}

export function applyContentPublishValidation<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): ApiValidationIssue[] | null {
  const { issues, routingFailed } = tryEvaluateContentPublishFormIssues(
    publishSchema,
    values,
    items,
  )
  if (!routingFailed && issues.length === 0) return null
  return paintCanonicalPublishIssues(form, issues)
}

export function validateContentPublishValues<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): boolean {
  return applyContentPublishValidation(form, publishSchema, values, items) === null
}
