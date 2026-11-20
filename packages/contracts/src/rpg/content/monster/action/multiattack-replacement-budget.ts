import {
  isMultiattackAttackGroup,
  type MultiattackDraftStep,
  type MultiattackReplacement,
} from './multiattack-schemas'

function attackGroupCount(step: { count?: number }): number | undefined {
  return typeof step.count === 'number' && Number.isInteger(step.count) ? step.count : undefined
}

/** Sum of attack-group counts in the primary sequence (excludes use clauses). */
export function primaryAttackSlotTotal(steps: readonly MultiattackDraftStep[]): number | undefined {
  let total = 0
  for (const step of steps) {
    if (!isMultiattackAttackGroup(step)) continue
    const count = attackGroupCount(step)
    if (count === undefined || count < 1) return undefined
    total += count
  }
  return total
}

/** Slots from fixed single-id groups that reference `actionId` (any-combination groups contribute 0). */
export function targetedAttackSlotTotal(
  steps: readonly MultiattackDraftStep[],
  actionId: string,
): number {
  return steps.reduce((sum, step) => {
    if (!isMultiattackAttackGroup(step)) return sum
    const count = attackGroupCount(step)
    if (count === undefined || count < 1) return sum
    if (step.actionIds.length === 1 && step.actionIds[0] === actionId) return sum + count
    return sum
  }, 0)
}

/** Unique action ids referenced by attack groups, including any-combination groups. */
export function multiattackSequenceAttackIds(steps: readonly MultiattackDraftStep[]): string[] {
  const ids = new Set<string>()
  for (const step of steps) {
    if (!isMultiattackAttackGroup(step)) continue
    for (const id of step.actionIds ?? []) {
      if (id) ids.add(id)
    }
  }
  return [...ids]
}

export function actionIdAppearsInAttackSteps(
  steps: readonly MultiattackDraftStep[],
  actionId: string,
): boolean {
  return multiattackSequenceAttackIds(steps).includes(actionId)
}

const fixedSingleIdActionIds = (steps: readonly MultiattackDraftStep[]): string[] => {
  const ids = new Set<string>()
  for (const step of steps) {
    if (!isMultiattackAttackGroup(step)) continue
    if (step.actionIds?.length === 1) ids.add(step.actionIds[0]!)
  }
  return [...ids]
}

/** Fixed targets whose slot budget is below the unrestricted primary total. */
export function meaningfulMultiattackTargetActionIds(
  steps: readonly MultiattackDraftStep[],
): string[] {
  const primary = primaryAttackSlotTotal(steps)
  if (primary === undefined || primary < 1) return []
  return fixedSingleIdActionIds(steps).filter((id) => {
    const targeted = targetedAttackSlotTotal(steps, id)
    return targeted > 0 && targeted < primary
  })
}

type ReplacementLike = Pick<MultiattackReplacement, 'replacesActionId'> | undefined

/** Upper bound for `replacement.count` given primary steps and optional named target. */
export function replacementCountMax(
  replacement: ReplacementLike,
  steps: readonly MultiattackDraftStep[],
): number | undefined {
  const primary = primaryAttackSlotTotal(steps)
  if (primary === undefined) return undefined

  const targetId = replacement?.replacesActionId
  if (targetId) {
    const targeted = targetedAttackSlotTotal(steps, targetId)
    if (targeted >= 1) return Math.min(primary, targeted)
    if (actionIdAppearsInAttackSteps(steps, targetId)) return Math.min(primary, 1)
    return undefined
  }

  return primary
}

export function multiattackReplacementShowsStaticCount(
  replacement: { count?: number } | undefined,
  steps: readonly MultiattackDraftStep[],
): boolean {
  if (replacement?.count !== 1) return false
  const primary = primaryAttackSlotTotal(steps)
  if (primary !== 1) return false
  const max = replacementCountMax(replacement, steps)
  return max === 1
}
