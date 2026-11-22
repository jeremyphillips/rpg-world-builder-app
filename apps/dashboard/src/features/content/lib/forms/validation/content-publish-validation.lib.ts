import type { ApiValidationIssue } from '@rpg/contracts'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodIssue, ZodType } from 'zod'
import {
  collectTabbedFormResolverItems,
  safeParseWithFieldErrors,
  type FormItem,
} from '@rpg/ui/form'

import { resolveContentPublishSchema } from '../shells/edit/content-edit-load'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'

export const CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE =
  'Publish validation could not run. Refresh and try again.'

export function applyValidationIssuesToForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly Pick<ApiValidationIssue, 'path' | 'message'>[],
): void {
  paintValidationIssuesOnForm(form, issues)
}

/** Sets RHF errors and marks leaf paths touched so progressive UI shows them after a successful save. */
export function paintValidationIssuesOnForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  issues: readonly Pick<ApiValidationIssue, 'path' | 'message'>[],
): void {
  for (const issue of issues) {
    if (!issue.path) continue
    const path = issue.path as FieldPath<TFieldValues>
    form.setError(path, {
      type: 'server',
      message: issue.message,
    })
    const current = form.getValues(path)
    if (current !== undefined) {
      form.setValue(path, current, { shouldTouch: true, shouldValidate: false })
    }
  }
}

export function zodIssuesToValidationIssues(issues: ZodIssue[]): ApiValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
    code: issue.code,
  }))
}

export function evaluateContentPublishValidation<TFieldValues extends FieldValues>(
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): ApiValidationIssue[] | null {
  const result = safeParseWithFieldErrors(publishSchema, values, items)
  if (result.success) return null
  return zodIssuesToValidationIssues(result.error.issues)
}

export function applyContentPublishValidation<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  publishSchema: ZodType<TFieldValues>,
  values: TFieldValues,
  items: FormItem[] = [],
): ApiValidationIssue[] | null {
  const issues = evaluateContentPublishValidation(publishSchema, values, items)
  if (!issues) return null

  form.clearErrors()
  paintValidationIssuesOnForm(form, issues)
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

/**
 * Paints publish-only refinement issues on draft saves without blocking them.
 * Prefer {@link draftPublishValidationSurface} in mounted forms — it also marks the validation session.
 */
export function surfaceContentDraftPublishValidation<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  def: Pick<AnyContentFormDef, 'buildTabs' | 'schema' | 'draftSchema' | 'resolveSchema'>,
  ctx: ContentFormCtx,
  values?: TFieldValues,
): ApiValidationIssue[] | null {
  const publishSchema = resolveContentPublishSchema(def, ctx) as ZodType<TFieldValues>
  const fields = collectTabbedFormResolverItems(def.buildTabs(ctx))
  const payload = values ?? (form.getValues() as TFieldValues)
  const issues = evaluateContentPublishValidation(publishSchema, payload, fields)
  if (!issues) return null
  paintValidationIssuesOnForm(form, issues)
  return issues
}
