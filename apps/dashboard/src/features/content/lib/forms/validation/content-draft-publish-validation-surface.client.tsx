'use client'

import { useEffect, useRef } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import {
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
import { usePublishContentFormProducerSlot } from './publish-content-form-producer-slot.client'

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
  const publishToProducerSlot = usePublishContentFormProducerSlot()
  const uiRef = useRef(ui)
  const onPublishIssuesChangeRef = useRef(onPublishIssuesChange)
  const publishToSlotRef = useRef(publishToProducerSlot)

  useEffect(() => {
    uiRef.current = ui
    onPublishIssuesChangeRef.current = onPublishIssuesChange
    publishToSlotRef.current = publishToProducerSlot
  }, [onPublishIssuesChange, publishToProducerSlot, ui])

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
          publishToSlotRef.current('publish-readiness', issues, onPublishIssuesChangeRef.current)
        }
        return null
      }
      if (issues.length === 0) return null

      applyCanonicalFormIssuesToRhf(form, issues)
      currentUi.markSubmitAttempted()

      if (currentUi.publishPresentationEnabled) {
        currentUi.markPublishAttempted()
        publishToSlotRef.current('publish-readiness', issues, onPublishIssuesChangeRef.current)
      }

      navigateInvalidSubmit(form, publishFields, formId, currentUi)

      return issues as unknown as ReturnType<DraftPublishValidationSurface>
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
