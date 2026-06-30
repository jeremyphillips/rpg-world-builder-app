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
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { economyFields } from '../../lib/forms/content-economy-form-fields'
import { identityFields } from '../../lib/forms/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  allRegisteredKindFieldGroups,
  fieldGroupsForEquipmentKind,
} from './shared/equipment-form-registry'

const equipmentKindSchema = z.enum(EQUIPMENT_KINDS)
const equipmentKindOptions = toOptions(EQUIPMENT_KINDS, EQUIPMENT_KIND_LABELS)

export const equipmentFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  kind: equipmentKindSchema,
  cost: z.object({
    amount: z.coerce.number().int().min(0),
    currency: currencySchema,
  }),
  weight: z
    .object({ value: z.coerce.number().min(0).optional(), unit: z.literal('lb') })
    .optional(),

  // adventuring gear
  gearKind: gearKindSchema.optional(),
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
  carryingCapacity: z
    .object({
      value: z.coerce.number().min(0),
      unit: massUnitSchema,
    })
    .optional(),
  speed: z.object({
    value: z.coerce.number().min(0),
    unit: speedRateUnitSchema,
  }),

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

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>

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
