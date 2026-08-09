export type CreateSetupChoiceSetSequenceItem = {
  id: string
  isComplete: boolean
  required?: boolean
  /** Upstream choice-set ids — when any change, this set is cleared. */
  dependsOn?: readonly string[]
}

export type ResolveCreateSetupActiveChoiceSetIdInput = {
  choiceSets: readonly CreateSetupChoiceSetSequenceItem[]
  reopenChoiceSetId?: string | null
}

/** Active = reopened (if still present) ?? first incomplete ?? terminal. */
export function resolveCreateSetupActiveChoiceSetId({
  choiceSets,
  reopenChoiceSetId,
}: ResolveCreateSetupActiveChoiceSetIdInput): string | null {
  if (choiceSets.length === 0) return null

  if (
    reopenChoiceSetId != null &&
    choiceSets.some((choiceSet) => choiceSet.id === reopenChoiceSetId)
  ) {
    return reopenChoiceSetId
  }

  const firstIncomplete = choiceSets.find((choiceSet) => !choiceSet.isComplete)
  if (firstIncomplete) return firstIncomplete.id

  return choiceSets[choiceSets.length - 1]?.id ?? null
}

export function resolveCreateSetupChoiceSetExpanded({
  choiceSetId,
  activeChoiceSetId,
}: {
  choiceSetId: string
  activeChoiceSetId: string | null
}): boolean {
  return choiceSetId === activeChoiceSetId
}

/**
 * Reveal completed predecessors plus the active set. Later sets unlock as
 * earlier sets complete — ordinary step progression, not domain visibility.
 */
export function resolveCreateSetupVisibleChoiceSetIds({
  choiceSets,
  activeChoiceSetId,
}: {
  choiceSets: readonly CreateSetupChoiceSetSequenceItem[]
  activeChoiceSetId: string | null
}): string[] {
  if (choiceSets.length === 0 || activeChoiceSetId == null) return []

  const activeIndex = choiceSets.findIndex((choiceSet) => choiceSet.id === activeChoiceSetId)
  if (activeIndex < 0) return []

  const visibleIds: string[] = []
  for (let index = 0; index < choiceSets.length; index += 1) {
    const choiceSet = choiceSets[index]
    if (!choiceSet) continue
    if (index < activeIndex && choiceSet.isComplete) {
      visibleIds.push(choiceSet.id)
      continue
    }
    if (choiceSet.id === activeChoiceSetId) {
      visibleIds.push(choiceSet.id)
    }
  }
  return visibleIds
}

export function resolveCreateSetupCanContinue({
  choiceSets,
}: {
  choiceSets: readonly CreateSetupChoiceSetSequenceItem[]
}): boolean {
  if (choiceSets.length === 0) return false
  return choiceSets.every((choiceSet) => {
    const required = choiceSet.required !== false
    return !required || choiceSet.isComplete
  })
}

export function isCreateSetupChoiceSetComplete(value: string | null | undefined): boolean {
  return Boolean(value)
}

type ChoiceSetDependencyItem = {
  id: string
  dependsOn?: readonly string[]
}

/**
 * Choice-set ids that must be cleared when `changedChoiceSetId` changes,
 * including transitive dependents.
 */
export function resolveCreateSetupChoiceSetIdsToInvalidate({
  choiceSets,
  changedChoiceSetId,
}: {
  choiceSets: readonly ChoiceSetDependencyItem[]
  changedChoiceSetId: string
}): string[] {
  const dependentsByUpstream = new Map<string, string[]>()
  for (const choiceSet of choiceSets) {
    for (const upstreamId of choiceSet.dependsOn ?? []) {
      const list = dependentsByUpstream.get(upstreamId) ?? []
      list.push(choiceSet.id)
      dependentsByUpstream.set(upstreamId, list)
    }
  }

  const invalidated = new Set<string>()
  const queue = [changedChoiceSetId]
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
