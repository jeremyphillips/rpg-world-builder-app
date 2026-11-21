import {
  multiattackUseClauseHasRepetition,
  multiattackUseClauseRepetitionEligible,
  multiattackUseClauseRepetitionRepairRequired,
} from '@rpg/contracts'

import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'

export function multiattackSectionRowsPathFromStepPrefix(namePrefix: string): MonsterActionSection {
  if (namePrefix.startsWith('bonusActions')) return 'bonusActions'
  if (namePrefix.startsWith('reactions')) return 'reactions'
  if (namePrefix.startsWith('legendaryActions')) return 'legendaryActions'
  return 'actions'
}

export function multiattackActionKindById(
  actionId: string | undefined,
  rows: readonly MonsterActionDraftRow[],
): string | undefined {
  if (!actionId) return undefined
  return rows.find((row) => row.id === actionId)?.kind
}

export function multiattackUseStepRepetitionSlotVisible(input: {
  actionKind: string | undefined
  count: unknown
}): boolean {
  if (multiattackUseClauseRepetitionEligible(input.actionKind)) return true
  return multiattackUseClauseRepetitionRepairRequired(input.actionKind, input.count)
}

export function multiattackUseStepRepetitionAddVisible(actionKind: string | undefined): boolean {
  return multiattackUseClauseRepetitionEligible(actionKind)
}
