import type { MonsterFormValues } from './monster-form-values'

export const MONSTER_ACTION_SECTIONS = ['actions', 'bonusActions', 'reactions'] as const

export type MonsterActionSection = (typeof MONSTER_ACTION_SECTIONS)[number]

export type MonsterEquipmentActionReference = {
  section: MonsterActionSection
  id: string
  name?: string
}

function sectionActions(
  values: MonsterFormValues,
  section: MonsterActionSection,
): Array<Record<string, unknown>> {
  const rows = values[section]
  return Array.isArray(rows) ? (rows as Array<Record<string, unknown>>) : []
}

export function findActionsReferencingEntry(
  values: MonsterFormValues,
  entryId: string,
): MonsterEquipmentActionReference[] {
  const references: MonsterEquipmentActionReference[] = []
  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const action of sectionActions(values, section)) {
      if (
        action.kind === 'weapon' &&
        action.equipmentEntryId === entryId &&
        typeof action.id === 'string'
      ) {
        references.push({
          section,
          id: action.id,
          name: typeof action.name === 'string' ? action.name : undefined,
        })
      }
    }
  }
  return references
}

export function removeEquipmentEntryWithDependents(
  values: MonsterFormValues,
  entryId: string,
): MonsterFormValues {
  const next: MonsterFormValues = {
    ...values,
    equipment: values.equipment.filter((entry) => entry.entryId !== entryId),
  }
  for (const section of MONSTER_ACTION_SECTIONS) {
    next[section] = sectionActions(values, section).filter(
      (action) => !(action.kind === 'weapon' && action.equipmentEntryId === entryId),
    )
  }
  return next
}
