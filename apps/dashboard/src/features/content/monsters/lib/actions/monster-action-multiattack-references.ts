import type { MonsterActionDraftRow } from './monster-action-presets'

function referencesAttacks(action: MonsterActionDraftRow): action is MonsterActionDraftRow & {
  kind: 'multiattack' | 'attack-sequence'
  steps?: { actionIds?: string[] }[]
} {
  return action.kind === 'multiattack' || action.kind === 'attack-sequence'
}

function stepReferences(action: MonsterActionDraftRow, actionId: string): boolean {
  if (!referencesAttacks(action)) return false
  return (action.steps ?? []).some((step) => (step.actionIds ?? []).includes(actionId))
}

/** Multiattacks in Actions whose steps include this action id. */
export function multiattacksReferencingAction(
  actions: readonly MonsterActionDraftRow[],
  actionId: string,
): MonsterActionDraftRow[] {
  return actions.filter(
    (action) =>
      referencesAttacks(action) && action.id !== actionId && stepReferences(action, actionId),
  )
}

/** Drops one referenced id. Counts stay as authored. Empty steps remain. */
export function stripMultiattackActionId(
  actions: readonly MonsterActionDraftRow[],
  actionId: string,
): MonsterActionDraftRow[] {
  return actions.map((action) => {
    if (!referencesAttacks(action) || !action.steps) return action
    return {
      ...action,
      steps: action.steps.map((step) => ({
        ...step,
        actionIds: (step.actionIds ?? []).filter((id) => id !== actionId),
      })),
    }
  })
}
