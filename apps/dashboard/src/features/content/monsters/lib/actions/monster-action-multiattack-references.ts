import type { MonsterActionDraftRow } from './monster-action-presets'

function referencedIds(action: MonsterActionDraftRow): string[] {
  if (action.kind === 'multiattack') {
    return (action.steps ?? []).flatMap((step) => step.actionIds ?? [])
  }
  if (action.kind === 'action-reference') return action.actionIds ?? []
  if (action.kind === 'parry' && action.followUpActionId) return [action.followUpActionId]
  return []
}

/** Multiattacks and legendary references whose id list includes this action. */
export function actionsReferencingAction(
  actions: readonly MonsterActionDraftRow[],
  actionId: string,
): MonsterActionDraftRow[] {
  return actions.filter(
    (action) => action.id !== actionId && referencedIds(action).includes(actionId),
  )
}

function withoutId(ids: readonly string[] | undefined, actionId: string): string[] {
  return (ids ?? []).filter((id) => id !== actionId)
}

/** Drops one referenced id from multiattack steps and legendary action references. */
export function stripReferencedActionId(
  actions: readonly MonsterActionDraftRow[],
  actionId: string,
): MonsterActionDraftRow[] {
  return actions.map((action) => {
    if (action.kind === 'multiattack' && action.steps) {
      return {
        ...action,
        steps: action.steps.map((step) => ({
          ...step,
          actionIds: withoutId(step.actionIds, actionId),
        })),
      }
    }
    if (action.kind === 'action-reference') {
      return { ...action, actionIds: withoutId(action.actionIds, actionId) }
    }
    if (action.kind === 'parry' && action.followUpActionId === actionId) {
      const { followUpActionId: _followUp, ...rest } = action
      return rest
    }
    return action
  })
}

export const multiattacksReferencingAction = actionsReferencingAction
export const stripMultiattackActionId = stripReferencedActionId
