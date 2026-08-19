'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  resolveCreateSetupActiveSetId,
  resolveCreateSetupIsComplete,
  resolveCreateSetupPendingExplicitDecisions,
  resolveCreateSetupVisibleSetIds,
  notifyCreateSetupCompletionTransition,
} from './create-setup-sequence.lib'
import type {
  CreateSetupExternalDecision,
  CreateSetupSequenceModel,
  CreateSetupSet,
} from './create-setup.types'

export type UseCreateSetupSequenceOptions = {
  externalDecisions?: readonly CreateSetupExternalDecision[]
  onSetupComplete?: () => void
}

function toSequenceItems(sets: readonly CreateSetupSet[]) {
  return sets.map((set) => ({
    id: set.id,
    isComplete: set.isComplete,
    required: set.required,
    dependsOn: set.dependsOn,
    visibleWhenComplete: set.visibleWhenComplete,
    summaryGroup: set.summaryGroup,
  }))
}

/** Feature-owned sequencing model — pass one instance to the panel, footer, and sibling UI. */
export function useCreateSetupSequence(
  sets: readonly CreateSetupSet[],
  options: UseCreateSetupSequenceOptions = {},
): CreateSetupSequenceModel {
  const [reopenSetId, setReopenSetId] = useState<string | null>(null)
  const [confirmedRevisionById, setConfirmedRevisionById] = useState<Map<string, string>>(
    () => new Map(),
  )

  const externalDecisions = options.externalDecisions ?? []
  const sequenceItems = useMemo(() => toSequenceItems(sets), [sets])

  const activeSetId = resolveCreateSetupActiveSetId({
    sets: sequenceItems,
    reopenSetId,
  })

  const visibleSetIds = resolveCreateSetupVisibleSetIds({
    sets: sequenceItems,
    activeSetId,
  })

  const isComplete = resolveCreateSetupIsComplete({
    sets: sequenceItems,
    externalDecisions,
    confirmedRevisionById,
  })

  const pendingExplicitDecisions = resolveCreateSetupPendingExplicitDecisions({
    externalDecisions,
    confirmedRevisionById,
  })

  const completeExplicitDecision = useCallback(
    (id: string) => {
      const decision = externalDecisions.find((item) => item.id === id)
      if (!decision || decision.completion !== 'explicit' || !decision.isResolved) {
        return
      }

      const wasComplete = resolveCreateSetupIsComplete({
        sets: sequenceItems,
        externalDecisions,
        confirmedRevisionById,
      })

      const nextConfirmedRevisionById = new Map(confirmedRevisionById)
      nextConfirmedRevisionById.set(id, decision.revision)
      setConfirmedRevisionById(nextConfirmedRevisionById)

      const nextComplete = resolveCreateSetupIsComplete({
        sets: sequenceItems,
        externalDecisions,
        confirmedRevisionById: nextConfirmedRevisionById,
      })

      notifyCreateSetupCompletionTransition({
        wasComplete,
        nextComplete,
        onSetupComplete: options.onSetupComplete,
      })
    },
    [confirmedRevisionById, externalDecisions, options.onSetupComplete, sequenceItems],
  )

  return {
    activeSetId,
    visibleSetIds,
    reopenSetId,
    reopen: setReopenSetId,
    isEditingUpstream: reopenSetId != null,
    isComplete,
    pendingExplicitDecisions,
    completeExplicitDecision,
  }
}

export function evaluateCreateSetupCompletionTransition(args: {
  previousSets: readonly CreateSetupSet[]
  nextSets: readonly CreateSetupSet[]
  externalDecisions?: readonly CreateSetupExternalDecision[]
  confirmedRevisionById?: ReadonlyMap<string, string>
}): { wasComplete: boolean; nextComplete: boolean } {
  const externalDecisions = args.externalDecisions ?? []
  const confirmedRevisionById = args.confirmedRevisionById ?? new Map<string, string>()

  return {
    wasComplete: resolveCreateSetupIsComplete({
      sets: toSequenceItems(args.previousSets),
      externalDecisions,
      confirmedRevisionById,
    }),
    nextComplete: resolveCreateSetupIsComplete({
      sets: toSequenceItems(args.nextSets),
      externalDecisions,
      confirmedRevisionById,
    }),
  }
}

export function notifyCreateSetupValueChangeCompletion(args: {
  previousSets: readonly CreateSetupSet[]
  nextSets: readonly CreateSetupSet[]
  externalDecisions?: readonly CreateSetupExternalDecision[]
  confirmedRevisionById?: ReadonlyMap<string, string>
  onSetupComplete?: () => void
}): void {
  const { wasComplete, nextComplete } = evaluateCreateSetupCompletionTransition(args)
  notifyCreateSetupCompletionTransition({
    wasComplete,
    nextComplete,
    onSetupComplete: args.onSetupComplete,
  })
}
