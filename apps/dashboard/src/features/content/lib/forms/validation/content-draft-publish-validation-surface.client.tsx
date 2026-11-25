'use client'

import { useEffect, useRef } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import {
  createEmptyFormValidationProducerSession,
  navigateInvalidSubmit,
  useFormUiContext,
  type FormIssue,
  type FormItem,
} from '@rpg/ui/form'
import type { ContentValidationIntent } from '@rpg/contracts'

import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'
import { resolveContentPublishSchema } from '../shells/edit/content-edit-load'
import {
  draftPublishValidationSurface,
  type DraftPublishValidationSurface,
} from './content-draft-publish-validation-surface.ref'
import { applyCanonicalFormIssuesToRhf } from './content-form-validation-rhf.lib'
import { tryEvaluateContentPublishFormIssues } from './content-publish-validation.lib'
import { ingestContentFormValidationIssues } from './ingest-content-form-validation.lib'

export function ContentDraftPublishValidationSurfaceBridge({
  def,
  ctx,
  validationIntent,
  publishFields,
  formId,
  onPublishIssuesChange,
}: {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  validationIntent: ContentValidationIntent | undefined
  publishFields: FormItem[]
  formId: string
  onPublishIssuesChange: (validation: { issues: readonly FormIssue[] }) => void
}) {
  const form = useFormContext<FieldValues>()
  const ui = useFormUiContext()
  const uiRef = useRef(ui)
  const onPublishIssuesChangeRef = useRef(onPublishIssuesChange)
  const publishReadinessSessionRef = useRef(createEmptyFormValidationProducerSession())

  useEffect(() => {
    uiRef.current = ui
    onPublishIssuesChangeRef.current = onPublishIssuesChange
  }, [onPublishIssuesChange, ui])

  // Keep this registration stable across presentation resets. Reading `ui` from
  // state would unsubscribe the surface before the post-save microtask runs.
  useEffect(() => {
    if (validationIntent !== 'draft') {
      draftPublishValidationSurface.current = null
      return
    }

    const surface: DraftPublishValidationSurface = (values) => {
      const publishSchema = resolveContentPublishSchema(def, ctx)
      const currentUi = uiRef.current
      const { issues, routingFailed } = tryEvaluateContentPublishFormIssues(
        publishSchema,
        values,
        publishFields,
      )
      if (routingFailed) {
        applyCanonicalFormIssuesToRhf(form, issues)
        currentUi.markSubmitAttempted()
        if (currentUi.publishPresentationEnabled) {
          currentUi.markPublishAttempted()
          onPublishIssuesChangeRef.current({ issues })
        }
        return null
      }
      if (issues.length === 0) return null

      applyCanonicalFormIssuesToRhf(form, issues)
      currentUi.markSubmitAttempted()

      if (currentUi.publishPresentationEnabled) {
        currentUi.markPublishAttempted()
        const stamp = Date.now()
        publishReadinessSessionRef.current = ingestContentFormValidationIssues(
          publishReadinessSessionRef.current,
          'publish-readiness',
          stamp,
          issues,
        )
        onPublishIssuesChangeRef.current({
          issues: publishReadinessSessionRef.current.slots['publish-readiness']?.issues ?? issues,
        })
      }

      navigateInvalidSubmit(form, publishFields, formId, currentUi)

      return issues
    }

    draftPublishValidationSurface.current = surface
    return () => {
      if (draftPublishValidationSurface.current === surface) {
        draftPublishValidationSurface.current = null
      }
    }
  }, [ctx, def, form, formId, publishFields, validationIntent])

  return null
}
