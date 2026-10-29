import type { UseFormReturn } from 'react-hook-form'
import { resolveCreatureArmorSlot, type CreatureArmorSlot, type Equipment } from '@rpg/contracts'

import {
  MONSTER_ACTION_SECTIONS,
  removeEquipmentEntryWithDependents,
} from '../actions/monster-action-equipment-references'
import type { MonsterFormValues } from '../monster-form-values'
import { replaceMonsterArmorSlotEntry } from './monster-equipment-loadout.lib'
import type { EquipmentRemovalDecision } from './resolve-equipment-removal-decision.lib'

export type ArmorSlotReplacementPlan = 'prohibited' | 'confirm' | 'apply'

/** A prohibited row blocks the slot. It is never treated as confirmable. */
export function planArmorSlotReplacement(
  decisions: readonly EquipmentRemovalDecision[],
): ArmorSlotReplacementPlan {
  if (decisions.some((decision) => decision.outcome === 'prohibited')) return 'prohibited'
  if (decisions.some((decision) => decision.outcome === 'confirm')) return 'confirm'
  return 'apply'
}

export function nextMonsterArmorSlotValues(
  values: MonsterFormValues,
  slot: CreatureArmorSlot,
  equipmentId: string,
  catalog: ReadonlyMap<string, Equipment>,
): MonsterFormValues {
  const removedIds = values.equipment
    .filter((entry) => resolveCreatureArmorSlot(catalog.get(entry.equipmentId)) === slot)
    .map((entry) => entry.entryId)
  let next = values
  for (const entryId of removedIds) {
    next = removeEquipmentEntryWithDependents(next, entryId)
  }
  return {
    ...next,
    equipment: replaceMonsterArmorSlotEntry(values.equipment, slot, equipmentId, catalog),
  }
}

/** Computes the next monster, then writes equipment and action lists together. */
export function commitMonsterArmorSlotReplacement(
  form: UseFormReturn<MonsterFormValues>,
  slot: CreatureArmorSlot,
  equipmentId: string,
  catalog: ReadonlyMap<string, Equipment>,
): void {
  const next = nextMonsterArmorSlotValues(form.getValues(), slot, equipmentId, catalog)
  form.setValue('equipment', next.equipment, { shouldDirty: true })
  for (const section of MONSTER_ACTION_SECTIONS) {
    form.setValue(section, next[section], { shouldDirty: true })
  }
}
