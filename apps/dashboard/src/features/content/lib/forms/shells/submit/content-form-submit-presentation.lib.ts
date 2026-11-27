import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  navigateInvalidSubmit,
  prepareFormIssues,
  resolveInvalidSubmitNavigationFromIssues,
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
  canonicalIssues?: readonly import('@rpg/ui/form').FormIssue[],
): string | undefined {
  const getItemValues = (fullName: string, index: number) => {
    const value = form.getValues(`${fullName}.${index}` as never)
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : undefined
  }
  const navigation = canonicalIssues
    ? resolveInvalidSubmitNavigationFromIssues(canonicalIssues, {
        fields,
        idPrefix: formId,
        getItemValues,
      })
    : resolveInvalidSubmitNavigationFromIssues(
        prepareFormIssues(
          form.formState.errors,
          fields,
          form.getValues() as Record<string, unknown>,
        ),
        { fields, idPrefix: formId, getItemValues },
      )
  return navigation?.firstIssue.path
}

export function presentContentFormInvalidSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'> | null,
  presentation: ContentFormInvalidPresentation,
  options?: {
    firstInvalidPath?: string
    canonicalIssues?: readonly import('@rpg/ui/form').FormIssue[]
  },
): void {
  const canonicalIssues =
    options?.canonicalIssues ??
    prepareFormIssues(
      form.formState.errors,
      presentation.resolverFields,
      form.getValues() as Record<string, unknown>,
    )
  const firstPath =
    options?.firstInvalidPath ??
    resolveFirstInvalidPath(form, presentation.resolverFields, presentation.formId, canonicalIssues)
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
      canonicalIssues,
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
    canonicalIssues: routed,
  })
  return nextSession
}
