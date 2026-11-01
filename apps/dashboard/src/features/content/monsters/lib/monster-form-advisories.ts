import {
  isWeaponEquipment,
  isWeaponProficientFromGrantSet,
  joinInlineMetadata,
  resolveEquipmentNotProficientShortLabel,
  type Equipment,
} from '@rpg/contracts'

import { equipmentEntryBaseName } from './equipment/monster-equipment-labels'
import { coerceCreatureWeaponProficienciesForForm } from './creature-details/monster-weapon-proficiencies-form.lib'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from './actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from './actions/monster-action-presets'
import type { MonsterFormValues } from './monster-form-values'

export type MonsterFormAdvisory = {
  code: 'weapon-not-equipped' | 'weapon-not-proficient' | 'multiattack-unavailable-action'
  message: string
  path: string
}

function sectionRows(
  values: MonsterFormValues,
  section: MonsterActionSection,
): MonsterActionDraftRow[] {
  const rows = values[section]
  return Array.isArray(rows) ? (rows as MonsterActionDraftRow[]) : []
}

function appendMultiattackAdvisories(
  advisories: MonsterFormAdvisory[],
  values: MonsterFormValues,
  section: MonsterActionSection,
  action: MonsterActionDraftRow,
  index: number,
): void {
  const path = `${section}.${index}`
  const seen = new Set<string>()
  for (const step of action.steps ?? []) {
    for (const actionId of step.actionIds ?? []) {
      if (seen.has(actionId)) continue
      const target = sectionRows(values, 'actions').find((row) => row.id === actionId)
      if (!target || target.available !== false) continue
      seen.add(actionId)
      const name = target.name?.trim() || 'An attack'
      advisories.push({
        code: 'multiattack-unavailable-action',
        message: `${name} is unavailable, so this multiattack cannot use it.`,
        path,
      })
    }
  }
}

function appendWeaponAdvisories(
  advisories: MonsterFormAdvisory[],
  values: MonsterFormValues,
  equipmentById: ReadonlyMap<string, Equipment>,
  section: MonsterActionSection,
  action: MonsterActionDraftRow,
  index: number,
): void {
  if (action.kind !== 'weapon' || !action.equipmentEntryId) return
  const entry = (values.equipment ?? []).find((row) => row.entryId === action.equipmentEntryId)
  if (!entry) return
  const item = equipmentById.get(entry.equipmentId)
  const name = equipmentEntryBaseName(entry, equipmentById)
  const path = `${section}.${index}`
  if (!entry.equipped) {
    advisories.push({
      code: 'weapon-not-equipped',
      message: `${name} is not equipped.`,
      path,
    })
  }
  if (!item || !isWeaponEquipment(item)) return
  const proficient = isWeaponProficientFromGrantSet(
    item,
    coerceCreatureWeaponProficienciesForForm(values.proficiencies?.weapons),
  )
  if (proficient) return
  advisories.push({
    code: 'weapon-not-proficient',
    message: joinInlineMetadata([resolveEquipmentNotProficientShortLabel(), 'PB not included']),
    path,
  })
}

export function collectMonsterFormAdvisories(
  values: MonsterFormValues,
  equipmentById: ReadonlyMap<string, Equipment>,
): MonsterFormAdvisory[] {
  const advisories: MonsterFormAdvisory[] = []

  for (const section of MONSTER_ACTION_SECTIONS) {
    sectionRows(values, section).forEach((action, index) => {
      if (action.kind === 'multiattack') {
        appendMultiattackAdvisories(advisories, values, section, action, index)
        return
      }
      appendWeaponAdvisories(advisories, values, equipmentById, section, action, index)
    })
  }

  return advisories
}
