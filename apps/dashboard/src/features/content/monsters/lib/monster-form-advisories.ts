import {
  isWeaponEquipment,
  isWeaponProficientFromGrantSet,
  joinInlineMetadata,
  type Equipment,
} from '@rpg/contracts'

import { equipmentArmorRole, equipmentEntryBaseName } from './equipment/monster-equipment-labels'
import { coerceCreatureWeaponProficienciesForForm } from './creature-details/monster-weapon-proficiencies-form.lib'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from './actions/monster-action-equipment-references'
import { monsterBodyArmorIgnoredMessage } from './monster-form-labels'
import type { MonsterActionDraftRow } from './actions/monster-action-presets'
import type { MonsterFormValues } from './monster-form-values'

export type MonsterFormAdvisory = {
  code: 'weapon-not-equipped' | 'weapon-not-proficient' | 'body-armor-ignored'
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

export function collectMonsterFormAdvisories(
  values: MonsterFormValues,
  equipmentById: ReadonlyMap<string, Equipment>,
): MonsterFormAdvisory[] {
  const advisories: MonsterFormAdvisory[] = []
  const kind = values.armorClass?.kind
  if (kind === 'natural' || kind === 'unarmored') {
    const bodyArmor = (values.equipment ?? []).find((entry) => {
      if (!entry.equipped) return false
      return equipmentArmorRole(equipmentById.get(entry.equipmentId)) === 'body-armor'
    })
    if (bodyArmor) {
      advisories.push({
        code: 'body-armor-ignored',
        message: monsterBodyArmorIgnoredMessage(equipmentEntryBaseName(bodyArmor, equipmentById)),
        path: 'armorClass.kind',
      })
    }
  }

  for (const section of MONSTER_ACTION_SECTIONS) {
    sectionRows(values, section).forEach((action, index) => {
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
      if (item && isWeaponEquipment(item)) {
        const proficient = isWeaponProficientFromGrantSet(
          item,
          coerceCreatureWeaponProficienciesForForm(values.proficiencies?.weapons),
        )
        if (!proficient) {
          advisories.push({
            code: 'weapon-not-proficient',
            message: joinInlineMetadata(['Not proficient', 'PB not included']),
            path,
          })
        }
      }
    })
  }

  return advisories
}
