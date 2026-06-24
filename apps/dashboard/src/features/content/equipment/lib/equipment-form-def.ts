import { z } from 'zod'
import {
  EQUIPMENT_KINDS,
  EQUIPMENT_KIND_LABELS,
  abilitySchema,
  armorCategorySchema,
  armorMaterialSchema,
  currencySchema,
  gearKindSchema,
  magicItemCategorySchema,
  magicItemRaritySchema,
  serviceCategorySchema,
  slugSchema,
  toolCategorySchema,
  vehicleCategorySchema,
  weaponCategorySchema,
  weaponDamageTypeSchema,
  weaponMasterySchema,
  weaponModeSchema,
  weaponPropertySchema,
  type CreateEquipmentInput,
  type Equipment,
  type EquipmentKind,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import {
  costFields,
  costToFormDefaults,
  identityFields,
  optionalWeightFields,
} from '../../lib/content-form-field-helpers'
import {
  contentFormRegistry,
  type ContentFormCtx,
  type ContentFormDef,
} from '../../lib/content-form-registry'
import { useEquipment, equipmentQueryKey } from '../hooks/use-equipment'
import { armorFormValuesFromEntity } from '../armor/lib/armor-form-fields'
import {
  adventuringGearFormValuesFromEntity,
  formatPropertiesText,
} from '../adventuring-gear/lib/adventuring-gear-form-fields'
import { magicItemFormValuesFromEntity } from '../magic-items/lib/magic-item-form-fields'
import { mountFormValuesFromEntity } from '../mounts/lib/mount-form-fields'
import { serviceFormValuesFromEntity } from '../services/lib/service-form-fields'
import { toolFormValuesFromEntity } from '../tools/lib/tool-form-fields'
import { vehicleFormValuesFromEntity } from '../vehicles/lib/vehicle-form-fields'
import { weaponFormValuesFromEntity } from '../weapons/lib/weapon-form-fields'
import { equipmentFormToInput } from './equipment-form-input'
import {
  allRegisteredKindFieldGroups,
  fieldGroupsForEquipmentKind,
} from './shared/equipment-form-registry'

const equipmentKindSchema = z.enum(EQUIPMENT_KINDS)
const equipmentKindOptions = toOptions(EQUIPMENT_KINDS, EQUIPMENT_KIND_LABELS)

const equipmentFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  kind: equipmentKindSchema,
  cost: z.object({
    amount: z.coerce.number().int().min(0),
    currency: currencySchema,
  }),
  weight: z.object({ value: z.coerce.number().min(0).optional() }).optional(),

  // adventuring gear
  gearKind: gearKindSchema.optional(),
  bundleSize: z.coerce.number().int().min(1).optional(),
  storage: z.string().optional(),
  propertiesText: z.string().optional(),
  capacity: z.string().optional(),

  // tool
  toolCategory: toolCategorySchema.optional(),
  ability: abilitySchema.optional(),

  // mount
  carryingCapacity: z.coerce.number().min(0).optional(),
  speed: z.string().optional(),

  // vehicle
  vehicleCategory: vehicleCategorySchema.optional(),
  vehicleCapacity: z.coerce.number().min(0).optional(),
  crew: z.coerce.number().int().min(0).optional(),
  passengers: z.coerce.number().int().min(0).optional(),
  cargoTons: z.coerce.number().min(0).optional(),
  ac: z.coerce.number().int().min(0).optional(),
  hp: z.coerce.number().int().min(0).optional(),
  damageThreshold: z.coerce.number().int().min(0).optional(),

  // service
  serviceCategory: serviceCategorySchema.optional(),
  duration: z.string().optional(),
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
  damageKind: z.enum(['dice', 'flat']).optional(),
  damageCount: z.coerce.number().int().min(1).optional(),
  damageFaces: z.coerce.number().optional(),
  damageAmount: z.coerce.number().int().min(1).optional(),
  damageType: weaponDamageTypeSchema.optional(),
  versatileCount: z.coerce.number().int().min(1).optional(),
  versatileFaces: z.coerce.number().optional(),
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
  strengthRequirement: z.coerce.number().int().optional(),
})

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>

function sharedFormValues(
  entity: Equipment,
): Pick<EquipmentFormValues, 'name' | 'slug' | 'description' | 'kind' | 'cost' | 'weight'> {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    kind: entity.kind,
    cost: entity.cost,
    weight: entity.weight ? { value: entity.weight.value } : undefined,
  }
}

type KindFormExtractor = (entity: Equipment) => Partial<EquipmentFormValues>

const kindFormValueExtractors: Record<EquipmentKind, KindFormExtractor> = {
  weapon: (entity) => weaponFormValuesFromEntity(entity as Extract<Equipment, { kind: 'weapon' }>),
  armor: (entity) => armorFormValuesFromEntity(entity as Extract<Equipment, { kind: 'armor' }>),
  adventuring_gear: (entity) =>
    adventuringGearFormValuesFromEntity(entity as Extract<Equipment, { kind: 'adventuring_gear' }>),
  tool: (entity) => toolFormValuesFromEntity(entity as Extract<Equipment, { kind: 'tool' }>),
  mount: (entity) => mountFormValuesFromEntity(entity as Extract<Equipment, { kind: 'mount' }>),
  vehicle: (entity) =>
    vehicleFormValuesFromEntity(entity as Extract<Equipment, { kind: 'vehicle' }>),
  service: (entity) =>
    serviceFormValuesFromEntity(entity as Extract<Equipment, { kind: 'service' }>),
  magic_item: (entity) =>
    magicItemFormValuesFromEntity(entity as Extract<Equipment, { kind: 'magic_item' }>),
}

function legacyKindFormValues(entity: Equipment): Partial<EquipmentFormValues> {
  const legacyKind = entity.kind as string
  const legacy = entity as Equipment & Record<string, unknown>
  if (legacyKind === 'gear') {
    return {
      kind: 'adventuring_gear',
      gearKind: 'general',
      propertiesText: formatPropertiesText((legacy as { properties?: string[] }).properties),
      capacity: (legacy as { capacity?: string }).capacity,
    }
  }
  if (legacyKind === 'ammunition') {
    return {
      kind: 'adventuring_gear',
      gearKind: 'ammunition',
      bundleSize: (legacy as { bundleSize?: number }).bundleSize,
      storage: (legacy as { storage?: string }).storage,
    }
  }
  if (legacyKind === 'focus') {
    const focusType = (legacy as { focusType?: string }).focusType
    return {
      kind: 'adventuring_gear',
      gearKind:
        focusType === 'holy'
          ? 'holy_symbol'
          : focusType === 'druidic'
            ? 'druidic_focus'
            : 'arcane_focus',
    }
  }
  if (legacyKind === 'ship') {
    return {
      kind: 'vehicle',
      vehicleCategory: 'water',
      speed: (legacy as { speed?: string }).speed,
      crew: (legacy as { crew?: number }).crew,
      passengers: (legacy as { passengers?: number }).passengers,
      cargoTons: (legacy as { cargoTons?: number }).cargoTons,
      ac: (legacy as { ac?: number }).ac,
      hp: (legacy as { hp?: number }).hp,
      damageThreshold: (legacy as { damageThreshold?: number }).damageThreshold,
    }
  }
  if (legacyKind === 'misc') {
    return {
      kind: 'service',
      serviceCategory: 'other',
      notes: (legacy as { notes?: string }).notes,
    }
  }
  return {}
}

function kindFormValues(entity: Equipment): Partial<EquipmentFormValues> {
  const extractor = kindFormValueExtractors[entity.kind as EquipmentKind]
  return extractor ? extractor(entity) : legacyKindFormValues(entity)
}

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
      fields: [...costFields(), ...optionalWeightFields()],
    },
    ...allRegisteredKindFieldGroups(),
  ]
}

function identityAndEconomyGroups(): FormItem[] {
  return [
    { kind: 'group', legend: 'Identity', fields: identityFields() },
    {
      kind: 'group',
      legend: 'Economy',
      fields: [...costFields(), ...optionalWeightFields()],
    },
  ]
}

function buildEquipmentFields(ctx: ContentFormCtx): FormItem[] {
  if (!ctx.equipmentKind) return buildUnscopedEquipmentFields()

  const registered = fieldGroupsForEquipmentKind(ctx.equipmentKind)
  return [...identityAndEconomyGroups(), ...(registered ?? [])]
}

const equipmentFormDef: ContentFormDef<Equipment, EquipmentFormValues, CreateEquipmentInput> = {
  routeKey: 'equipment',
  schema: equipmentFormSchema,
  coverage: 'roundtrip-only',
  createDefaultValues: {
    kind: 'adventuring_gear',
    gearKind: 'general',
    cost: costToFormDefaults(),
  },
  buildFields: buildEquipmentFields,
  toFormValues: (entity) => ({
    ...sharedFormValues(entity),
    ...kindFormValues(entity),
  }),
  toInput: equipmentFormToInput,
  useListQuery: useEquipment,
  queryKey: equipmentQueryKey,
}

contentFormRegistry['equipment'] = equipmentFormDef

export { equipmentFormDef, equipmentFormSchema }
export type { EquipmentFormValues }
