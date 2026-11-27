'use client'

import { useCallback } from 'react'
import {
  useFormValidationProducerContext,
  type FormIssue,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

/** Single ingress for publish-readiness and related advisory producers. */
export function usePublishContentFormProducerSlot() {
  const producer = useFormValidationProducerContext()
  return useCallback(
    (
      slot: FormValidationProducerSlot,
      issues: readonly FormIssue[],
      legacyNotify?: (validation: { issues: readonly FormIssue[] }) => void,
    ) => {
      if (producer?.replaceSlot) {
        producer.replaceSlot(slot, issues)
        return
      }
      legacyNotify?.({ issues })
    },
    [producer],
  )
}
