import { z } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  ARMOR_MATERIALS,
  ARMOR_MATERIAL_ENTRIES,
  DIE_FACES,
  EQUIPMENT_KINDS,
  EQUIPMENT_KIND_LABELS,
  GEAR_KINDS,
  GEAR_KIND_ENTRIES,
  MAGIC_ITEM_CATEGORIES,
  MAGIC_ITEM_CATEGORY_ENTRIES,
  MAGIC_ITEM_RARITIES,
  MAGIC_ITEM_RARITY_ENTRIES,
  PHYSICAL_DAMAGE_TYPE_IDS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORY_ENTRIES,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  WEAPON_MASTERIES,
  WEAPON_MASTERY_ENTRIES,
  WEAPON_MODES,
  WEAPON_MODE_ENTRIES,
  WEAPON_PROPERTIES,
  WEAPON_PROPERTY_ENTRIES,
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
  type WeaponDamage,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

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
import { serviceFormValuesFromEntity } from '../services/lib/service-form-fields'
import { equipmentFormToInput } from './equipment-form-input'
import { buildRegisteredKindFieldGroups } from './shared/equipment-form-registry'
import { visibleWhenKind } from './shared/visible-when-kind'

const equipmentKindSchema = z.enum(EQUIPMENT_KINDS)

function labelsFromEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

const equipmentKindOptions = toOptions(EQUIPMENT_KINDS, EQUIPMENT_KIND_LABELS)
const gearKindOptions = toOptions(GEAR_KINDS, labelsFromEntries(GEAR_KIND_ENTRIES))
const toolCategoryOptions = toOptions(TOOL_CATEGORIES, labelsFromEntries(TOOL_CATEGORY_ENTRIES))
const vehicleCategoryOptions = toOptions(
  VEHICLE_CATEGORIES,
  labelsFromEntries(VEHICLE_CATEGORY_ENTRIES),
)
const magicItemRarityOptions = toOptions(
  MAGIC_ITEM_RARITIES,
  labelsFromEntries(MAGIC_ITEM_RARITY_ENTRIES),
)
const magicItemCategoryOptions = toOptions(
  MAGIC_ITEM_CATEGORIES,
  labelsFromEntries(MAGIC_ITEM_CATEGORY_ENTRIES),
)
const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  labelsFromEntries(WEAPON_CATEGORY_ENTRIES),
)
const weaponModeOptions = toOptions(WEAPON_MODES, labelsFromEntries(WEAPON_MODE_ENTRIES))
const weaponMasteryOptions = toOptions(WEAPON_MASTERIES, labelsFromEntries(WEAPON_MASTERY_ENTRIES))
const weaponPropertyOptions = toOptions(
  WEAPON_PROPERTIES,
  labelsFromEntries(WEAPON_PROPERTY_ENTRIES),
)
const armorCategoryOptions = toOptions(ARMOR_CATEGORIES, labelsFromEntries(ARMOR_CATEGORY_ENTRIES))
const armorMaterialOptions = toOptions(ARMOR_MATERIALS, labelsFromEntries(ARMOR_MATERIAL_ENTRIES))

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)
const damageTypeOptions = toOptions(
  PHYSICAL_DAMAGE_TYPE_IDS,
  Object.fromEntries(PHYSICAL_DAMAGE_TYPE_IDS.map((id) => [id, id])) as Record<
    (typeof PHYSICAL_DAMAGE_TYPE_IDS)[number],
    string
  >,
)
const dieFaceOptions = DIE_FACES.map((f) => ({ value: String(f), label: `d${f}` }))
const damageKindOptions = [
  { value: 'dice', label: 'Dice' },
  { value: 'flat', label: 'Flat amount' },
]

function visibleWhenWeaponDamage(): FieldVisibility {
  return {
    dependsOn: ['kind', 'hasDamage'],
    visibleWhen: (v) => v.kind === 'weapon' && v.hasDamage === true,
  }
}

function visibleWhenWeaponDiceDamage(): FieldVisibility {
  return {
    dependsOn: ['kind', 'hasDamage', 'damageKind'],
    visibleWhen: (v) => v.kind === 'weapon' && v.hasDamage === true && v.damageKind === 'dice',
  }
}

function visibleWhenWeaponFlatDamage(): FieldVisibility {
  return {
    dependsOn: ['kind', 'hasDamage', 'damageKind'],
    visibleWhen: (v) => v.kind === 'weapon' && v.hasDamage === true && v.damageKind === 'flat',
  }
}

function visibleWhenWeaponVersatile(): FieldVisibility {
  return {
    dependsOn: ['kind', 'properties'],
    visibleWhen: (v) =>
      v.kind === 'weapon' && Array.isArray(v.properties) && v.properties.includes('versatile'),
  }
}

function visibleWhenWeaponRanged(): FieldVisibility {
  return {
    dependsOn: ['kind', 'mode'],
    visibleWhen: (v) => v.kind === 'weapon' && v.mode === 'ranged',
  }
}

function visibleWhenArmorNotShield(): FieldVisibility {
  return {
    dependsOn: ['kind', 'armorCategory'],
    visibleWhen: (v) => v.kind === 'armor' && v.armorCategory !== 'shields',
  }
}

function visibleWhenArmorShield(): FieldVisibility {
  return {
    dependsOn: ['kind', 'armorCategory'],
    visibleWhen: (v) => v.kind === 'armor' && v.armorCategory === 'shields',
  }
}

function visibleWhenArmorDexCap(): FieldVisibility {
  return {
    dependsOn: ['kind', 'armorCategory', 'addDexModifier'],
    visibleWhen: (v) =>
      v.kind === 'armor' && v.armorCategory === 'medium' && v.addDexModifier === true,
  }
}

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

function formatProperties(items: string[] | undefined): string | undefined {
  return items?.length ? items.join('\n') : undefined
}

function damageToForm(
  damage: WeaponDamage | undefined,
): Pick<
  EquipmentFormValues,
  'hasDamage' | 'damageKind' | 'damageCount' | 'damageFaces' | 'damageAmount'
> {
  if (!damage) return { hasDamage: false }
  if (damage.kind === 'dice') {
    return {
      hasDamage: true,
      damageKind: 'dice',
      damageCount: damage.count,
      damageFaces: damage.faces,
    }
  }
  return {
    hasDamage: true,
    damageKind: 'flat',
    damageAmount: damage.amount,
  }
}

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
  weapon: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'weapon' }>
    return {
      category: item.category,
      mode: item.mode,
      ...damageToForm(item.damage),
      damageType: item.damageType,
      versatileCount: item.versatileDamage?.count,
      versatileFaces: item.versatileDamage?.faces,
      properties: item.properties,
      mastery: item.mastery,
      rangeNormal: item.range?.normal,
      rangeLong: item.range?.long,
      specialRules: item.specialRules,
    }
  },
  armor: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'armor' }>
    return {
      armorCategory: item.category,
      material: item.material,
      baseAc: item.baseAc,
      acBonus: item.acBonus,
      addDexModifier: item.addDexModifier,
      maxDexBonus: item.maxDexBonus,
      stealthDisadvantage: item.stealthDisadvantage,
      strengthRequirement: item.strengthRequirement,
    }
  },
  adventuring_gear: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'adventuring_gear' }>
    return {
      gearKind: item.gearKind,
      bundleSize: item.bundleSize,
      storage: item.storage,
      propertiesText: formatProperties(item.properties),
      capacity: item.capacity,
    }
  },
  tool: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'tool' }>
    return { toolCategory: item.toolCategory, ability: item.ability }
  },
  mount: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'mount' }>
    return { carryingCapacity: item.carryingCapacity.value, speed: item.speed }
  },
  vehicle: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'vehicle' }>
    return {
      vehicleCategory: item.vehicleCategory,
      speed: item.speed,
      vehicleCapacity: item.capacity?.value,
      crew: item.crew,
      passengers: item.passengers,
      cargoTons: item.cargoTons,
      ac: item.ac,
      hp: item.hp,
      damageThreshold: item.damageThreshold,
    }
  },
  service: (entity) =>
    serviceFormValuesFromEntity(entity as Extract<Equipment, { kind: 'service' }>),
  magic_item: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'magic_item' }>
    return {
      rarity: item.rarity,
      requiresAttunement: item.requiresAttunement,
      attunementRequirement: item.attunementRequirement,
      magicItemCategory: item.magicItemCategory,
      baseEquipmentId: item.baseEquipmentId,
    }
  },
}

function legacyKindFormValues(entity: Equipment): Partial<EquipmentFormValues> {
  const legacyKind = entity.kind as string
  const legacy = entity as Equipment & Record<string, unknown>
  if (legacyKind === 'gear') {
    return {
      kind: 'adventuring_gear',
      gearKind: 'general',
      propertiesText: formatProperties((legacy as { properties?: string[] }).properties),
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

const EQUIPMENT_KIND_GROUP_LEGEND: Record<EquipmentKind, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  adventuring_gear: 'Adventuring Gear',
  tool: 'Tool',
  mount: 'Mount',
  vehicle: 'Vehicle',
  service: 'Service',
  magic_item: 'Magic Item',
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
    {
      kind: 'group',
      legend: 'Weapon',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'category',
              label: 'Category',
              options: weaponCategoryOptions,
              visibility: visibleWhenKind('weapon'),
              required: true,
            },
            {
              type: 'select',
              name: 'mode',
              label: 'Mode',
              options: weaponModeOptions,
              visibility: visibleWhenKind('weapon'),
              required: true,
            },
            {
              type: 'select',
              name: 'mastery',
              label: 'Mastery',
              options: weaponMasteryOptions,
              visibility: visibleWhenKind('weapon'),
              required: true,
            },
          ],
        },
        {
          type: 'chips',
          name: 'properties',
          label: 'Properties',
          options: weaponPropertyOptions,
          visibility: visibleWhenKind('weapon'),
        },
        {
          type: 'switch',
          name: 'hasDamage',
          label: 'Deals damage',
          visibility: visibleWhenKind('weapon'),
        },
        {
          type: 'select',
          name: 'damageKind',
          label: 'Damage kind',
          options: damageKindOptions,
          visibility: visibleWhenWeaponDamage(),
        },
        {
          type: 'select',
          name: 'damageType',
          label: 'Damage type',
          options: damageTypeOptions,
          visibility: visibleWhenWeaponDamage(),
          required: true,
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'damageCount',
              label: 'Dice count',
              min: 1,
              visibility: visibleWhenWeaponDiceDamage(),
              required: true,
            },
            {
              type: 'select',
              name: 'damageFaces',
              label: 'Die faces',
              options: dieFaceOptions,
              visibility: visibleWhenWeaponDiceDamage(),
              required: true,
            },
            {
              type: 'number',
              name: 'damageAmount',
              label: 'Flat damage',
              min: 1,
              visibility: visibleWhenWeaponFlatDamage(),
              required: true,
            },
          ],
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'versatileCount',
              label: 'Versatile dice count',
              min: 1,
              visibility: visibleWhenWeaponVersatile(),
              required: true,
            },
            {
              type: 'select',
              name: 'versatileFaces',
              label: 'Versatile die faces',
              options: dieFaceOptions,
              visibility: visibleWhenWeaponVersatile(),
              required: true,
            },
          ],
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'rangeNormal',
              label: 'Normal range (ft.)',
              min: 0,
              visibility: visibleWhenWeaponRanged(),
            },
            {
              type: 'number',
              name: 'rangeLong',
              label: 'Long range (ft.)',
              min: 0,
              visibility: visibleWhenWeaponRanged(),
            },
          ],
        },
        {
          type: 'textarea',
          name: 'specialRules',
          label: 'Special rules',
          hint: 'Prose for special properties (lance, net, etc.)',
          visibility: visibleWhenKind('weapon'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Armor',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'armorCategory',
              label: 'Category',
              options: armorCategoryOptions,
              visibility: visibleWhenKind('armor'),
              required: true,
            },
            {
              type: 'select',
              name: 'material',
              label: 'Material',
              options: armorMaterialOptions,
              visibility: visibleWhenKind('armor'),
            },
          ],
        },
        {
          type: 'number',
          name: 'baseAc',
          label: 'Base AC',
          min: 0,
          visibility: visibleWhenArmorNotShield(),
          required: true,
        },
        {
          type: 'number',
          name: 'acBonus',
          label: 'AC bonus',
          min: 0,
          visibility: visibleWhenArmorShield(),
          required: true,
        },
        {
          type: 'switch',
          name: 'addDexModifier',
          label: 'Add Dex modifier',
          visibility: visibleWhenArmorNotShield(),
        },
        {
          type: 'number',
          name: 'maxDexBonus',
          label: 'Max Dex bonus',
          min: 0,
          visibility: visibleWhenArmorDexCap(),
        },
        {
          type: 'switch',
          name: 'stealthDisadvantage',
          label: 'Stealth disadvantage',
          visibility: visibleWhenKind('armor'),
        },
        {
          type: 'number',
          name: 'strengthRequirement',
          label: 'Strength requirement',
          min: 0,
          hint: 'Minimum Strength to avoid speed penalty (heavy armor)',
          visibility: visibleWhenKind('armor'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Adventuring Gear',
      fields: [
        {
          type: 'select',
          name: 'gearKind',
          label: 'Gear kind',
          options: gearKindOptions,
          visibility: visibleWhenKind('adventuring_gear'),
          required: true,
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'bundleSize',
              label: 'Bundle size',
              min: 1,
              visibility: visibleWhenKind('adventuring_gear'),
            },
            {
              type: 'text',
              name: 'storage',
              label: 'Storage',
              visibility: visibleWhenKind('adventuring_gear'),
            },
          ],
        },
        {
          type: 'textarea',
          name: 'propertiesText',
          label: 'Properties',
          hint: 'One mechanical note per line',
          visibility: visibleWhenKind('adventuring_gear'),
        },
        {
          type: 'text',
          name: 'capacity',
          label: 'Capacity',
          visibility: visibleWhenKind('adventuring_gear'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Tool',
      fields: [
        {
          type: 'select',
          name: 'toolCategory',
          label: 'Tool category',
          options: toolCategoryOptions,
          visibility: visibleWhenKind('tool'),
          required: true,
        },
        {
          type: 'select',
          name: 'ability',
          label: 'Typical ability',
          options: abilityOptions,
          visibility: visibleWhenKind('tool'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Mount',
      fields: [
        {
          type: 'number',
          name: 'carryingCapacity',
          label: 'Carrying capacity (lb)',
          min: 0,
          visibility: visibleWhenKind('mount'),
          required: true,
        },
        {
          type: 'text',
          name: 'speed',
          label: 'Speed',
          visibility: visibleWhenKind('mount'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Vehicle',
      fields: [
        {
          type: 'select',
          name: 'vehicleCategory',
          label: 'Vehicle category',
          options: vehicleCategoryOptions,
          visibility: visibleWhenKind('vehicle'),
          required: true,
        },
        {
          type: 'text',
          name: 'speed',
          label: 'Speed',
          visibility: visibleWhenKind('vehicle'),
        },
        {
          type: 'number',
          name: 'vehicleCapacity',
          label: 'Cargo capacity (lb)',
          min: 0,
          visibility: visibleWhenKind('vehicle'),
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'crew',
              label: 'Crew',
              min: 0,
              visibility: visibleWhenKind('vehicle'),
            },
            {
              type: 'number',
              name: 'passengers',
              label: 'Passengers',
              min: 0,
              visibility: visibleWhenKind('vehicle'),
            },
            {
              type: 'number',
              name: 'cargoTons',
              label: 'Cargo (tons)',
              min: 0,
              visibility: visibleWhenKind('vehicle'),
            },
          ],
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'ac',
              label: 'AC',
              min: 0,
              visibility: visibleWhenKind('vehicle'),
            },
            {
              type: 'number',
              name: 'hp',
              label: 'HP',
              min: 0,
              visibility: visibleWhenKind('vehicle'),
            },
            {
              type: 'number',
              name: 'damageThreshold',
              label: 'Damage threshold',
              min: 0,
              visibility: visibleWhenKind('vehicle'),
            },
          ],
        },
      ],
    },
    ...buildRegisteredKindFieldGroups(),
    {
      kind: 'group',
      legend: 'Magic Item',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'rarity',
              label: 'Rarity',
              options: magicItemRarityOptions,
              visibility: visibleWhenKind('magic_item'),
            },
            {
              type: 'select',
              name: 'magicItemCategory',
              label: 'Category',
              options: magicItemCategoryOptions,
              visibility: visibleWhenKind('magic_item'),
            },
          ],
        },
        {
          type: 'switch',
          name: 'requiresAttunement',
          label: 'Requires attunement',
          visibility: visibleWhenKind('magic_item'),
        },
        {
          type: 'text',
          name: 'attunementRequirement',
          label: 'Attunement requirement',
          visibility: visibleWhenKind('magic_item'),
        },
        {
          type: 'text',
          name: 'baseEquipmentId',
          label: 'Base equipment ID',
          visibility: visibleWhenKind('magic_item'),
        },
      ],
    },
  ]
}

function isEquipmentGroupField(item: FormItem): item is Extract<FormItem, { kind: 'group' }> {
  return 'kind' in item && item.kind === 'group'
}

function buildEquipmentFields(ctx: ContentFormCtx): FormItem[] {
  const fields = buildUnscopedEquipmentFields()
  if (!ctx.equipmentKind) return fields

  const activeLegend = EQUIPMENT_KIND_GROUP_LEGEND[ctx.equipmentKind]
  return fields.filter((item) => {
    if ('name' in item && item.name === 'kind') return false
    if (isEquipmentGroupField(item) && item.legend !== 'Identity' && item.legend !== 'Economy') {
      return item.legend === activeLegend
    }
    return true
  })
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
