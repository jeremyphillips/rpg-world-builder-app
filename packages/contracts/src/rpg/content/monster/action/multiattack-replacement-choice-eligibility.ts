import { actionIdAppearsInAttackSteps } from './multiattack-replacement-budget'
import type { MultiattackDraftStep, MultiattackReplacement } from './multiattack-schemas'

export type MultiattackReplacementChoiceRef = {
  actionId?: string
  spellId?: string
}

export type MultiattackReplacementRedundancy = 'ok' | 'self_target' | 'already_in_sequence'

export function multiattackReplacementChoiceKey(choice: MultiattackReplacementChoiceRef): string {
  return `${choice.actionId ?? ''}:${choice.spellId ?? ''}`
}

/** Whether a replacement choice is semantically redundant (not kind-ineligible). */
export function classifyMultiattackReplacementChoice(input: {
  steps: readonly MultiattackDraftStep[]
  replacement: Pick<MultiattackReplacement, 'replacesActionId'>
  choice: { actionId: string; spellId?: string }
}): MultiattackReplacementRedundancy {
  const { actionId } = input.choice
  const target = input.replacement.replacesActionId
  if (target && actionId === target) return 'self_target'
  if (!target && actionIdAppearsInAttackSteps(input.steps, actionId)) {
    return 'already_in_sequence'
  }
  return 'ok'
}

export function isMultiattackReplacementChoiceRedundant(
  input: Parameters<typeof classifyMultiattackReplacementChoice>[0],
): boolean {
  return classifyMultiattackReplacementChoice(input) !== 'ok'
}

/** Keys already used by sibling replacement choices (excludes the current row selection). */
export function siblingMultiattackReplacementChoiceKeys(
  choices: readonly MultiattackReplacementChoiceRef[],
  current: MultiattackReplacementChoiceRef,
): Set<string> {
  const currentKey = current.actionId ? multiattackReplacementChoiceKey(current) : ''
  const taken = new Set<string>()
  for (const choice of choices) {
    if (!choice.actionId) continue
    const key = multiattackReplacementChoiceKey(choice)
    if (currentKey && key === currentKey) continue
    taken.add(key)
  }
  return taken
}
