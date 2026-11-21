export type ReferencedActionRow = {
  id?: string
  name?: string
  kind?: string
  prerequisite?: string
  description?: string
  steps?: readonly { actionIds?: readonly string[] | undefined; kind?: string }[] | undefined
  replacement?: {
    choices?: readonly { actionId?: string }[]
    replacesActionId?: string
  }
  alternative?: {
    steps?: readonly { actionIds?: readonly string[]; kind?: string }[]
    afterUsingActionId?: string
  }
  actionIds?: readonly string[] | undefined
  followUpActionId?: string | undefined
}

function multiattackStepReferences(steps: ReferencedActionRow['steps']): string[] {
  if (!steps) return []
  return steps.flatMap((step) => {
    if (step.kind === 'use') {
      const row = step as {
        actionId?: string
        choices?: readonly { actionId?: string }[]
      }
      if (row.actionId) return [row.actionId]
      return (row.choices ?? []).flatMap((choice) => (choice.actionId ? [choice.actionId] : []))
    }
    return step.actionIds ?? []
  })
}

// fallow-ignore-next-line complexity
function referencedIds(action: ReferencedActionRow): string[] {
  if (action.kind === 'multiattack') {
    const fromSteps = multiattackStepReferences(action.steps)
    const fromReplacement = [
      ...(action.replacement?.choices?.flatMap((choice) =>
        choice.actionId ? [choice.actionId] : [],
      ) ?? []),
      ...(action.replacement?.replacesActionId ? [action.replacement.replacesActionId] : []),
    ]
    const fromAlternative = [
      ...multiattackStepReferences(action.alternative?.steps),
      ...(action.alternative?.afterUsingActionId ? [action.alternative.afterUsingActionId] : []),
    ]
    return [...fromSteps, ...fromReplacement, ...fromAlternative]
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
    if (action.kind === 'multiattack') {
      const steps = (action.steps ?? []).map((step) => {
        if (step.kind === 'use') {
          const row = step as {
            actionId?: string
            choices?: { actionId?: string }[]
          }
          if (row.actionId === actionId) return { ...step, actionId: undefined }
          if (row.choices) {
            return {
              ...step,
              choices: row.choices.filter((choice) => choice.actionId !== actionId),
            }
          }
          return step
        }
        return { ...step, actionIds: withoutId(step.actionIds, actionId) }
      })
      const replacement = action.replacement
        ? {
            ...action.replacement,
            choices: (action.replacement.choices ?? []).filter(
              (choice) => choice.actionId !== actionId,
            ),
            replacesActionId:
              action.replacement.replacesActionId === actionId
                ? undefined
                : action.replacement.replacesActionId,
          }
        : undefined
      const alternative = action.alternative
        ? {
            ...action.alternative,
            steps: (action.alternative.steps ?? []).map((step) => {
              if (step.kind === 'use') {
                const row = step as { actionId?: string; choices?: { actionId?: string }[] }
                if (row.actionId === actionId) return { ...step, actionId: undefined }
                if (row.choices) {
                  return {
                    ...step,
                    choices: row.choices.filter((choice) => choice.actionId !== actionId),
                  }
                }
                return step
              }
              return { ...step, actionIds: withoutId(step.actionIds, actionId) }
            }),
          }
        : undefined
      return { ...action, steps, replacement, alternative }
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
