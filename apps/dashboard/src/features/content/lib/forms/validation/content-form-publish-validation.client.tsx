import { useEffect, useRef } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import type { TabbedFormTab } from '@rpg/ui/form'

import { usePublishContentFormProducerSlot } from './publish-content-form-producer-slot.client'
import {
  useContentPublishValidation,
  type ContentPublishValidation,
} from './use-content-publish-validation'

/** Bridges live publish validation into {@link FormUiProvider} presentation props. */
export function ContentFormPublishValidationBridge({
  schema,
  tabs,
  onValidationChange,
}: {
  schema: ZodType<FieldValues>
  tabs: TabbedFormTab[]
  onValidationChange: (validation: Pick<ContentPublishValidation, 'issues'>) => void
}) {
  const validation = useContentPublishValidation({ schema, tabs, debounceMs: 0 })
  const publishToProducerSlot = usePublishContentFormProducerSlot()
  const publishedSignatureRef = useRef<string | null>(null)

  useEffect(() => {
    if (validation.isChecking) return
    // Not-ready with no routed issues is a transient parse — keep the surfaced list.
    if (validation.issues.length === 0 && !validation.isPublishReady) return

    const signature = validation.isPublishReady
      ? '__ready__'
      : validation.issues.map((issue) => `${issue.path}\0${issue.message}`).join('\n')
    if (signature === publishedSignatureRef.current) return
    publishedSignatureRef.current = signature
    publishToProducerSlot(
      'publish-readiness',
      validation.isPublishReady ? [] : validation.issues,
      (result) => onValidationChange({ issues: [...result.issues] }),
    )
  }, [
    onValidationChange,
    publishToProducerSlot,
    validation.isChecking,
    validation.isPublishReady,
    validation.issues,
  ])

  return null
}
