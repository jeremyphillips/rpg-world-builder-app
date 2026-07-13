import { z } from 'zod'
import {
  EQUIPMENT_KINDS,
  EQUIPMENT_KIND_LABELS,
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  abilitySchema,
  armorCategorySchema,
  armorMaterialSchema,
  currencySchema,
  gearKindSchema,
  holySymbolUsageSchema,
  spellcastingGearKindSchema,
  magicItemCategorySchema,
  magicItemRaritySchema,
  massUnitSchema,
  serviceCategorySchema,
  serviceDurationUnitSchema,
  speedRateUnitSchema,
  diceSchema,
  slugSchema,
  toolCategorySchema,
  toolUtilizeActionSchema,
  vehicleCategorySchema,
  weaponCategorySchema,
  weaponDamageTypeSchema,
  weaponMasterySchema,
  weaponModeSchema,
  weaponPropertySchema,
  type EquipmentKind,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { economyFields } from '../../lib/forms/fields/content-economy-form-fields'
import { identityFields } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  allRegisteredKindFieldGroups,
  fieldGroupsForEquipmentKind,
} from './shared/equipment-form-registry'

const equipmentKindSchema = z.enum(EQUIPMENT_KINDS)
const equipmentKindOptions = toOptions(EQUIPMENT_KINDS, EQUIPMENT_KIND_LABELS)

const equipmentCostFormSchema = z.object({
  amount: z.coerce.number().int().min(0),
  currency: currencySchema,
})

const equipmentWeightFormSchema = z
  .object({ value: z.coerce.number().min(0).optional(), unit: z.literal('lb') })
  .optional()

/** Identity + economy fields only — no weight, no kind discriminant. */
const equipmentIdentityEconomyFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  cost: equipmentCostFormSchema,
})

/** Physical kinds share optional weight on top of identity/economy. */
const physicalEquipmentBaseFormSchema = equipmentIdentityEconomyFormSchema.extend({
  weight: equipmentWeightFormSchema,
})

const equipmentSpeedFormSchema = z.object({
  value: z.coerce.number().min(0),
  unit: speedRateUnitSchema,
})

const equipmentMountCarryingCapacityFormSchema = z.object({
  value: z.coerce.number().min(0),
  unit: massUnitSchema,
})

// Zod strip (default): sibling-kind keys from legacy hydration or kind switches are silently removed.

/** Weapon create/edit form schema — fields match `weaponFormFieldGroup`. */
export const weaponEquipmentFormSchema = physicalEquipmentBaseFormSchema.extend({
  kind: z.literal('weapon'),
  category: weaponCategorySchema,
  mode: weaponModeSchema,
  mastery: weaponMasterySchema,
  properties: z.array(weaponPropertySchema).optional(),
  damageKind: z.enum(['dice', 'flat', 'none']).optional(),
  damageDice: diceSchema.optional(),
  damageAmount: z.coerce.number().int().min(1).optional(),
  damageType: weaponDamageTypeSchema.optional(),
  versatileDamage: diceSchema.optional(),
  rangeNormal: z.coerce.number().int().min(0).optional(),
  rangeLong: z.coerce.number().int().min(0).optional(),
  specialRules: z.string().optional(),
})

/** Armor create/edit form schema — fields match `armorFormFieldGroup`. */
export const armorEquipmentFormSchema = physicalEquipmentBaseFormSchema.extend({
  kind: z.literal('armor'),
  armorCategory: armorCategorySchema,
  material: armorMaterialSchema.optional(),
  baseAc: z.coerce.number().int().optional(),
  acBonus: z.coerce.number().int().optional(),
  addDexModifier: z.boolean().optional(),
  maxDexBonus: z.coerce.number().int().optional(),
  stealthDisadvantage: z.boolean().optional(),
  strengthRequirement: z.coerce
    .number()
    .int()
    .min(ABILITY_SCORE_MIN)
    .max(ABILITY_SCORE_MAX)
    .optional(),
})

/** Adventuring gear create/edit form schema — fields match `adventuringGearFormFieldGroup`. */
export const adventuringGearEquipmentFormSchema = physicalEquipmentBaseFormSchema.extend({
  kind: z.literal('adventuring_gear'),
  gearKind: gearKindSchema,
  spellcastingGearKind: spellcastingGearKindSchema.optional(),
  bundleSize: z.coerce.number().int().min(1).optional(),
  storage: z.string().optional(),
  propertiesText: z.string().optional(),
  capacity: z.string().optional(),
  holySymbolUsage: z.array(holySymbolUsageSchema).min(1).optional(),
  alsoWeaponSlug: slugSchema.optional(),
})

/** Tool create/edit form schema — fields match `toolFormFieldGroup`. */
export const toolEquipmentFormSchema = physicalEquipmentBaseFormSchema.extend({
  kind: z.literal('tool'),
  toolCategory: toolCategorySchema,
  ability: abilitySchema,
  utilizes: z.array(toolUtilizeActionSchema).optional(),
  craftsText: z.string().optional(),
})

/** Mount create/edit form schema — fields match `mountFormFieldGroup`. */
export const mountEquipmentFormSchema = physicalEquipmentBaseFormSchema.extend({
  kind: z.literal('mount'),
  carryingCapacity: equipmentMountCarryingCapacityFormSchema,
  speed: equipmentSpeedFormSchema,
})

/** Vehicle create/edit form schema — fields match `vehicleFormFieldGroup`. */
export const vehicleEquipmentFormSchema = physicalEquipmentBaseFormSchema.extend({
  kind: z.literal('vehicle'),
  vehicleCategory: vehicleCategorySchema,
  cargoCapacity: z
    .object({
      value: z.coerce.number().min(0).optional(),
      unit: massUnitSchema,
    })
    .optional(),
  crew: z.coerce.number().int().min(0).optional(),
  passengers: z.coerce.number().int().min(0).optional(),
  ac: z.coerce.number().int().min(0).optional(),
  hp: z.coerce.number().int().min(0).optional(),
  damageThreshold: z.coerce.number().int().min(0).optional(),
  speed: equipmentSpeedFormSchema,
})

/** Service create/edit form schema — fields match `serviceFormFieldGroup` (no weight). */
export const serviceEquipmentFormSchema = equipmentIdentityEconomyFormSchema.extend({
  kind: z.literal('service'),
  serviceCategory: serviceCategorySchema,
  duration: z
    .object({
      value: z.coerce.number().int().min(1).optional(),
      unit: serviceDurationUnitSchema.optional(),
    })
    .optional(),
  notes: z.string().optional(),
})

/** Magic item create/edit form schema — fields match `magicItemFormFieldGroup`. */
export const magicItemEquipmentFormSchema = physicalEquipmentBaseFormSchema.extend({
  kind: z.literal('magic_item'),
  rarity: magicItemRaritySchema.optional(),
  requiresAttunement: z.boolean().optional(),
  attunementRequirement: z.string().optional(),
  magicItemCategory: magicItemCategorySchema.optional(),
  baseEquipmentId: z.string().optional(),
})

export const equipmentKindScopedFormSchema = z.discriminatedUnion('kind', [
  weaponEquipmentFormSchema,
  armorEquipmentFormSchema,
  adventuringGearEquipmentFormSchema,
  toolEquipmentFormSchema,
  mountEquipmentFormSchema,
  vehicleEquipmentFormSchema,
  serviceEquipmentFormSchema,
  magicItemEquipmentFormSchema,
])

export type EquipmentFormValues = z.infer<typeof equipmentKindScopedFormSchema>

export type WeaponEquipmentFormValues = z.infer<typeof weaponEquipmentFormSchema>
export type ArmorEquipmentFormValues = z.infer<typeof armorEquipmentFormSchema>
export type AdventuringGearEquipmentFormValues = z.infer<typeof adventuringGearEquipmentFormSchema>
export type ToolEquipmentFormValues = z.infer<typeof toolEquipmentFormSchema>
export type MountEquipmentFormValues = z.infer<typeof mountEquipmentFormSchema>
export type VehicleEquipmentFormValues = z.infer<typeof vehicleEquipmentFormSchema>
export type ServiceEquipmentFormValues = z.infer<typeof serviceEquipmentFormSchema>
export type MagicItemEquipmentFormValues = z.infer<typeof magicItemEquipmentFormSchema>

export type EquipmentFormValuesFor<K extends EquipmentKind> = Extract<
  EquipmentFormValues,
  { kind: K }
>

const kindSchemas: Record<EquipmentKind, z.ZodTypeAny> = {
  weapon: weaponEquipmentFormSchema,
  armor: armorEquipmentFormSchema,
  adventuring_gear: adventuringGearEquipmentFormSchema,
  tool: toolEquipmentFormSchema,
  mount: mountEquipmentFormSchema,
  vehicle: vehicleEquipmentFormSchema,
  service: serviceEquipmentFormSchema,
  magic_item: magicItemEquipmentFormSchema,
}

/** Kind-specific schema for family create/edit routes; falls back to the unscoped hub schema. */
export function resolveEquipmentFormSchema(ctx: ContentFormCtx): z.ZodType<EquipmentFormValues> {
  if (!ctx.equipmentKind) return equipmentFormSchema as z.ZodType<EquipmentFormValues>
  return kindSchemas[ctx.equipmentKind] as z.ZodType<EquipmentFormValues>
}

/**
 * Unscoped fallback used by the equipment hub / static ContentFormDef anchor.
 * Kind-specific create/edit routes use `resolveEquipmentFormSchema(ctx)` instead.
 * Do NOT use this schema for active kind forms.
 */
export const equipmentFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  kind: equipmentKindSchema,
  cost: equipmentCostFormSchema,
  weight: equipmentWeightFormSchema,

  // adventuring gear
  gearKind: gearKindSchema.optional(),
  spellcastingGearKind: spellcastingGearKindSchema.optional(),
  bundleSize: z.coerce.number().int().min(1).optional(),
  storage: z.string().optional(),
  propertiesText: z.string().optional(),
  capacity: z.string().optional(),
  holySymbolUsage: z.array(holySymbolUsageSchema).min(1).optional(),
  alsoWeaponSlug: slugSchema.optional(),

  // tool
  toolCategory: toolCategorySchema.optional(),
  ability: abilitySchema.optional(),
  utilizes: z.array(toolUtilizeActionSchema).optional(),
  craftsText: z.string().optional(),

  // mount
  carryingCapacity: equipmentMountCarryingCapacityFormSchema.optional(),
  speed: equipmentSpeedFormSchema.optional(),

  // vehicle
  vehicleCategory: vehicleCategorySchema.optional(),
  cargoCapacity: z
    .object({
      value: z.coerce.number().min(0).optional(),
      unit: massUnitSchema,
    })
    .optional(),
  crew: z.coerce.number().int().min(0).optional(),
  passengers: z.coerce.number().int().min(0).optional(),
  ac: z.coerce.number().int().min(0).optional(),
  hp: z.coerce.number().int().min(0).optional(),
  damageThreshold: z.coerce.number().int().min(0).optional(),

  // service
  serviceCategory: serviceCategorySchema.optional(),
  duration: z
    .object({
      value: z.coerce.number().int().min(1).optional(),
      unit: serviceDurationUnitSchema.optional(),
    })
    .optional(),
  notes: z.string().optional(),

  // magic item
  rarity: magicItemRaritySchema.optional(),
  requiresAttunement: z.boolean().optional(),
  attunementRequirement: z.string().optional(),
  magicItemCategory: magicItemCategorySchema.optional(),
  baseEquipmentId: z.string().optional(),

  // weapon variant fields
  category: weaponCategorySchema.optional(),
  mode: weaponModeSchema.optional(),
  damageKind: z.enum(['dice', 'flat', 'none']).optional(),
  damageDice: diceSchema.optional(),
  damageAmount: z.coerce.number().int().min(1).optional(),
  damageType: weaponDamageTypeSchema.optional(),
  versatileDamage: diceSchema.optional(),
  properties: z.array(weaponPropertySchema).optional(),
  mastery: weaponMasterySchema.optional(),
  rangeNormal: z.coerce.number().int().min(0).optional(),
  rangeLong: z.coerce.number().int().min(0).optional(),
  specialRules: z.string().optional(),

  // armor variant fields
  armorCategory: armorCategorySchema.optional(),
  material: armorMaterialSchema.optional(),
  baseAc: z.coerce.number().int().optional(),
  acBonus: z.coerce.number().int().optional(),
  addDexModifier: z.boolean().optional(),
  maxDexBonus: z.coerce.number().int().optional(),
  stealthDisadvantage: z.boolean().optional(),
  strengthRequirement: z.coerce
    .number()
    .int()
    .min(ABILITY_SCORE_MIN)
    .max(ABILITY_SCORE_MAX)
    .optional(),
})

function buildUnscopedEquipmentFields(): FormItem[] {
  return [
    { kind: 'group', legend: 'Identity', fields: identityFields() },
    {
      type: 'select',
      name: 'kind',
      label: 'Kind',
      options: equipmentKindOptions,
      required: true,
    },
    {
      kind: 'group',
      legend: 'Economy',
      fields: economyFields(),
    },
    ...allRegisteredKindFieldGroups(),
  ]
}

function identityAndEconomyGroups(ctx: ContentFormCtx): FormItem[] {
  return [
    { kind: 'group', legend: 'Identity', fields: identityFields(ctx) },
    {
      kind: 'group',
      legend: 'Economy',
      fields: economyFields({ kind: ctx.equipmentKind }),
    },
  ]
}

export function buildEquipmentFields(ctx: ContentFormCtx): FormItem[] {
  if (!ctx.equipmentKind) return buildUnscopedEquipmentFields()

  const registered = fieldGroupsForEquipmentKind(ctx.equipmentKind, ctx)
  return [...identityAndEconomyGroups(ctx), ...(registered ?? [])]
}
