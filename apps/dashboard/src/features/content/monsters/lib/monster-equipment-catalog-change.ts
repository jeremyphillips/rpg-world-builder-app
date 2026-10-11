import { isArmorEquipment, isWeaponEquipment, type Equipment } from '@rpg/contracts'

import {
  findActionsReferencingEntry,
  type MonsterEquipmentActionReference,
} from './monster-equipment-references'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from './monster-form-values'

export type EquipmentCatalogChangePlan =
  | {
      outcome: 'apply'
      entry: MonsterEquipmentFormEntry
      /** Set when weapon actions keep this row and now resolve to a different item. */
      retarget?: { nextName: string; actionNames: string[] }
    }
  | {
      outcome: 'confirm'
      reason: 'remove-actions' | 'clear-adjustment'
      entry: MonsterEquipmentFormEntry
      references: MonsterEquipmentActionReference[]
    }

function armorClassModifier(entry: MonsterEquipmentFormEntry) {
  return entry.modifiers?.find((modifier) => modifier.kind === 'armor_class')
}

function withoutArmorClassModifier(entry: MonsterEquipmentFormEntry): MonsterEquipmentFormEntry {
  return {
    ...entry,
    modifiers: entry.modifiers?.filter((modifier) => modifier.kind !== 'armor_class'),
  }
}

/**
 * Plans a catalog-item edit on an existing equipment row.
 * `entryId`, quantity, and custom text stay. Confirmations cover weapon-action
 * removal and an armor-class adjustment that the next item cannot keep.
 */
export function planEquipmentCatalogChange(
  values: MonsterFormValues,
  entry: MonsterEquipmentFormEntry,
  nextItem: Equipment | undefined,
  nextName: string,
): EquipmentCatalogChangePlan {
  const references = findActionsReferencingEntry(values, entry.entryId)
  const next: MonsterEquipmentFormEntry = {
    ...entry,
    equipmentId: nextItem?.id ?? entry.equipmentId,
  }
  const nextIsWeapon = nextItem ? isWeaponEquipment(nextItem) : false
  const nextIsArmor = nextItem ? isArmorEquipment(nextItem) : false

  if (references.length > 0 && !nextIsWeapon) {
    return { outcome: 'confirm', reason: 'remove-actions', entry: next, references }
  }

  if (armorClassModifier(entry) && !nextIsArmor) {
    return {
      outcome: 'confirm',
      reason: 'clear-adjustment',
      entry: withoutArmorClassModifier(next),
      references: [],
    }
  }

  return applyCatalogChange(next, nextIsArmor, references, nextIsWeapon, nextName)
}

function applyCatalogChange(
  next: MonsterEquipmentFormEntry,
  nextIsArmor: boolean,
  references: MonsterEquipmentActionReference[],
  nextIsWeapon: boolean,
  nextName: string,
): EquipmentCatalogChangePlan {
  const entry = nextIsArmor ? next : withoutArmorClassModifier(next)
  if (references.length === 0 || !nextIsWeapon) return { outcome: 'apply', entry }
  return {
    outcome: 'apply',
    entry,
    retarget: {
      nextName,
      actionNames: references.map((reference) => reference.name ?? reference.id),
    },
  }
}
