import { z } from 'zod'

import { coinWealthSchema, type CoinWealth } from '../../primitives/wealth'
import type { ArmorEquipment, Equipment } from '../../content/equipment'
import { isArmorEquipment } from '../../content/equipment'
import type { CharacterWealthGrant } from '../../content/lib/wealth-grant'
import { equipmentModifierSchema } from '../../content/equipment/modifier'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { characterSelectionSourcesSchema } from './selection-sources'

// ---------------------------------------------------------------------------
// Equipment, wealth, and feats
// ---------------------------------------------------------------------------

export const characterEquipmentEntrySchema = z.object({
  /** Optional stable row id for duplicate or customized copies of the same item. */
  entryId: z.string().min(1).optional(),
  equipmentId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  attuned: z.boolean().optional(),
  customName: z.string().min(1).optional(),
  modifiers: z.array(equipmentModifierSchema).optional(),
  sources: characterSelectionSourcesSchema,
  notes: z.string().optional(),
})

export type CharacterEquipmentEntry = z.infer<typeof characterEquipmentEntrySchema>

export const characterEquipmentSchema = z.object({
  weapons: z.array(characterEquipmentEntrySchema).default([]),
  armor: z.array(characterEquipmentEntrySchema).default([]),
  tools: z.array(characterEquipmentEntrySchema).default([]),
  gear: z.array(characterEquipmentEntrySchema).default([]),
  magicItems: z.array(characterEquipmentEntrySchema).default([]),
  vehicles: z.array(characterEquipmentEntrySchema).default([]),
  mounts: z.array(characterEquipmentEntrySchema).default([]),
})

export type CharacterEquipment = z.infer<typeof characterEquipmentSchema>

export const EMPTY_CHARACTER_EQUIPMENT: CharacterEquipment = {
  weapons: [],
  armor: [],
  tools: [],
  gear: [],
  magicItems: [],
  vehicles: [],
  mounts: [],
}

type EquipmentInventoryBucket = keyof CharacterEquipment

const EQUIPMENT_KIND_TO_BUCKET = {
  weapon: 'weapons',
  armor: 'armor',
  tool: 'tools',
  adventuring_gear: 'gear',
  magic_item: 'magicItems',
  vehicle: 'vehicles',
  mount: 'mounts',
  service: 'gear',
} as const satisfies Record<Equipment['kind'], EquipmentInventoryBucket>

/** Appends an equipment entry to the inventory bucket matching the catalog row kind. */
export function appendEquipmentEntry(
  inventory: CharacterEquipment,
  equipment: Equipment,
  entry: CharacterEquipmentEntry,
): CharacterEquipment {
  const bucket = EQUIPMENT_KIND_TO_BUCKET[equipment.kind]
  return {
    ...inventory,
    [bucket]: [...inventory[bucket], entry],
  }
}

/** Maps a wealth grant to the stored character wealth shape. */
export function characterWealthFromGrant(grant: CharacterWealthGrant | undefined): CharacterWealth {
  return {
    cp: grant?.cp ?? 0,
    sp: grant?.sp ?? 0,
    gp: grant?.gp ?? 0,
    pp: grant?.pp ?? 0,
  }
}

/** Returns equipped armor catalog rows referenced by the character inventory. */
export function resolveEquippedArmorFromInventory(args: {
  equipment: CharacterEquipment
  catalog: CreatureEquipmentCatalog
}): ArmorEquipment[] {
  return args.equipment.armor.flatMap((entry) => {
    if (!entry.equipped) return []
    const item = args.catalog.get(entry.equipmentId)
    return item && isArmorEquipment(item) ? [item] : []
  })
}

export const characterWealthSchema = coinWealthSchema

export type CharacterWealth = CoinWealth

export const characterFeatEntrySchema = z.object({
  featId: z.string().min(1),
  sources: characterSelectionSourcesSchema,
  choices: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
})

export type CharacterFeatEntry = z.infer<typeof characterFeatEntrySchema>
