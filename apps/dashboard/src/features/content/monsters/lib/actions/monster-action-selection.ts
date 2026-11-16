import type { FieldErrors } from 'react-hook-form'

import {
  findFirstInvalidRowIndex,
  resolveAdjacentIndex,
  resolveSelectionAfterRemoval,
} from '../../../lib/master-detail/master-detail-selection'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from './references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from './monster-action-presets'
import type { MonsterFormValues } from '../monster-form-values'
import {
  monsterFormSectionRows,
  monsterFormSectionRowsFieldName,
} from './monster-action-section-access'

function sectionRows(
  values: Pick<MonsterFormValues, MonsterActionSection | 'legendaryActions'>,
  section: MonsterActionSection,
): MonsterActionDraftRow[] {
  return monsterFormSectionRows(values, section)
}

export function resolveFirstInvalidActionPath(
  errors: FieldErrors,
  values: Pick<MonsterFormValues, MonsterActionSection>,
): { section: MonsterActionSection; index: number; id: string } | null {
  for (const section of MONSTER_ACTION_SECTIONS) {
    const index = findFirstInvalidRowIndex(errors, monsterFormSectionRowsFieldName(section))
    if (index === null) continue
    const row = sectionRows(values, section)[index]
    const id = row && 'id' in row && typeof row.id === 'string' ? row.id : undefined
    if (typeof id === 'string' && id.length > 0) return { section, index, id }
  }
  return null
}

export function resolveMonsterActionSelectionAfterRemoval(
  values: Pick<MonsterFormValues, MonsterActionSection>,
  section: MonsterActionSection,
  removedId: string,
): string | null {
  const ids = sectionRows(values, section).map((row) => row.id)
  const within = resolveSelectionAfterRemoval(ids, removedId)
  if (within) return within

  const sectionIndex = MONSTER_ACTION_SECTIONS.indexOf(section)
  const remaining = (key: MonsterActionSection) =>
    sectionRows(values, key)
      .map((row) => row.id)
      .filter((id) => !(key === section && id === removedId))

  const nextSection = resolveAdjacentIndex(
    MONSTER_ACTION_SECTIONS.length,
    sectionIndex,
    (index) => remaining(MONSTER_ACTION_SECTIONS[index]!).length > 0,
  )
  if (nextSection === null) return null
  const key = MONSTER_ACTION_SECTIONS[nextSection]!
  const rows = remaining(key)
  return nextSection > sectionIndex ? (rows[0] ?? null) : (rows[rows.length - 1] ?? null)
}

export function firstMonsterActionId(
  values: Pick<MonsterFormValues, MonsterActionSection>,
): string | null {
  for (const section of MONSTER_ACTION_SECTIONS) {
    const id = sectionRows(values, section)[0]?.id
    if (id) return id
  }
  return null
}
