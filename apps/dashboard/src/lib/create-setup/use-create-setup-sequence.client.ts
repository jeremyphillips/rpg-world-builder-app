'use client'

import { useMemo, useState } from 'react'

import {
  resolveCreateSetupActiveSetId,
  resolveCreateSetupCanContinue,
  resolveCreateSetupCollapsedCompleteSetIds,
  resolveCreateSetupVisibleSetIds,
} from './create-setup-sequence.lib'
import type { CreateSetupSequenceModel, CreateSetupSet } from './create-setup.types'

export type UseCreateSetupSequenceOptions = {
  /** Escape hatch for extra validation beyond required set completion. */
  additionalContinueConstraint?: boolean
}

/** Feature-owned sequencing model — pass one instance to the panel and sibling UI. */
export function useCreateSetupSequence(
  sets: readonly CreateSetupSet[],
  options: UseCreateSetupSequenceOptions = {},
): CreateSetupSequenceModel {
  const [reopenSetId, setReopenSetId] = useState<string | null>(null)

  const sequenceItems = useMemo(
    () =>
      sets.map((set) => ({
        id: set.id,
        isComplete: set.isComplete,
        required: set.required,
        dependsOn: set.dependsOn,
        visibleWhenComplete: set.visibleWhenComplete,
        collapseWhenComplete: set.collapseWhenComplete,
        collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete,
        summaryGroup: set.summaryGroup,
      })),
    [sets],
  )

  const activeSetId = resolveCreateSetupActiveSetId({
    sets: sequenceItems,
    reopenSetId,
  })

  const visibleSetIds = resolveCreateSetupVisibleSetIds({
    sets: sequenceItems,
    activeSetId,
  })

  const collapsedCompleteSetIds = useMemo(
    () =>
      resolveCreateSetupCollapsedCompleteSetIds({
        sets,
        visibleSetIds,
        activeSetId,
        reopenSetId,
      }),
    [activeSetId, reopenSetId, sets, visibleSetIds],
  )

  const canContinue =
    resolveCreateSetupCanContinue({ sets: sequenceItems }) &&
    (options.additionalContinueConstraint ?? true)

  return {
    activeSetId,
    visibleSetIds,
    collapsedCompleteSetIds,
    reopenSetId,
    reopen: setReopenSetId,
    isEditingUpstream: reopenSetId != null,
    canContinue,
  }
}
