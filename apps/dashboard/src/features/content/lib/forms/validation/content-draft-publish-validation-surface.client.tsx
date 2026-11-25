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
import {
  CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE,
  evaluateContentPublishFormIssues,
  paintValidationIssuesOnForm,
} from './content-publish-validation.lib'
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
      let issues: ReturnType<typeof evaluateContentPublishFormIssues>
      try {
        issues = evaluateContentPublishFormIssues(publishSchema, values, publishFields)
      } catch {
        paintValidationIssuesOnForm(form, [
          { path: '', message: CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE },
        ])
        currentUi.markSubmitAttempted()
        if (currentUi.publishPresentationEnabled) {
          currentUi.markPublishAttempted()
          onPublishIssuesChangeRef.current({
            issues: [
              {
                path: '',
                message: CONTENT_PUBLISH_VALIDATION_ROUTING_FAILED_MESSAGE,
                severity: 'crossRow',
              },
            ],
          })
        }
        return null
      }
      if (!issues) return null

      paintValidationIssuesOnForm(
        form,
        issues.map((issue) => ({ path: issue.path, message: issue.message })),
      )
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
