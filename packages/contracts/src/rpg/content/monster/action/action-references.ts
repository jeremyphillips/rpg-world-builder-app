export type ReferencedActionRow = {
  id?: string
  name?: string
  kind?: string
  prerequisite?: string
  description?: string
  steps?: readonly { actionIds?: readonly string[] | undefined }[] | undefined
  actionIds?: readonly string[] | undefined
  followUpActionId?: string | undefined
}

function referencedIds(action: ReferencedActionRow): string[] {
  if (action.kind === 'multiattack') {
    return (action.steps ?? []).flatMap((step) => step.actionIds ?? [])
  }
  if (action.kind === 'action-reference') return [...(action.actionIds ?? [])]
  if (action.kind === 'parry' && action.followUpActionId) return [action.followUpActionId]
  return []
}

/** Multiattacks, legendary references, reactions, and parry follow-ups that cite this action. */
export function actionsReferencingAction<T extends ReferencedActionRow>(
  actions: readonly T[],
  actionId: string,
): T[] {
  return actions.filter(
    (action) => action.id !== actionId && referencedIds(action).includes(actionId),
  )
}

function withoutId(ids: readonly string[] | undefined, actionId: string): string[] {
  return (ids ?? []).filter((id) => id !== actionId)
}

/** Drops one referenced id from multiattack steps, action references, and parry follow-ups. */
export function stripReferencedActionId<T extends ReferencedActionRow>(
  actions: readonly T[],
  actionId: string,
): T[] {
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
      return rest as T
    }
    return action
  })
}
