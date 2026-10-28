import {
  creatureWeaponProficienciesSchema,
  creatureWeaponProficiencyTargetsFromGrantSet,
} from '@rpg/contracts'

import {
  applyLoadoutWeaponMatchSignals,
  buildLoadoutEquipmentPickerItems,
} from '@/features/content'
import { enrichEquipmentPickerItemsWithSearchDocument } from '@/features/character'
import { resolveLoadoutEquipmentIsProficient } from '../../../equipment/lib/loadout/equipment-loadout-picker.lib'
import { weaponProficiencyGrantSetFromMode } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import {
  coerceCreatureWeaponProficienciesForForm,
  MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
} from '../creature-details/monster-weapon-proficiencies-form.lib'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../monster-form-values'

type LoadoutReferenceOptions = Parameters<typeof buildLoadoutEquipmentPickerItems>[0]

export function resolveMonsterFormWeaponGrants(values: MonsterFormValues | undefined) {
  const raw = coerceCreatureWeaponProficienciesForForm(values?.proficiencies?.weapons)
  return creatureWeaponProficienciesSchema.parse(
    weaponProficiencyGrantSetFromMode(
      values?.weaponProficiencyMode ?? MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
      raw,
    ),
  )
}

export function buildMonsterLoadoutPickerItems(input: {
  referenceOptions: LoadoutReferenceOptions
  weaponGrants: ReturnType<typeof resolveMonsterFormWeaponGrants>
  equipment: readonly MonsterEquipmentFormEntry[]
}): ReturnType<typeof enrichEquipmentPickerItemsWithSearchDocument> {
  return enrichEquipmentPickerItemsWithSearchDocument(
    applyLoadoutWeaponMatchSignals({
      items: buildLoadoutEquipmentPickerItems(input.referenceOptions, {
        resolveIsProficient: (equipmentRow) =>
          resolveLoadoutEquipmentIsProficient(equipmentRow, input.weaponGrants),
      }),
      targets: creatureWeaponProficiencyTargetsFromGrantSet(input.weaponGrants),
      inventory: input.equipment.map((entry) => ({
        equipmentId: entry.equipmentId,
        quantity: entry.quantity ?? 1,
        equipped: entry.equipped === true,
      })),
    }),
  )
}
