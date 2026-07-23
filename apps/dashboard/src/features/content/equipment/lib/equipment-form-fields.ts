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
  type ContentValidationIntent,
  type EquipmentKind,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { economyFields } from '../../lib/forms/fields/content-economy-form-fields'
import { descriptionField, nameField } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'
import { rollFormObjectSchema } from '../../lib/forms/mechanics/roll-form-values'
import {
  allRegisteredKindFieldGroups,
  fieldGroupsForEquipmentKind,
} from './shared/equipment-form-registry'

const equipmentKindSchema = z.enum(EQUIPMENT_KINDS)
const equipmentKindOptions = toOptions(EQUIPMENT_KINDS, EQUIPMENT_KIND_LABELS)

const equipmentCostFormValueSchema = z
  .object({
    amount: z.coerce.number().int().min(1).optional(),
    currency: currencySchema,
  })
  .nullable()

function refineEquipmentEconomyForm(
  data: { hasMarketPrice: boolean; cost: z.infer<typeof equipmentCostFormValueSchema> },
  ctx: z.RefinementCtx,
) {
  if (!data.hasMarketPrice) return
  const amount = data.cost?.amount
  if (amount === undefined || Number.isNaN(amount)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a market price greater than zero.',
      path: ['cost', 'amount'],
    })
  }
}

/** Identity + economy fields only — no weight, no kind discriminant. */
const equipmentIdentityEconomyFormSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    hasMarketPrice: z.boolean(),
    cost: equipmentCostFormValueSchema,
  })
  .superRefine(refineEquipmentEconomyForm)

const equipmentWeightFormSchema = z
  .object({ value: z.coerce.number().min(0).optional(), unit: z.literal('lb') })
  .optional()

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
  hasDamage: z.boolean().optional(),
  damage: rollFormObjectSchema.optional(),
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

/** Identity + economy fields only — no weight, no kind discriminant. */
const equipmentIdentityEconomyDraftFormSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  hasMarketPrice: z.boolean(),
  cost: equipmentCostFormValueSchema,
})

/** Physical kinds share optional weight on top of identity/economy. */
const physicalEquipmentBaseDraftFormSchema = equipmentIdentityEconomyDraftFormSchema.extend({
  weight: equipmentWeightFormSchema,
})

/** Weapon draft form schema — relaxed fields for Save Draft. */
export const weaponEquipmentDraftFormSchema = physicalEquipmentBaseDraftFormSchema.extend({
  kind: z.literal('weapon'),
  category: draftOptionalSelect(weaponCategorySchema),
  mode: draftOptionalSelect(weaponModeSchema),
  mastery: draftOptionalSelect(weaponMasterySchema),
  properties: z.array(weaponPropertySchema).optional(),
  hasDamage: z.boolean().optional(),
  damage: rollFormObjectSchema.optional(),
  damageType: draftOptionalSelect(weaponDamageTypeSchema),
  versatileDamage: diceSchema.optional(),
  rangeNormal: z.coerce.number().int().min(0).optional(),
  rangeLong: z.coerce.number().int().min(0).optional(),
  specialRules: z.string().optional(),
})

/** Armor draft form schema — relaxed fields for Save Draft. */
export const armorEquipmentDraftFormSchema = physicalEquipmentBaseDraftFormSchema.extend({
  kind: z.literal('armor'),
  armorCategory: draftOptionalSelect(armorCategorySchema),
  material: draftOptionalSelect(armorMaterialSchema),
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

/** Adventuring gear draft form schema. */
export const adventuringGearEquipmentDraftFormSchema = physicalEquipmentBaseDraftFormSchema.extend({
  kind: z.literal('adventuring_gear'),
  gearKind: draftOptionalSelect(gearKindSchema),
  spellcastingGearKind: draftOptionalSelect(spellcastingGearKindSchema),
  bundleSize: z.coerce.number().int().min(1).optional(),
  storage: z.string().optional(),
  propertiesText: z.string().optional(),
  capacity: z.string().optional(),
  holySymbolUsage: z.array(holySymbolUsageSchema).optional(),
  alsoWeaponSlug: slugSchema.optional(),
})

/** Tool draft form schema. */
export const toolEquipmentDraftFormSchema = physicalEquipmentBaseDraftFormSchema.extend({
  kind: z.literal('tool'),
  toolCategory: draftOptionalSelect(toolCategorySchema),
  ability: draftOptionalSelect(abilitySchema),
  utilizes: z.array(toolUtilizeActionSchema).optional(),
  craftsText: z.string().optional(),
})

/** Mount draft form schema. */
export const mountEquipmentDraftFormSchema = physicalEquipmentBaseDraftFormSchema.extend({
  kind: z.literal('mount'),
  carryingCapacity: equipmentMountCarryingCapacityFormSchema.optional(),
  speed: equipmentSpeedFormSchema.optional(),
})

/** Vehicle draft form schema. */
export const vehicleEquipmentDraftFormSchema = physicalEquipmentBaseDraftFormSchema.extend({
  kind: z.literal('vehicle'),
  vehicleCategory: draftOptionalSelect(vehicleCategorySchema),
  cargoCapacity: z
    .object({
      value: z.coerce.number().min(0).optional(),
      unit: draftOptionalSelect(massUnitSchema),
    })
    .optional(),
  crew: z.coerce.number().int().min(0).optional(),
  passengers: z.coerce.number().int().min(0).optional(),
  ac: z.coerce.number().int().min(0).optional(),
  hp: z.coerce.number().int().min(0).optional(),
  damageThreshold: z.coerce.number().int().min(0).optional(),
  speed: equipmentSpeedFormSchema.optional(),
})

/** Service draft form schema. */
export const serviceEquipmentDraftFormSchema = equipmentIdentityEconomyDraftFormSchema.extend({
  kind: z.literal('service'),
  serviceCategory: draftOptionalSelect(serviceCategorySchema),
  duration: z
    .object({
      value: z.coerce.number().int().min(1).optional(),
      unit: draftOptionalSelect(serviceDurationUnitSchema),
    })
    .optional(),
  notes: z.string().optional(),
})

/** Magic item draft form schema. */
export const magicItemEquipmentDraftFormSchema = physicalEquipmentBaseDraftFormSchema.extend({
  kind: z.literal('magic_item'),
  rarity: draftOptionalSelect(magicItemRaritySchema),
  requiresAttunement: z.boolean().optional(),
  attunementRequirement: z.string().optional(),
  magicItemCategory: draftOptionalSelect(magicItemCategorySchema),
  baseEquipmentId: z.string().optional(),
})

export const equipmentKindScopedDraftFormSchema = z.discriminatedUnion('kind', [
  weaponEquipmentDraftFormSchema,
  armorEquipmentDraftFormSchema,
  adventuringGearEquipmentDraftFormSchema,
  toolEquipmentDraftFormSchema,
  mountEquipmentDraftFormSchema,
  vehicleEquipmentDraftFormSchema,
  serviceEquipmentDraftFormSchema,
  magicItemEquipmentDraftFormSchema,
])

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

const kindDraftSchemas: Record<EquipmentKind, z.ZodTypeAny> = {
  weapon: weaponEquipmentDraftFormSchema,
  armor: armorEquipmentDraftFormSchema,
  adventuring_gear: adventuringGearEquipmentDraftFormSchema,
  tool: toolEquipmentDraftFormSchema,
  mount: mountEquipmentDraftFormSchema,
  vehicle: vehicleEquipmentDraftFormSchema,
  service: serviceEquipmentDraftFormSchema,
  magic_item: magicItemEquipmentDraftFormSchema,
}

/** Kind-specific schema for family create/edit routes; falls back to the unscoped hub schema. */
export function resolveEquipmentFormSchema(
  ctx: ContentFormCtx,
  validationIntent: ContentValidationIntent = 'publish',
): z.ZodType<EquipmentFormValues> {
  if (!ctx.equipmentKind) {
    return (
      validationIntent === 'draft' ? equipmentFormDraftSchema : equipmentFormSchema
    ) as z.ZodType<EquipmentFormValues>
  }

  const schemas = validationIntent === 'draft' ? kindDraftSchemas : kindSchemas
  const kindSchema = schemas[ctx.equipmentKind]
  const equipmentKind = ctx.equipmentKind
  return z.preprocess((value) => {
    if (typeof value !== 'object' || value === null) return value
    return { ...value, kind: equipmentKind }
  }, kindSchema) as z.ZodType<EquipmentFormValues>
}

/**
 * Unscoped fallback used by the equipment hub / static ContentFormDef anchor.
 * Kind-specific create/edit routes use `resolveEquipmentFormSchema(ctx)` instead.
 * Do NOT use this schema for active kind forms.
 */
export const equipmentFormSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    kind: equipmentKindSchema,
    hasMarketPrice: z.boolean(),
    cost: equipmentCostFormValueSchema,
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
    hasDamage: z.boolean().optional(),
    damage: rollFormObjectSchema.optional(),
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
  .superRefine(refineEquipmentEconomyForm)

/**
 * Unscoped hub draft schema — relaxed identity/economy for Save Draft on the equipment hub.
 */
export const equipmentFormDraftSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  kind: equipmentKindSchema,
  hasMarketPrice: z.boolean(),
  cost: equipmentCostFormValueSchema,
  weight: equipmentWeightFormSchema,
  gearKind: draftOptionalSelect(gearKindSchema),
  spellcastingGearKind: draftOptionalSelect(spellcastingGearKindSchema),
  bundleSize: z.coerce.number().int().min(1).optional(),
  storage: z.string().optional(),
  propertiesText: z.string().optional(),
  capacity: z.string().optional(),
  holySymbolUsage: z.array(holySymbolUsageSchema).optional(),
  alsoWeaponSlug: slugSchema.optional(),
  toolCategory: draftOptionalSelect(toolCategorySchema),
  ability: draftOptionalSelect(abilitySchema),
  utilizes: z.array(toolUtilizeActionSchema).optional(),
  craftsText: z.string().optional(),
  carryingCapacity: equipmentMountCarryingCapacityFormSchema.optional(),
  speed: equipmentSpeedFormSchema.optional(),
  vehicleCategory: draftOptionalSelect(vehicleCategorySchema),
  cargoCapacity: z
    .object({
      value: z.coerce.number().min(0).optional(),
      unit: draftOptionalSelect(massUnitSchema),
    })
    .optional(),
  crew: z.coerce.number().int().min(0).optional(),
  passengers: z.coerce.number().int().min(0).optional(),
  ac: z.coerce.number().int().min(0).optional(),
  hp: z.coerce.number().int().min(0).optional(),
  damageThreshold: z.coerce.number().int().min(0).optional(),
  serviceCategory: draftOptionalSelect(serviceCategorySchema),
  duration: z
    .object({
      value: z.coerce.number().int().min(1).optional(),
      unit: draftOptionalSelect(serviceDurationUnitSchema),
    })
    .optional(),
  notes: z.string().optional(),
  rarity: draftOptionalSelect(magicItemRaritySchema),
  requiresAttunement: z.boolean().optional(),
  attunementRequirement: z.string().optional(),
  magicItemCategory: draftOptionalSelect(magicItemCategorySchema),
  baseEquipmentId: z.string().optional(),
  category: draftOptionalSelect(weaponCategorySchema),
  mode: draftOptionalSelect(weaponModeSchema),
  hasDamage: z.boolean().optional(),
  damage: rollFormObjectSchema.optional(),
  damageType: draftOptionalSelect(weaponDamageTypeSchema),
  versatileDamage: diceSchema.optional(),
  properties: z.array(weaponPropertySchema).optional(),
  mastery: draftOptionalSelect(weaponMasterySchema),
  rangeNormal: z.coerce.number().int().min(0).optional(),
  rangeLong: z.coerce.number().int().min(0).optional(),
  specialRules: z.string().optional(),
  armorCategory: draftOptionalSelect(armorCategorySchema),
  material: draftOptionalSelect(armorMaterialSchema),
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

function economyGroup(ctx?: ContentFormCtx): FormItem {
  return {
    kind: 'group',
    legend: 'Economy',
    fieldsChrome: { variant: 'outline' },
    fields: economyFields({ kind: ctx?.equipmentKind }),
  }
}

function buildUnscopedEquipmentFields(): FormItem[] {
  return [
    nameField(),
    {
      type: 'select',
      name: 'kind',
      label: 'Kind',
      options: equipmentKindOptions,
      required: true,
    },
    ...allRegisteredKindFieldGroups(),
    economyGroup(),
    descriptionField(),
  ]
}

export function buildEquipmentFields(ctx: ContentFormCtx): FormItem[] {
  if (!ctx.equipmentKind) return buildUnscopedEquipmentFields()

  const registered = fieldGroupsForEquipmentKind(ctx.equipmentKind, ctx)
  return [nameField(), ...(registered ?? []), economyGroup(ctx), descriptionField(ctx)]
}
