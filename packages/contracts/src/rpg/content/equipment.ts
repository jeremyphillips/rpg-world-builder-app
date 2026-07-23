import { z } from 'zod'

import { massSchema, speedRateSchema, weightSchema } from '../primitives/units'
import { diceSchema } from '../primitives/dice'
import { abilitySchema, abilityScoreSchema } from '../vocab/ability'
import { armorCategorySchema } from '../vocab/armor/category'
import { armorMaterialSchema } from '../vocab/armor/material'
import { gearKindSchema } from '../vocab/equipment/gear-kind'
import { holySymbolUsageSchema } from '../vocab/equipment/holy-symbol-usage'
import { spellcastingGearKindSchema } from '../vocab/equipment/spellcasting-gear-kind'
import { toolCategorySchema } from '../vocab/equipment/tool-category'
import {
  weaponCategorySchema,
  weaponMasterySchema,
  weaponModeSchema,
  weaponPropertySchema,
} from '../vocab/weapon'
import { EQUIPMENT_KINDS } from '../vocab/equipment/kind'
import { formatUnionBranchDescription } from '../vocab/enum-schema'
import { serviceCategorySchema } from '../vocab/equipment/service-category'
import { serviceDurationSchema } from '../vocab/equipment/service-duration'
import { vehicleCategorySchema } from '../vocab/equipment/vehicle-category'
import { magicItemCategorySchema } from '../vocab/magic-item/category'
import { magicItemRaritySchema } from '../vocab/magic-item/rarity'
import { contentMetaSchema, contentPatchBaseSchema, slugSchema } from './lib/envelope'
import { EQUIPMENT_CONTENT_TYPE_TERM } from './lib/content-type-terms'
import { draftAuthoredContentBodySchema } from './lib/draft-authored-content'
import { createDraftInputSchema } from './lib/content-input-schemas'
import { equipmentBaseSchema } from './equipment/base'
import {
  adventuringGearEquipmentKindFields,
  refineAdventuringGearEquipment,
} from './equipment/adventuring-gear-variant'
import { armorEquipmentKindFields, refineArmorEquipment } from './equipment/armor-variant'
import { toolEquipmentKindFields, toolUtilizeActionSchema } from './equipment/tool-variant'
import {
  refineWeaponEquipment,
  weaponDamageSchema,
  weaponDamageTypeSchema,
  weaponEquipmentKindFields,
  weaponRangeSchema,
} from './equipment/weapon-variant'

// Re-export weapon/armor helpers and damage schemas for consumers.
export {
  averageWeaponDamage,
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

export { canPurchaseEquipment } from './equipment/can-purchase-equipment'

export { formatEquipmentCostLabel } from './equipment/format-equipment-cost-label'

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
  SPELLCASTING_FOCUS_GEAR_KINDS,
  spellcastingFocusGearKindSchema,
  spellcastingFocusModifierSchema,
  type EquipmentModifier,
  type EquipmentModifierKind,
  type SpellcastingFocusGearKind,
  type SpellcastingFocusModifier,
} from './equipment/modifier'

export {
  getEquipmentSpellcastingGearKind,
  type AdventuringGearEquipmentKindFields,
} from './equipment/adventuring-gear-variant'

export {
  getSpellcastingGearKindEntry,
  getSpellcastingGearKindLabel,
  isSpellcastingFocusGearKind,
  isSpellcastingGearKind,
  SPELLCASTING_GEAR_KIND_ENTRIES,
  SPELLCASTING_GEAR_KINDS,
  spellcastingGearKindSchema,
  type SpellcastingGearKind,
} from '../vocab/equipment/spellcasting-gear-kind'

export {
  EQUIPMENT_KIND_ENTRIES,
  EQUIPMENT_KIND_LABELS,
  EQUIPMENT_KINDS,
  equipmentKindSchema,
  getEquipmentKindEntry,
  getEquipmentKindLabel,
  type EquipmentKind,
} from '../vocab/equipment/kind'

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
export const equipmentBodySchema = z
  .discriminatedUnion('kind', [...equipmentBodyVariants])
  .describe(formatUnionBranchDescription('kind', [...EQUIPMENT_KINDS]))

export type EquipmentBody = z.infer<typeof equipmentBodySchema>

/** Stored shape = ownership envelope + body, per variant. */
export const equipmentSchema = z
  .discriminatedUnion('kind', [
    contentMetaSchema.extend(weaponEquipmentBodyFields.shape).superRefine(refineWeaponEquipment),
    contentMetaSchema.extend(armorEquipmentBodyFields.shape).superRefine(refineArmorEquipment),
    contentMetaSchema.extend(adventuringGearBodySchema.shape),
    contentMetaSchema.extend(toolEquipmentBodyFields.shape),
    contentMetaSchema.extend(mountBodySchema.shape),
    contentMetaSchema.extend(vehicleBodySchema.shape),
    contentMetaSchema.extend(serviceBodySchema.shape),
    contentMetaSchema.extend(magicItemBodySchema.shape),
  ])
  .describe(formatUnionBranchDescription('kind', [...EQUIPMENT_KINDS]))

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

// ---------------------------------------------------------------------------
// Draft body variants — relaxed fields, no publish-only superRefine hooks
// ---------------------------------------------------------------------------

const equipmentBaseDraftSchema = draftAuthoredContentBodySchema(
  EQUIPMENT_CONTENT_TYPE_TERM.label,
).extend({
  cost: equipmentBaseSchema.shape.cost.optional(),
  weight: weightSchema.optional(),
  tags: z.array(z.string()).optional(),
})

const weaponEquipmentBodyDraftFields = equipmentBaseDraftSchema.extend({
  kind: z.literal('weapon'),
  category: weaponCategorySchema.optional(),
  mode: weaponModeSchema.optional(),
  damage: weaponDamageSchema.optional(),
  damageType: weaponDamageTypeSchema.optional(),
  versatileDamage: diceSchema.optional(),
  properties: z.array(weaponPropertySchema).optional(),
  mastery: weaponMasterySchema.optional(),
  range: weaponRangeSchema.optional(),
  specialRules: z.string().optional(),
})

const armorEquipmentBodyDraftFields = equipmentBaseDraftSchema.extend({
  kind: z.literal('armor'),
  category: armorCategorySchema.optional(),
  material: armorMaterialSchema.optional(),
  baseAc: z.number().int().optional(),
  acBonus: z.number().int().optional(),
  addDexModifier: z.boolean().optional(),
  maxDexBonus: z.number().int().optional(),
  stealthDisadvantage: z.boolean().optional(),
  strengthRequirement: abilityScoreSchema.optional(),
})

const adventuringGearEquipmentBodyDraftFields = equipmentBaseDraftSchema.extend({
  kind: z.literal('adventuring_gear'),
  gearKind: gearKindSchema.optional(),
  spellcastingGearKind: spellcastingGearKindSchema.optional(),
  bundleSize: z.number().int().min(1).optional(),
  storage: z.string().optional(),
  properties: z.array(z.string()).optional(),
  capacity: z.string().optional(),
  holySymbolUsage: z.array(holySymbolUsageSchema).min(1).optional(),
  alsoWeaponSlug: slugSchema.optional(),
})

const toolEquipmentBodyDraftFields = equipmentBaseDraftSchema.extend({
  kind: z.literal('tool'),
  toolCategory: toolCategorySchema.optional(),
  ability: abilitySchema.optional(),
  utilizes: z.array(toolUtilizeActionSchema).optional(),
  crafts: z.array(z.string().min(1)).optional(),
})

const mountEquipmentBodyDraftFields = equipmentBaseDraftSchema.extend({
  kind: z.literal('mount'),
  carryingCapacity: massSchema.optional(),
  speed: speedRateSchema.optional(),
})

const vehicleEquipmentBodyDraftFields = equipmentBaseDraftSchema.extend({
  kind: z.literal('vehicle'),
  vehicleCategory: vehicleCategorySchema.optional(),
  speed: speedRateSchema.optional(),
  cargoCapacity: massSchema.optional(),
  crew: z.number().int().min(0).optional(),
  passengers: z.number().int().min(0).optional(),
  ac: z.number().int().min(0).optional(),
  hp: z.number().int().min(0).optional(),
  damageThreshold: z.number().int().min(0).optional(),
})

const serviceEquipmentBodyDraftFields = equipmentBaseDraftSchema
  .omit({ weight: true })
  .extend({
    kind: z.literal('service'),
    serviceCategory: serviceCategorySchema.optional(),
    duration: serviceDurationSchema.optional(),
    notes: z.string().optional(),
  })
  .strict()

const magicItemEquipmentBodyDraftFields = equipmentBaseDraftSchema.extend({
  kind: z.literal('magic_item'),
  rarity: magicItemRaritySchema.optional(),
  requiresAttunement: z.boolean().optional(),
  attunementRequirement: z.string().optional(),
  magicItemCategory: magicItemCategorySchema.optional(),
  baseEquipmentId: z.string().optional(),
})

export const weaponBodyDraftSchema = weaponEquipmentBodyDraftFields
export const armorBodyDraftSchema = armorEquipmentBodyDraftFields
export const adventuringGearBodyDraftSchema = adventuringGearEquipmentBodyDraftFields
export const toolBodyDraftSchema = toolEquipmentBodyDraftFields
export const mountBodyDraftSchema = mountEquipmentBodyDraftFields
export const vehicleBodyDraftSchema = vehicleEquipmentBodyDraftFields
export const serviceBodyDraftSchema = serviceEquipmentBodyDraftFields
export const magicItemBodyDraftSchema = magicItemEquipmentBodyDraftFields

const equipmentBodyDraftVariants = [
  weaponBodyDraftSchema,
  armorBodyDraftSchema,
  adventuringGearBodyDraftSchema,
  toolBodyDraftSchema,
  mountBodyDraftSchema,
  vehicleBodyDraftSchema,
  serviceBodyDraftSchema,
  magicItemBodyDraftSchema,
] as const

export const equipmentBodyDraftSchema = z
  .discriminatedUnion('kind', [...equipmentBodyDraftVariants])
  .describe(formatUnionBranchDescription('kind', [...EQUIPMENT_KINDS]))

export type EquipmentBodyDraft = z.infer<typeof equipmentBodyDraftSchema>

export const equipmentDraftStoredSchema = z
  .discriminatedUnion('kind', [
    contentMetaSchema.extend(weaponEquipmentBodyDraftFields.shape),
    contentMetaSchema.extend(armorEquipmentBodyDraftFields.shape),
    contentMetaSchema.extend(adventuringGearEquipmentBodyDraftFields.shape),
    contentMetaSchema.extend(toolEquipmentBodyDraftFields.shape),
    contentMetaSchema.extend(mountEquipmentBodyDraftFields.shape),
    contentMetaSchema.extend(vehicleEquipmentBodyDraftFields.shape),
    contentMetaSchema.extend(serviceEquipmentBodyDraftFields.shape),
    contentMetaSchema.extend(magicItemEquipmentBodyDraftFields.shape),
  ])
  .describe(formatUnionBranchDescription('kind', [...EQUIPMENT_KINDS]))

export type EquipmentDraft = z.infer<typeof equipmentDraftStoredSchema>

export const createEquipmentDraftInputSchema = z.discriminatedUnion('kind', [
  createDraftInputSchema(weaponEquipmentBodyDraftFields),
  createDraftInputSchema(armorEquipmentBodyDraftFields),
  createDraftInputSchema(adventuringGearEquipmentBodyDraftFields),
  createDraftInputSchema(toolEquipmentBodyDraftFields),
  createDraftInputSchema(mountEquipmentBodyDraftFields),
  createDraftInputSchema(vehicleEquipmentBodyDraftFields),
  createDraftInputSchema(serviceEquipmentBodyDraftFields),
  createDraftInputSchema(magicItemEquipmentBodyDraftFields),
])

export type CreateEquipmentDraftInput = z.infer<typeof createEquipmentDraftInputSchema>

export const updateEquipmentDraftInputSchema = z.discriminatedUnion('kind', [
  weaponEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: weaponEquipmentKindFields.kind }),
  armorEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: armorEquipmentKindFields.kind }),
  adventuringGearEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: adventuringGearEquipmentKindFields.kind }),
  toolEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: toolBodySchema.shape.kind }),
  mountEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: mountBodySchema.shape.kind }),
  vehicleEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: vehicleBodySchema.shape.kind }),
  serviceEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: serviceBodySchema.shape.kind }),
  magicItemEquipmentBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: magicItemBodySchema.shape.kind }),
])

export type UpdateEquipmentDraftInput = z.infer<typeof updateEquipmentDraftInputSchema>

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

export { isEquipmentStackable } from './equipment/stackable'
