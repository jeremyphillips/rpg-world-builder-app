import { z } from 'zod'

import { weightSchema } from '../primitives/units'
import { abilitySchema } from '../vocab/ability'
import { gearKindSchema } from '../vocab/equipment/gear-kind'
import { serviceCategorySchema } from '../vocab/equipment/service-category'
import { toolCategorySchema } from '../vocab/equipment/tool-category'
import { vehicleCategorySchema } from '../vocab/equipment/vehicle-category'
import { magicItemCategorySchema } from '../vocab/magic-item/category'
import { magicItemRaritySchema } from '../vocab/magic-item/rarity'
import { contentMetaSchema, contentPatchBaseSchema, slugSchema } from './envelope'
import { equipmentBaseSchema } from './equipment/base'
import { armorEquipmentKindFields, refineArmorEquipment } from './equipment/armor-variant'
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
  ARMOR_MATERIALS,
  armorMaterialSchema,
  getArmorAcDisplay,
  getArmorMaterialEntry,
  getArmorMaterialLabel,
  type ArmorMaterial,
} from './equipment/armor-variant'

export { equipmentBaseSchema, type EquipmentBaseFields } from './equipment/base'

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

export const EQUIPMENT_KIND_LABELS = {
  weapon: 'Weapon',
  armor: 'Armor',
  adventuring_gear: 'Adventuring Gear',
  tool: 'Tool',
  mount: 'Mount',
  vehicle: 'Vehicle',
  service: 'Service',
  magic_item: 'Magic Item',
} as const

export type EquipmentKind = keyof typeof EQUIPMENT_KIND_LABELS

export const EQUIPMENT_KINDS = Object.keys(EQUIPMENT_KIND_LABELS) as [
  EquipmentKind,
  ...EquipmentKind[],
]

/** Returns the display name for an equipment kind. Falls back to the raw value. */
export function getEquipmentKindLabel(kind: string): string {
  return EQUIPMENT_KIND_LABELS[kind as EquipmentKind] ?? kind
}

// ---------------------------------------------------------------------------
// Per-kind body variants
// ---------------------------------------------------------------------------

const weaponEquipmentBodyFields = equipmentBaseSchema.extend(weaponEquipmentKindFields)
const armorEquipmentBodyFields = equipmentBaseSchema.extend(armorEquipmentKindFields)

export const weaponBodySchema = weaponEquipmentBodyFields.superRefine(refineWeaponEquipment)
export const armorBodySchema = armorEquipmentBodyFields.superRefine(refineArmorEquipment)

export const adventuringGearBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('adventuring_gear'),
  gearKind: gearKindSchema,
  /** How many units the listed cost/weight buys (e.g. 20 arrows). */
  bundleSize: z.number().int().min(1).optional(),
  /** The container a bundle ships in (e.g. "Quiver", "Case"). */
  storage: z.string().optional(),
  /** Open-ended mechanical notes (e.g. "burst DC 13", "1-hour duration"). */
  properties: z.array(z.string()).optional(),
  /** Storage capacity, free text (e.g. "1 cubic foot / 30 lb of gear"). */
  capacity: z.string().optional(),
})

export const toolBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('tool'),
  toolCategory: toolCategorySchema,
  /** The ability a check with this tool typically uses. */
  ability: abilitySchema.optional(),
})

export const mountBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('mount'),
  carryingCapacity: weightSchema,
  /** Movement speed, free text (e.g. "60 ft."). */
  speed: z.string().optional(),
})

export const vehicleBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('vehicle'),
  vehicleCategory: vehicleCategorySchema,
  /** Movement speed, free text (e.g. "8 mph"). */
  speed: z.string().optional(),
  /** Carrying/cargo capacity for land and drawn vehicles. */
  capacity: weightSchema.optional(),
  crew: z.number().int().min(0).optional(),
  passengers: z.number().int().min(0).optional(),
  cargoTons: z.number().min(0).optional(),
  ac: z.number().int().min(0).optional(),
  hp: z.number().int().min(0).optional(),
  damageThreshold: z.number().int().min(0).optional(),
})

export const serviceBodySchema = equipmentBaseSchema
  .omit({ weight: true })
  .extend({
    kind: z.literal('service'),
    serviceCategory: serviceCategorySchema,
    /** Billing cadence, free text (e.g. "per day", "per mile"). */
    duration: z.string().optional(),
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
  contentMetaSchema.extend(toolBodySchema.shape),
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
  adventuringGearBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: adventuringGearBodySchema.shape.kind }),
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
    adventuringGearBodySchema.partial().extend({ kind: adventuringGearBodySchema.shape.kind }),
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

/** @deprecated Use {@link WeaponEquipment} or `Equipment` narrowed by `kind: 'weapon'`. */
export type Weapon = WeaponEquipment

/** @deprecated Use {@link ArmorEquipment} or `Equipment` narrowed by `kind: 'armor'`. */
export type Armor = ArmorEquipment

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
