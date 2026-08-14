import type { CreateSetupSequenceItem } from './create-setup.types'

export type ResolveCreateSetupActiveSetIdInput = {
  sets: readonly CreateSetupSequenceItem[]
  reopenSetId?: string | null
}

/** Active = reopened (if still present) ?? first incomplete required set ?? terminal. */
export function resolveCreateSetupActiveSetId({
  sets,
  reopenSetId,
}: ResolveCreateSetupActiveSetIdInput): string | null {
  if (sets.length === 0) return null

  if (reopenSetId != null && sets.some((set) => set.id === reopenSetId)) {
    return reopenSetId
  }

  const firstIncompleteRequired = sets.find((set) => set.required !== false && !set.isComplete)
  if (firstIncompleteRequired) return firstIncompleteRequired.id

  return sets[sets.length - 1]?.id ?? null
}

export function resolveCreateSetupSetExpanded({
  setId,
  activeSetId,
  visible,
  isComplete,
  required = true,
  collapseWhenComplete = true,
}: {
  setId: string
  activeSetId: string | null
  visible: boolean
  isComplete: boolean
  required?: boolean
  collapseWhenComplete?: boolean
}): boolean {
  if (setId === activeSetId) return true
  if (visible && required === false && !isComplete) return true
  if (visible && collapseWhenComplete === false) return true
  return false
}

/**
 * Reveal completed or optional predecessors plus the active set. Required sets
 * still unlock in order; untouched optional sets are pass-through authoring.
 */
export function resolveCreateSetupVisibleSetIds({
  sets,
  activeSetId,
}: {
  sets: readonly CreateSetupSequenceItem[]
  activeSetId: string | null
}): string[] {
  if (sets.length === 0 || activeSetId == null) return []

  const activeIndex = sets.findIndex((set) => set.id === activeSetId)
  if (activeIndex < 0) return []

  const visibleIds: string[] = []
  for (let index = 0; index < sets.length; index += 1) {
    const set = sets[index]
    if (!set) continue
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

export function resolveCreateSetupCanContinue({
  sets,
}: {
  sets: readonly CreateSetupSequenceItem[]
}): boolean {
  if (sets.length === 0) return false
  return sets.every((set) => {
    const required = set.required !== false
    return !required || set.isComplete
  })
}

export function isCreateSetupChoiceComplete(value: string | null | undefined): boolean {
  return Boolean(value)
}

export function isCreateSetupNumberComplete(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max
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
