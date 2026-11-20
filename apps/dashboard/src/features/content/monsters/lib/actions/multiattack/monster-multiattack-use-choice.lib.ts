import { multiattackPositiveInt } from '@rpg/contracts'

import {
  MONSTER_MULTIATTACK_CLEAR_OPTIONAL_BEFORE_CHOICE,
  MONSTER_MULTIATTACK_REMOVE_REPETITION_BEFORE_CHOICE,
} from '../../monster-form-labels'

type UseChoiceRow = { actionId?: string; spellId?: string }
type UseStep = {
  kind?: string
  mode?: string
  actionId?: string
  spellId?: string
  count?: unknown
  optional?: boolean
  choices?: UseChoiceRow[]
}

function nonEmptySpellId(spellId: unknown): string | undefined {
  return typeof spellId === 'string' && spellId.trim().length > 0 ? spellId : undefined
}

/** Whether Add action choice is allowed without mutating the step. */
export function multiattackUseChoiceExpandBlocked(step: UseStep): {
  disabled: boolean
  captions: string[]
} {
  const captions: string[] = []
  if (step.optional === true) {
    captions.push(MONSTER_MULTIATTACK_CLEAR_OPTIONAL_BEFORE_CHOICE)
  }
  const count = step.count
  const hasCount =
    count !== undefined && count !== null && !(typeof count === 'string' && count.trim() === '')
  if (hasCount && multiattackPositiveInt(count) !== 1) {
    captions.push(MONSTER_MULTIATTACK_REMOVE_REPETITION_BEFORE_CHOICE)
  }
  return { disabled: captions.length > 0, captions }
}

/** Payload for expanding a compatible single use step into choice mode. */
export function multiattackExpandUseToChoicePayload(step: UseStep): UseStep {
  const firstChoice: UseChoiceRow = {
    actionId: typeof step.actionId === 'string' ? step.actionId : '',
  }
  const spellId = nonEmptySpellId(step.spellId)
  if (spellId) firstChoice.spellId = spellId
  return {
    kind: 'use',
    mode: 'choice',
    choices: [firstChoice, {}],
  }
}

function choiceRowFromUnknown(row: unknown): UseChoiceRow {
  if (row === null || typeof row !== 'object') return {}
  const entry = row as UseChoiceRow
  return {
    actionId: typeof entry.actionId === 'string' ? entry.actionId : undefined,
    spellId: typeof entry.spellId === 'string' ? entry.spellId : undefined,
  }
}

function singleFromSurvivor(
  survivor: UseChoiceRow,
  inherited?: Pick<UseStep, 'count' | 'optional'>,
): UseStep {
  const next: UseStep = {
    kind: 'use',
    mode: 'single',
    actionId: survivor.actionId ?? '',
  }
  const spellId = nonEmptySpellId(survivor.spellId)
  if (spellId) next.spellId = spellId
  if (inherited?.count !== undefined) next.count = inherited.count
  if (inherited?.optional === true) next.optional = true
  return next
}

export type MultiattackUseChoiceRemovePlan =
  | { mode: 'filter'; choices: UseChoiceRow[] }
  | { mode: 'replaceParent'; parent: UseStep }

/** Plan parent-step writes when removing one use-choice row. */
export function multiattackUseChoiceRemovePlan(
  parentStep: UseStep,
  removedIndex: number,
): MultiattackUseChoiceRemovePlan {
  const choices = (parentStep.choices ?? []).map(choiceRowFromUnknown)
  const inherited = { count: parentStep.count, optional: parentStep.optional }

  if (choices.length >= 3) {
    return {
      mode: 'filter',
      choices: choices.filter((_, index) => index !== removedIndex),
    }
  }

  if (choices.length === 2) {
    const survivor = choices[removedIndex === 0 ? 1 : 0] ?? {}
    return { mode: 'replaceParent', parent: singleFromSurvivor(survivor, inherited) }
  }

  return {
    mode: 'replaceParent',
    parent: {
      kind: 'use',
      mode: 'single',
      actionId: '',
      ...(inherited.count !== undefined ? { count: inherited.count } : {}),
      ...(inherited.optional === true ? { optional: true } : {}),
    },
  }
}
