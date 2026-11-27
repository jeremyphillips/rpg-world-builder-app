'use client'

import { useContext, useEffect, useRef } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { FormUiContext, type FormIssue, type FormItem } from '@rpg/ui/form'

import { evaluateContentPublishFormIssues } from './content-publish-validation.lib'
import { applyCanonicalFormIssuesToRhf } from './ingest-content-form-validation.lib'
import { usePublishContentFormProducerSlot } from './publish-content-form-producer-slot.client'

type MountedPublishCanonicalBridgeProps = {
  publishSchema: ZodType<FieldValues>
  publishFields: FormItem[]
  onPublishIssuesChange?: (validation: { issues: readonly FormIssue[] }) => void
}

/**
 * Test harness only — do not mount in production shells. Re-evaluates the publish schema after
 * submit attempts so multi-path canonical issues are painted when RHF's resolver tree is partial.
 */
export function MountedPublishCanonicalBridge({
  publishSchema,
  publishFields,
  onPublishIssuesChange,
}: MountedPublishCanonicalBridgeProps) {
  const form = useFormContext<FieldValues>()
  const ui = useContext(FormUiContext)
  const publishToProducerSlot = usePublishContentFormProducerSlot()
  const submitCount = form.formState.submitCount
  const prevSubmitCountRef = useRef(submitCount)

  useEffect(() => {
    if (submitCount <= prevSubmitCountRef.current) return
    prevSubmitCountRef.current = submitCount

    const issues = evaluateContentPublishFormIssues(publishSchema, form.getValues(), publishFields)
    if (!issues?.length) return

    applyCanonicalFormIssuesToRhf(form, issues)
    ui.markSubmitAttempted()
    ui.markPublishAttempted()
    publishToProducerSlot('publish-readiness', issues, onPublishIssuesChange)
    publishToProducerSlot('publish-action', issues, onPublishIssuesChange)
  }, [
    form,
    onPublishIssuesChange,
    publishFields,
    publishSchema,
    publishToProducerSlot,
    submitCount,
    ui,
  ])

  return null
}
