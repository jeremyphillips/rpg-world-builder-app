import { monsterActionSectionRows, type MonsterLegendaryActionDraft } from '@rpg/contracts'

import type { MonsterFormValues } from '../monster-form-values'
import type { MonsterActionSection } from './references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from './monster-action-presets'

export type MonsterFormLegendaryActionsBlock = {
  uses?: { normal?: number; inLair?: number }
  actions: MonsterLegendaryActionDraft[]
}

export type MonsterFormActionSectionBody = Pick<
  MonsterFormValues,
  'actions' | 'bonusActions' | 'reactions' | 'legendaryActions'
>

/** RHF field array path for rows in the given section. */
export function monsterFormSectionRowsFieldName(section: MonsterActionSection): string {
  if (section === 'legendaryActions') return 'legendaryActions.actions'
  return section
}

/** Row path prefix for nested action field names (`${prefix}.0.name`, …). */
export function monsterFormSectionRowNamePrefix(section: MonsterActionSection): string {
  return monsterFormSectionRowsFieldName(section)
}

export function monsterFormSectionRows(
  values: MonsterFormActionSectionBody | undefined,
  section: MonsterActionSection,
): MonsterActionDraftRow[] {
  if (!values) return []
  return [...monsterActionSectionRows(values, section)] as MonsterActionDraftRow[]
}
