import type { CreateSetupExternalDecision, CreateSetupSequenceItem } from './create-setup.types'

export type ResolveCreateSetupActiveSetIdInput = {
  sets: readonly CreateSetupSequenceItem[]
  reopenSetId?: string | null
}

function buildCreateSetupSetsById(
  sets: readonly CreateSetupSequenceItem[],
): Map<string, CreateSetupSequenceItem> {
  return new Map(sets.map((set) => [set.id, set]))
}

function isCreateSetupVisibilityGateOpen(
  set: CreateSetupSequenceItem,
  setsById: Map<string, CreateSetupSequenceItem>,
): boolean {
  for (const upstreamId of set.visibleWhenComplete ?? []) {
    const upstream = setsById.get(upstreamId)
    if (upstream?.isComplete !== true) {
      return false
    }
  }
  return true
}

function isCreateSetupSetEligibleNow(
  set: CreateSetupSequenceItem,
  setsById: Map<string, CreateSetupSequenceItem>,
): boolean {
  return isCreateSetupVisibilityGateOpen(set, setsById)
}

/** Active = reopened (if eligible) ?? first incomplete eligible-now set ?? null on exhaustion. */
export function resolveCreateSetupActiveSetId({
  sets,
  reopenSetId,
}: ResolveCreateSetupActiveSetIdInput): string | null {
  if (sets.length === 0) return null

  const setsById = buildCreateSetupSetsById(sets)

  if (reopenSetId != null) {
    const reopenSet = setsById.get(reopenSetId)
    if (reopenSet && isCreateSetupSetEligibleNow(reopenSet, setsById)) {
      return reopenSetId
    }
  }

  const firstIncompleteEligible = sets.find(
    (set) => isCreateSetupSetEligibleNow(set, setsById) && !set.isComplete,
  )
  if (firstIncompleteEligible) return firstIncompleteEligible.id

  return null
}

/** True when the set is the active decision control (expanded RadioCardField). */
export function resolveCreateSetupSetExpanded({
  setId,
  activeSetId,
  reopenSetId = null,
}: {
  setId: string
  activeSetId: string | null
  reopenSetId?: string | null
}): boolean {
  if (reopenSetId === setId) return true
  return setId === activeSetId
}

/**
 * Reveal completed or optional predecessors plus the active set. When no question is
 * active (exhaustion), returns all eligible-now complete sets for summary rendering.
 */
export function resolveCreateSetupVisibleSetIds({
  sets,
  activeSetId,
}: {
  sets: readonly CreateSetupSequenceItem[]
  activeSetId: string | null
}): string[] {
  if (sets.length === 0) return []

  const setsById = buildCreateSetupSetsById(sets)

  if (activeSetId == null) {
    return sets.flatMap((set) =>
      isCreateSetupSetEligibleNow(set, setsById) && set.isComplete ? [set.id] : [],
    )
  }

  const activeIndex = sets.findIndex((set) => set.id === activeSetId)
  if (activeIndex < 0) return []

  const visibleIds: string[] = []
  for (let index = 0; index < sets.length; index += 1) {
    const set = sets[index]
    if (!set || !isCreateSetupSetEligibleNow(set, setsById)) continue
    if (index < activeIndex && (set.isComplete || set.required === false)) {
      visibleIds.push(set.id)
      continue
    }
    if (set.id === activeSetId) {
      visibleIds.push(set.id)
    }
  }
  return visibleIds
}

export function resolveCreateSetupSetsComplete({
  sets,
}: {
  sets: readonly CreateSetupSequenceItem[]
}): boolean {
  if (sets.length === 0) return false
  return sets.every((set) => set.isComplete)
}

export function resolveCreateSetupIsComplete({
  sets,
  externalDecisions = [],
  confirmedRevisionById = new Map<string, string>(),
}: {
  sets: readonly CreateSetupSequenceItem[]
  externalDecisions?: readonly CreateSetupExternalDecision[]
  confirmedRevisionById?: ReadonlyMap<string, string>
}): boolean {
  if (!resolveCreateSetupSetsComplete({ sets })) {
    return false
  }

  for (const decision of externalDecisions) {
    if (!decision.isResolved) {
      return false
    }
    if (decision.completion === 'explicit') {
      if (confirmedRevisionById.get(decision.id) !== decision.revision) {
        return false
      }
    }
  }

  return true
}

export function resolveCreateSetupPendingExplicitDecisions({
  externalDecisions = [],
  confirmedRevisionById = new Map<string, string>(),
}: {
  externalDecisions?: readonly CreateSetupExternalDecision[]
  confirmedRevisionById?: ReadonlyMap<string, string>
}): Array<{ id: string; isResolved: boolean; completeLabel: string }> {
  return externalDecisions.flatMap((decision) => {
    if (decision.completion !== 'explicit') {
      return []
    }
    if (confirmedRevisionById.get(decision.id) === decision.revision) {
      return []
    }
    return [
      {
        id: decision.id,
        isResolved: decision.isResolved,
        completeLabel: decision.completeLabel ?? 'Continue',
      },
    ]
  })
}

export function isCreateSetupChoiceComplete(value: string | null | undefined): boolean {
  return Boolean(value)
}

type SetDependencyItem = {
  id: string
  dependsOn?: readonly string[]
}

/**
 * Set ids that must be reset when `changedSetId` changes, including transitive dependents.
 */
export function resolveCreateSetupSetIdsToInvalidate({
  sets,
  changedSetId,
}: {
  sets: readonly SetDependencyItem[]
  changedSetId: string
}): string[] {
  const dependentsByUpstream = new Map<string, string[]>()
  for (const set of sets) {
    for (const upstreamId of set.dependsOn ?? []) {
      const list = dependentsByUpstream.get(upstreamId) ?? []
      list.push(set.id)
      dependentsByUpstream.set(upstreamId, list)
    }
  }

  const invalidated = new Set<string>()
  const queue = [changedSetId]
  while (queue.length > 0) {
    const current = queue.shift()
    if (current == null) continue
    for (const dependentId of dependentsByUpstream.get(current) ?? []) {
      if (invalidated.has(dependentId)) continue
      invalidated.add(dependentId)
      queue.push(dependentId)
    }
  }

  return [...invalidated]
}

export function notifyCreateSetupCompletionTransition({
  wasComplete,
  nextComplete,
  onSetupComplete,
}: {
  wasComplete: boolean
  nextComplete: boolean
  onSetupComplete?: () => void
}): void {
  if (!wasComplete && nextComplete && onSetupComplete) {
    onSetupComplete()
  }
}
