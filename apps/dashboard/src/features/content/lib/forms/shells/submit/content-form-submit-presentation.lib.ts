import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  buildFieldControlId,
  navigateInvalidSubmit,
  resolveInvalidSubmitNavigation,
  type FormItem,
  type FormUiContextValue,
  type FormValidationProducerSession,
} from '@rpg/ui/form'

import { getApiValidationIssues } from '@rpg/contracts'

import {
  applyCanonicalFormIssuesToRhf,
  ingestContentFormValidationIssues,
} from '../../validation/ingest-content-form-validation.lib'
import { apiValidationIssuesToFormIssues } from '../../validation/normalize-content-form-issues.lib'
import type { ContentPreparedWriteProvenance } from '../../submit/content-prepared-write.types'
import { mapWireIssuesToAuthoring } from '../../submit/map-wire-issues-to-authoring.lib'
import { reportUnattributed } from '../../submit/content-form-commit-pipeline.lib'
import type { ContentFormInvalidPresentation } from './content-form-submit-types.lib'

function resolveFirstInvalidPath<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FormItem[],
  formId: string,
): string | undefined {
  const navigation = resolveInvalidSubmitNavigation({
    errors: form.formState.errors,
    fields,
    idPrefix: formId,
    getItemValues: (fullName, index) => {
      const value = form.getValues(`${fullName}.${index}` as never)
      return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : undefined
    },
  })
  return navigation?.firstIssue.path
}

export function presentContentFormInvalidSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'> | null,
  presentation: ContentFormInvalidPresentation,
  options?: { firstInvalidPath?: string },
): void {
  const firstPath =
    options?.firstInvalidPath ??
    resolveFirstInvalidPath(form, presentation.resolverFields, presentation.formId)
  const viewId =
    firstPath && presentation.resolveViewForPath
      ? presentation.resolveViewForPath(firstPath)
      : undefined

  if (viewId && presentation.activateView) {
    presentation.activateView(viewId)
  }

  if (!ui) return

  navigateInvalidSubmit(
    form,
    presentation.resolverFields,
    presentation.formId,
    ui,
    form.formState.errors,
    {
      ...(viewId ? { waitForLayout: true, usePilotRevealBudget: true } : {}),
    },
  )
}

export function presentPersistValidationFailure<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
  presentation: ContentFormInvalidPresentation | undefined,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'> | null,
  session: FormValidationProducerSession,
  stamp: number,
  provenance: ContentPreparedWriteProvenance = {},
): FormValidationProducerSession {
  const apiIssues = getApiValidationIssues(error)
  if (!apiIssues?.length) return session
  // API paths are request space: resolve through this attempt's provenance before ownership.
  const attribution = mapWireIssuesToAuthoring(
    apiValidationIssuesToFormIssues(apiIssues),
    provenance,
  )
  reportUnattributed(attribution.unattributed)
  const routed = attribution.issues
  applyCanonicalFormIssuesToRhf(form, routed)
  if (!presentation) return session
  const nextSession = ingestContentFormValidationIssues(session, 'api', stamp, routed)
  presentContentFormInvalidSubmit(form, ui, presentation, {
    firstInvalidPath: routed[0]?.path,
  })
  return nextSession
}

/** Activates the view that owns `path`, then focuses that control or `[data-form-focus]`. */
export function focusFormPath(
  path: string,
  presentation: Pick<
    ContentFormInvalidPresentation,
    'formId' | 'resolveViewForPath' | 'activateView'
  >,
): void {
  const viewId = presentation.resolveViewForPath?.(path)
  if (viewId) presentation.activateView?.(viewId)
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const control = document.getElementById(
        buildFieldControlId(presentation.formId, undefined, path),
      )
      const marked = document.querySelector(`[data-form-focus="${path}"]`)
      const element = control ?? marked
      if (!(element instanceof HTMLElement)) return
      element.scrollIntoView({ block: 'center' })
      const focusable = element.matches('button, input, select, textarea, [tabindex]')
        ? element
        : element.querySelector<HTMLElement>('button, input, select, textarea, [tabindex]')
      focusable?.focus()
    })
  })
}
