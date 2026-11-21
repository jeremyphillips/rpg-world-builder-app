import {
  meaningfulMultiattackTargetActionIds,
  multiattackReplacementShowsStaticCount,
  multiattackSequenceAttackIds,
  primaryAttackSlotTotal,
  replacementCountMax,
  type MultiattackDraftStep,
} from '@rpg/contracts'

type ReplacementSlice = {
  count?: number
  replacesActionId?: string
  attackWord?: 'any' | boolean
}

function replacementFromValues(values: Record<string, unknown>): ReplacementSlice {
  return {
    count: values['replacement.count'] as number | undefined,
    replacesActionId: values['replacement.replacesActionId'] as string | undefined,
    attackWord: values['replacement.attackWord'] as ReplacementSlice['attackWord'],
  }
}

function stepsFromValues(values: Record<string, unknown>): readonly MultiattackDraftStep[] {
  const steps = values.steps
  return Array.isArray(steps) ? (steps as MultiattackDraftStep[]) : []
}

export function multiattackReplacementCountMaxFromValues(
  values: Record<string, unknown>,
): number | undefined {
  return replacementCountMax(replacementFromValues(values), stepsFromValues(values))
}

export function multiattackShowsStaticReplacementCount(values: Record<string, unknown>): boolean {
  return multiattackReplacementShowsStaticCount(
    replacementFromValues(values),
    stepsFromValues(values),
  )
}

export function multiattackTargetAttackFieldVisible(values: Record<string, unknown>): boolean {
  const attackWord = values['replacement.attackWord']
  if (attackWord === 'any' || attackWord === true) return false
  if (values['replacement.replacesActionId']) return true
  const steps = stepsFromValues(values)
  if (meaningfulMultiattackTargetActionIds(steps).length > 0) return true
  const count = values['replacement.count']
  return count === 1 && multiattackSequenceAttackIds(steps).length > 0
}

export function multiattackAnyAttackWordingVisible(values: Record<string, unknown>): boolean {
  const attackWord = values['replacement.attackWord']
  if (attackWord === 'any' || attackWord === true) return true
  if (values['replacement.replacesActionId']) return false
  const count = values['replacement.count']
  if (count !== undefined && count !== 1) return false
  const primary = primaryAttackSlotTotal(stepsFromValues(values))
  return primary !== undefined && primary > 1
}
