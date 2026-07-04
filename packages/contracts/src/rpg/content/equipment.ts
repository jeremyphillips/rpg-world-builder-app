import { z } from 'zod'

import { massSchema, speedRateSchema } from '../primitives/units'
import type { GameTermEntry } from '../vocab/types'
import { serviceCategorySchema } from '../vocab/equipment/service-category'
import { serviceDurationSchema } from '../vocab/equipment/service-duration'
import { vehicleCategorySchema } from '../vocab/equipment/vehicle-category'
import { magicItemCategorySchema } from '../vocab/magic-item/category'
import { magicItemRaritySchema } from '../vocab/magic-item/rarity'
import { contentMetaSchema, contentPatchBaseSchema, slugSchema } from './lib/envelope'
import { equipmentBaseSchema } from './equipment/base'
import {
  adventuringGearEquipmentKindFields,
  refineAdventuringGearEquipment,
} from './equipment/adventuring-gear-variant'
import { armorEquipmentKindFields, refineArmorEquipment } from './equipment/armor-variant'
import { toolEquipmentKindFields } from './equipment/tool-variant'
import { refineWeaponEquipment, weaponEquipmentKindFields } from './equipment/weapon-variant'

// Re-export weapon/armor helpers and damage schemas for consumers.
export {
  averageWeaponDamage,
  diceDamageSchema,
  flatDamageSchema,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponRange,
  weaponDamageSchema,
  weaponDamageTypeSchema,
  weaponRangeSchema,
  type WeaponDamage,
  type WeaponDamageType,
  type WeaponRange,
} from './equipment/weapon-variant'

export {
  formatToolUtilizeAction,
  formatToolUtilizes,
  toolUtilizeActionSchema,
  type ToolUtilizeAction,
} from './equipment/tool-variant'

export {
  ARMOR_MATERIALS,
  armorMaterialSchema,
  getArmorAcDisplay,
  getArmorMaterialEntry,
  getArmorMaterialLabel,
  type ArmorMaterial,
} from './equipment/armor-variant'

export {
  isMagicItemBaseEquipment,
  isMagicItemBaseEquipmentKind,
  MAGIC_ITEM_BASE_EQUIPMENT_KINDS,
  type MagicItemBaseEquipmentKind,
} from './equipment/magic-item-base-equipment'

export { equipmentBaseSchema, type EquipmentBaseFields } from './equipment/base'

export { equipmentVariantValidationMessages } from './equipment/equipment-variant-messages'

export {
  formatHolySymbolUsage,
  getHolySymbolUsageLabel,
  HOLY_SYMBOL_USAGE_ENTRIES,
  HOLY_SYMBOL_USAGES,
  holySymbolUsageSchema,
  type HolySymbolUsage,
} from '../vocab/equipment/holy-symbol-usage'

export {
  EQUIPMENT_MODIFIER_KINDS,
  equipmentModifierKindSchema,
  equipmentModifierSchema,
  isSpellcastingFocusGearKind,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  spellcastingFocusGearKindSchema,
  spellcastingFocusModifierSchema,
  type EquipmentModifier,
  type EquipmentModifierKind,
  type SpellcastingFocusGearKind,
  type SpellcastingFocusModifier,
} from './equipment/modifier'

// ---------------------------------------------------------------------------
// Equipment — unified catalog content type discriminated by `kind`. Weapons,
// armor, adventuring gear, tools, mounts, vehicles, services, and magic items
// are union variants of a single registry entry. New item kinds cost a new
// union variant, never a new content type — that is what keeps the catalog
// from blowing up.
//
// The four derived schemas (stored, create, update, patch) are spelled out as
// explicit array literals: mapping a transform over the variants would collapse
// the discriminant through `.extend` and lose per-kind narrowing.
// ---------------------------------------------------------------------------

export const EQUIPMENT_KIND_ENTRIES = {
  weapon: {
    label: 'Weapon',
    description: 'A weapon item such as a sword, bow, or thrown weapon.',
  },
  armor: {
    label: 'Armor',
    description: 'Armor or a shield used for protection.',
  },
  adventuring_gear: {
    label: 'Adventuring Gear',
    description: 'General equipment used while adventuring.',
    sentence: {
      singular: 'piece of adventuring gear',
      plural: 'pieces of adventuring gear',
    },
  },
  tool: {
    label: 'Tool',
    description: 'A tool set, kit, game set, or musical instrument.',
  },
  mount: {
    label: 'Mount',
    description: 'A rideable animal or similar mount.',
  },
  vehicle: {
    label: 'Vehicle',
    description: 'A land or water vehicle.',
  },
  service: {
    label: 'Service',
    description: 'A purchasable service.',
  },
  magic_item: {
    label: 'Magic Item',
    description: 'A magical item such as a potion, scroll, or wondrous item.',
  },
} as const satisfies Record<string, GameTermEntry>

export const EQUIPMENT_KIND_LABELS = Object.fromEntries(
  Object.entries(EQUIPMENT_KIND_ENTRIES).map(([kind, entry]) => [kind, entry.label]),
) as {
  readonly [Kind in keyof typeof EQUIPMENT_KIND_ENTRIES]: (typeof EQUIPMENT_KIND_ENTRIES)[Kind]['label']
}

export type EquipmentKind = keyof typeof EQUIPMENT_KIND_LABELS

export const EQUIPMENT_KINDS = Object.keys(EQUIPMENT_KIND_LABELS) as [
  EquipmentKind,
  ...EquipmentKind[],
]

export const equipmentKindSchema = z.enum(EQUIPMENT_KINDS)

/** Returns the display name for an equipment kind. Falls back to the raw value. */
export function getEquipmentKindLabel(kind: string): string {
  return EQUIPMENT_KIND_LABELS[kind as EquipmentKind] ?? kind
}

/** Returns the reference entry for an equipment kind, if known. */
export function getEquipmentKindEntry(kind: string): GameTermEntry | undefined {
  return EQUIPMENT_KIND_ENTRIES[kind as EquipmentKind]
}

// ---------------------------------------------------------------------------
// Per-kind body variants
// ---------------------------------------------------------------------------

const weaponEquipmentBodyFields = equipmentBaseSchema.extend(weaponEquipmentKindFields)
const armorEquipmentBodyFields = equipmentBaseSchema.extend(armorEquipmentKindFields)

export const weaponBodySchema = weaponEquipmentBodyFields.superRefine(refineWeaponEquipment)
export const armorBodySchema = armorEquipmentBodyFields.superRefine(refineArmorEquipment)

const adventuringGearEquipmentBodyFields = equipmentBaseSchema.extend(
  adventuringGearEquipmentKindFields,
)

export const adventuringGearBodySchema = adventuringGearEquipmentBodyFields.superRefine(
  refineAdventuringGearEquipment,
)

const toolEquipmentBodyFields = equipmentBaseSchema.extend(toolEquipmentKindFields)

export const toolBodySchema = toolEquipmentBodyFields

export const mountBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('mount'),
  carryingCapacity: massSchema,
  speed: speedRateSchema,
})

export const vehicleBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('vehicle'),
  vehicleCategory: vehicleCategorySchema,
  speed: speedRateSchema,
  /** Cargo capacity (SRD ships in tons; land vehicles may use lb). */
  cargoCapacity: massSchema.optional(),
  crew: z.number().int().min(0).optional(),
  passengers: z.number().int().min(0).optional(),
  ac: z.number().int().min(0).optional(),
  hp: z.number().int().min(0).optional(),
  damageThreshold: z.number().int().min(0).optional(),
})

export const serviceBodySchema = equipmentBaseSchema
  .omit({ weight: true })
  .extend({
    kind: z.literal('service'),
    serviceCategory: serviceCategorySchema,
    /** Billing cadence (e.g. 1 day, 1 mile). */
    duration: serviceDurationSchema.optional(),
    /** Free-form notes for pricing or scope. */
    notes: z.string().optional(),
  })
  .strict()

export const magicItemBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('magic_item'),
  rarity: magicItemRaritySchema.optional(),
  requiresAttunement: z.boolean().optional(),
  attunementRequirement: z.string().optional(),
  magicItemCategory: magicItemCategorySchema.optional(),
  /** Optional link to a mundane base item (weapon, armor, etc.) by content id. */
  baseEquipmentId: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Equipment — editable body + stored shape + authoring DTOs
// ---------------------------------------------------------------------------

const equipmentBodyVariants = [
  weaponBodySchema,
  armorBodySchema,
  adventuringGearBodySchema,
  toolBodySchema,
  mountBodySchema,
  vehicleBodySchema,
  serviceBodySchema,
  magicItemBodySchema,
] as const

/** The editable shape: what a form authors and what a patch overrides. */
export const equipmentBodySchema = z.discriminatedUnion('kind', [...equipmentBodyVariants])

export type EquipmentBody = z.infer<typeof equipmentBodySchema>

/** Stored shape = ownership envelope + body, per variant. */
export const equipmentSchema = z.discriminatedUnion('kind', [
  contentMetaSchema.extend(weaponEquipmentBodyFields.shape).superRefine(refineWeaponEquipment),
  contentMetaSchema.extend(armorEquipmentBodyFields.shape).superRefine(refineArmorEquipment),
  contentMetaSchema.extend(adventuringGearBodySchema.shape),
  contentMetaSchema.extend(toolEquipmentBodyFields.shape),
  contentMetaSchema.extend(mountBodySchema.shape),
  contentMetaSchema.extend(vehicleBodySchema.shape),
  contentMetaSchema.extend(serviceBodySchema.shape),
  contentMetaSchema.extend(magicItemBodySchema.shape),
])

export type Equipment = z.infer<typeof equipmentSchema>

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
export const createEquipmentInputSchema = z.discriminatedUnion('kind', [
  weaponBodySchema.extend({ slug: slugSchema }),
  armorBodySchema.extend({ slug: slugSchema }),
  adventuringGearBodySchema.extend({ slug: slugSchema }),
  toolBodySchema.extend({ slug: slugSchema }),
  mountBodySchema.extend({ slug: slugSchema }),
  vehicleBodySchema.extend({ slug: slugSchema }),
  serviceBodySchema.extend({ slug: slugSchema }),
  magicItemBodySchema.extend({ slug: slugSchema }),
])

export type CreateEquipmentInput = z.infer<typeof createEquipmentInputSchema>

export const updateEquipmentInputSchema = z.discriminatedUnion('kind', [
  weaponEquipmentBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: weaponEquipmentKindFields.kind }),
  armorEquipmentBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: armorEquipmentKindFields.kind }),
  adventuringGearEquipmentBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: adventuringGearEquipmentKindFields.kind }),
  toolBodySchema.extend({ slug: slugSchema }).partial().extend({ kind: toolBodySchema.shape.kind }),
  mountBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: mountBodySchema.shape.kind }),
  vehicleBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: vehicleBodySchema.shape.kind }),
  serviceBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: serviceBodySchema.shape.kind }),
  magicItemBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: magicItemBodySchema.shape.kind }),
])

export type UpdateEquipmentInput = z.infer<typeof updateEquipmentInputSchema>

export const equipmentPatchSchema = contentPatchBaseSchema.extend({
  patch: z.discriminatedUnion('kind', [
    weaponEquipmentBodyFields.partial().extend({ kind: weaponEquipmentKindFields.kind }),
    armorEquipmentBodyFields.partial().extend({ kind: armorEquipmentKindFields.kind }),
    adventuringGearEquipmentBodyFields
      .partial()
      .extend({ kind: adventuringGearEquipmentKindFields.kind }),
    toolBodySchema.partial().extend({ kind: toolBodySchema.shape.kind }),
    mountBodySchema.partial().extend({ kind: mountBodySchema.shape.kind }),
    vehicleBodySchema.partial().extend({ kind: vehicleBodySchema.shape.kind }),
    serviceBodySchema.partial().extend({ kind: serviceBodySchema.shape.kind }),
    magicItemBodySchema.partial().extend({ kind: magicItemBodySchema.shape.kind }),
  ]),
})

export type EquipmentPatch = z.infer<typeof equipmentPatchSchema>

// ---------------------------------------------------------------------------
// Narrow union helpers + transitional type aliases
// ---------------------------------------------------------------------------

export type WeaponEquipment = Extract<Equipment, { kind: 'weapon' }>
export type ArmorEquipment = Extract<Equipment, { kind: 'armor' }>
export type AdventuringGearEquipment = Extract<Equipment, { kind: 'adventuring_gear' }>
export type ToolEquipment = Extract<Equipment, { kind: 'tool' }>
export type MountEquipment = Extract<Equipment, { kind: 'mount' }>
export type VehicleEquipment = Extract<Equipment, { kind: 'vehicle' }>
export type ServiceEquipment = Extract<Equipment, { kind: 'service' }>
export type MagicItemEquipment = Extract<Equipment, { kind: 'magic_item' }>

export type WeaponBody = z.infer<typeof weaponBodySchema>
export type ArmorBody = z.infer<typeof armorBodySchema>

/** Returns true when an equipment record is a weapon variant. */
export function isWeaponEquipment(e: Equipment): e is WeaponEquipment {
  return e.kind === 'weapon'
}

/** Returns true when an equipment record is an armor variant. */
export function isArmorEquipment(e: Equipment): e is ArmorEquipment {
  return e.kind === 'armor'
}
