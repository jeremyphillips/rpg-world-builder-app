import { z } from 'zod'

import { coinWealthSchema, type CoinWealth } from '../../../primitives/wealth'
import type { Equipment } from '../../../content/equipment'
import { isArmorEquipment } from '../../../content/equipment'
import {
  equipmentInstanceSchemaBase,
  type EquipmentInstance,
} from '../../../content/equipment/instance/instance'
import { normalizeEquipmentInstance } from '../../../content/equipment/instance/normalize-equipment-instance'
import { refineEquipmentInstanceInvariants } from '../../../content/equipment/instance/instance-invariants'
import type { CharacterWealthGrant } from '../../../content/lib/grants/wealth-grant'
import type { EquipmentKind } from '../../../vocab/equipment/kind'
import type { CreatureEquipmentCatalog } from '../../creature/equipment'
import { toEquippedArmorPieceForEntry, type EquippedArmorPiece } from '../../creature/armor-class'
import type { MagicPropertyDefinitionProvider } from '../../../content/equipment/instance/magic-property'
import { characterSelectionSourcesSchema } from './selection-sources'

// ---------------------------------------------------------------------------
// Equipment, wealth, and feats
// ---------------------------------------------------------------------------

const characterEquipmentEntrySchemaParsed = equipmentInstanceSchemaBase
  .extend({
    attuned: z.boolean().optional(),
    sources: characterSelectionSourcesSchema,
    notes: z.string().optional(),
  })
  .superRefine((entry, ctx) => refineEquipmentInstanceInvariants(entry, ctx))

export const characterEquipmentEntrySchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object') return value
  return normalizeEquipmentInstance(value as EquipmentInstance)
}, characterEquipmentEntrySchemaParsed)

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

/** Keys on `character.equipment` where inventory entries are stored. */
export type CharacterEquipmentInventoryBucket = keyof CharacterEquipment

/** Iterable inventory bucket keys — keep in sync with `characterEquipmentSchema`. */
export const CHARACTER_EQUIPMENT_INVENTORY_BUCKETS = [
  'weapons',
  'armor',
  'tools',
  'gear',
  'magicItems',
  'vehicles',
  'mounts',
] as const satisfies readonly CharacterEquipmentInventoryBucket[]

/** Maps catalog equipment kind to the persisted character inventory bucket. */
export const EQUIPMENT_KIND_TO_INVENTORY_BUCKET = {
  weapon: 'weapons',
  armor: 'armor',
  tool: 'tools',
  adventuring_gear: 'gear',
  magic_item: 'magicItems',
  vehicle: 'vehicles',
  mount: 'mounts',
  service: 'gear',
} as const satisfies Record<EquipmentKind, CharacterEquipmentInventoryBucket>

/** Returns the inventory bucket for a catalog equipment kind. */
export function inventoryBucketForEquipmentKind(
  kind: EquipmentKind,
): CharacterEquipmentInventoryBucket {
  return EQUIPMENT_KIND_TO_INVENTORY_BUCKET[kind]
}

/** Returns the inventory bucket for a resolved catalog equipment row. */
export function inventoryBucketForEquipment(
  equipment: Equipment,
): CharacterEquipmentInventoryBucket {
  return inventoryBucketForEquipmentKind(equipment.kind)
}

/** Mongo `$or` branches for character docs referencing an equipment catalog id. */
export function equipmentInventoryUsageMongoOrClauses(contentId: string): Record<string, string>[] {
  return CHARACTER_EQUIPMENT_INVENTORY_BUCKETS.map((bucket) => ({
    [`equipment.${bucket}.equipmentId`]: contentId,
  }))
}

/** Appends an equipment entry to the inventory bucket matching the catalog row kind. */
export function appendEquipmentEntry(
  inventory: CharacterEquipment,
  equipment: Equipment,
  entry: CharacterEquipmentEntry,
): CharacterEquipment {
  const bucket = inventoryBucketForEquipment(equipment)
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

export type EquippedArmorResolution = {
  pieces: EquippedArmorPiece[]
  /** Equipped armor-bucket entries whose catalog item is missing or not armor. */
  unresolvedEntryIds: string[]
}

/** Returns equipped armor catalog rows referenced by the character inventory. */
const EMPTY_MAGIC_PROPERTY_PROVIDER: MagicPropertyDefinitionProvider = () => undefined

export function resolveEquippedArmorFromInventory(args: {
  equipment: CharacterEquipment
  catalog: CreatureEquipmentCatalog
  magicPropertyProvider?: MagicPropertyDefinitionProvider
}): EquippedArmorResolution {
  const provider = args.magicPropertyProvider ?? EMPTY_MAGIC_PROPERTY_PROVIDER
  const pieces: EquippedArmorPiece[] = []
  const unresolvedEntryIds: string[] = []

  for (const entry of args.equipment.armor) {
    if (!entry.equipped) continue
    const item = args.catalog.get(entry.equipmentId)
    if (!item || !isArmorEquipment(item)) {
      unresolvedEntryIds.push(entry.entryId ?? entry.equipmentId)
      continue
    }
    pieces.push(toEquippedArmorPieceForEntry(item, entry, item, provider))
  }

  return { pieces, unresolvedEntryIds }
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
