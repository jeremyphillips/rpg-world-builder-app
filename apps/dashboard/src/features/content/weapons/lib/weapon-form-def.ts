import { z } from 'zod'
import {
  createWeaponInputSchema,
  currencySchema,
  DIE_FACES,
  dieFaceSchema,
  PHYSICAL_DAMAGE_TYPE_IDS,
  slugSchema,
  weaponCategorySchema,
  weaponDamageTypeSchema,
  weaponMasterySchema,
  weaponModeSchema,
  weaponPropertySchema,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  WEAPON_MASTERIES,
  WEAPON_MASTERY_ENTRIES,
  WEAPON_MODES,
  WEAPON_MODE_ENTRIES,
  WEAPON_PROPERTIES,
  WEAPON_PROPERTY_ENTRIES,
  type CreateWeaponInput,
  type Weapon,
  type WeaponDamage,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  costFields,
  costToFormDefaults,
  identityFields,
  optionalWeightFields,
  weightFromForm,
} from '../../lib/content-form-field-helpers'
import {
  contentFormRegistry,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { envelopeSlugFields, finalizeContentInput } from '../../lib/content-form-key-helpers'
import { useWeapons, weaponsQueryKey } from '../hooks/use-weapons'

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(WEAPON_CATEGORIES.map((c) => [c, WEAPON_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof WEAPON_CATEGORIES)[number],
    string
  >,
)

const weaponModeOptions = toOptions(
  WEAPON_MODES,
  Object.fromEntries(WEAPON_MODES.map((m) => [m, WEAPON_MODE_ENTRIES[m].label])) as Record<
    (typeof WEAPON_MODES)[number],
    string
  >,
)

const weaponMasteryOptions = toOptions(
  WEAPON_MASTERIES,
  Object.fromEntries(WEAPON_MASTERIES.map((m) => [m, WEAPON_MASTERY_ENTRIES[m].label])) as Record<
    (typeof WEAPON_MASTERIES)[number],
    string
  >,
)

const weaponPropertyOptions = toOptions(
  WEAPON_PROPERTIES,
  Object.fromEntries(WEAPON_PROPERTIES.map((p) => [p, WEAPON_PROPERTY_ENTRIES[p].label])) as Record<
    (typeof WEAPON_PROPERTIES)[number],
    string
  >,
)

const damageTypeOptions = toOptions(
  PHYSICAL_DAMAGE_TYPE_IDS,
  Object.fromEntries(PHYSICAL_DAMAGE_TYPE_IDS.map((d) => [d, d])) as Record<
    (typeof PHYSICAL_DAMAGE_TYPE_IDS)[number],
    string
  >,
)

const dieFaceOptions = DIE_FACES.map((f) => ({ value: String(f), label: `d${f}` }))

const damageKindOptions = [
  { value: 'dice', label: 'Dice' },
  { value: 'flat', label: 'Flat amount' },
]

function visibleWhenHasDamage(): FieldVisibility {
  return {
    dependsOn: ['hasDamage'],
    visibleWhen: (v) => v.hasDamage === true,
  }
}

function visibleWhenDiceDamage(): FieldVisibility {
  return {
    dependsOn: ['hasDamage', 'damageKind'],
    visibleWhen: (v) => v.hasDamage === true && v.damageKind === 'dice',
  }
}

function visibleWhenFlatDamage(): FieldVisibility {
  return {
    dependsOn: ['hasDamage', 'damageKind'],
    visibleWhen: (v) => v.hasDamage === true && v.damageKind === 'flat',
  }
}

function visibleWhenVersatile(): FieldVisibility {
  return {
    dependsOn: ['properties'],
    visibleWhen: (v) => Array.isArray(v.properties) && v.properties.includes('versatile'),
  }
}

function visibleWhenRanged(): FieldVisibility {
  return {
    dependsOn: ['mode'],
    visibleWhen: (v) => v.mode === 'ranged',
  }
}

const weaponFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  category: weaponCategorySchema,
  mode: weaponModeSchema,
  cost: z.object({
    amount: z.coerce.number().int().min(0),
    currency: currencySchema,
  }),
  weight: z.object({ value: z.coerce.number().min(0).optional() }).optional(),
  hasDamage: z.boolean(),
  damageKind: z.enum(['dice', 'flat']).optional(),
  damageCount: z.coerce.number().int().min(1).optional(),
  damageFaces: z.coerce.number().optional(),
  damageAmount: z.coerce.number().int().min(1).optional(),
  damageType: weaponDamageTypeSchema.optional(),
  versatileCount: z.coerce.number().int().min(1).optional(),
  versatileFaces: z.coerce.number().optional(),
  properties: z.array(weaponPropertySchema),
  mastery: weaponMasterySchema,
  rangeNormal: z.coerce.number().int().min(0).optional(),
  rangeLong: z.coerce.number().int().min(0).optional(),
  specialRules: z.string().optional(),
})

type WeaponFormValues = z.infer<typeof weaponFormSchema>

function damageToForm(
  damage: WeaponDamage | undefined,
): Pick<
  WeaponFormValues,
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

function damageFromForm(values: WeaponFormValues): WeaponDamage | undefined {
  if (!values.hasDamage) return undefined
  if (values.damageKind === 'flat') {
    return values.damageAmount !== undefined
      ? { kind: 'flat', amount: values.damageAmount }
      : undefined
  }
  if (values.damageCount !== undefined && values.damageFaces !== undefined) {
    const faces = dieFaceSchema.parse(values.damageFaces)
    return { kind: 'dice', count: values.damageCount, faces }
  }
  return undefined
}

function optionalWeaponDamage(values: WeaponFormValues): Partial<CreateWeaponInput> {
  const damage = damageFromForm(values)
  if (!damage) return {}
  return {
    damage,
    ...(values.damageType && { damageType: values.damageType }),
  }
}

function optionalVersatileDamage(values: WeaponFormValues): Partial<CreateWeaponInput> {
  if (!values.properties.includes('versatile')) return {}
  if (values.versatileCount === undefined || values.versatileFaces === undefined) return {}
  return {
    versatileDamage: {
      kind: 'dice',
      count: values.versatileCount,
      faces: dieFaceSchema.parse(values.versatileFaces),
    },
  }
}

function optionalWeaponRange(values: WeaponFormValues): Partial<CreateWeaponInput> {
  if (values.rangeNormal === undefined) return {}
  return {
    range: {
      normal: values.rangeNormal,
      ...(values.rangeLong !== undefined && { long: values.rangeLong }),
    },
  }
}

function toInput(values: WeaponFormValues, ctx?: ContentFormInputCtx<Weapon>): CreateWeaponInput {
  const weight = weightFromForm(values.weight?.value)
  const input = createWeaponInputSchema.parse({
    ...envelopeSlugFields(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    category: values.category,
    mode: values.mode,
    cost: values.cost,
    properties: values.properties,
    mastery: values.mastery,
    ...(weight && { weight }),
    ...optionalWeaponDamage(values),
    ...optionalVersatileDamage(values),
    ...optionalWeaponRange(values),
    ...(values.specialRules && { specialRules: values.specialRules }),
  })
  return finalizeContentInput(input, ctx) as CreateWeaponInput
}

const weaponFormDef: ContentFormDef<Weapon, WeaponFormValues, CreateWeaponInput> = {
  routeKey: 'weapons',
  schema: weaponFormSchema,
  coverage: 'roundtrip-only',
  createDefaultValues: {
    category: 'simple',
    mode: 'melee',
    cost: costToFormDefaults(),
    hasDamage: true,
    damageKind: 'dice',
    damageCount: 1,
    damageFaces: 6,
    damageType: 'slashing',
    properties: [],
    mastery: 'cleave',
  },
  buildFields: (): FormItem[] => [
    { kind: 'group', legend: 'Identity', fields: identityFields() },
    {
      kind: 'group',
      legend: 'Classification',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'category',
              label: 'Category',
              options: weaponCategoryOptions,
              required: true,
            },
            {
              type: 'select',
              name: 'mode',
              label: 'Mode',
              options: weaponModeOptions,
              required: true,
            },
            {
              type: 'select',
              name: 'mastery',
              label: 'Mastery',
              options: weaponMasteryOptions,
              required: true,
            },
          ],
        },
        {
          type: 'chips',
          name: 'properties',
          label: 'Properties',
          options: weaponPropertyOptions,
        },
      ],
    },
    { kind: 'group', legend: 'Economy', fields: [...costFields(), ...optionalWeightFields()] },
    {
      kind: 'group',
      legend: 'Damage',
      fields: [
        { type: 'switch', name: 'hasDamage', label: 'Deals damage' },
        {
          type: 'select',
          name: 'damageKind',
          label: 'Damage kind',
          options: damageKindOptions,
          visibility: visibleWhenHasDamage(),
        },
        {
          type: 'select',
          name: 'damageType',
          label: 'Damage type',
          options: damageTypeOptions,
          visibility: visibleWhenHasDamage(),
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
              visibility: visibleWhenDiceDamage(),
              required: true,
            },
            {
              type: 'select',
              name: 'damageFaces',
              label: 'Die faces',
              options: dieFaceOptions,
              visibility: visibleWhenDiceDamage(),
              required: true,
            },
            {
              type: 'number',
              name: 'damageAmount',
              label: 'Flat damage',
              min: 1,
              visibility: visibleWhenFlatDamage(),
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
              visibility: visibleWhenVersatile(),
              required: true,
            },
            {
              type: 'select',
              name: 'versatileFaces',
              label: 'Versatile die faces',
              options: dieFaceOptions,
              visibility: visibleWhenVersatile(),
              required: true,
            },
          ],
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Range',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'rangeNormal',
              label: 'Normal range (ft.)',
              min: 0,
              visibility: visibleWhenRanged(),
            },
            {
              type: 'number',
              name: 'rangeLong',
              label: 'Long range (ft.)',
              min: 0,
              visibility: visibleWhenRanged(),
            },
          ],
        },
        {
          type: 'textarea',
          name: 'specialRules',
          label: 'Special rules',
          hint: 'Prose for the special property (lance, net, etc.)',
        },
      ],
    },
  ],
  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    category: entity.category,
    mode: entity.mode,
    cost: entity.cost,
    weight: entity.weight ? { value: entity.weight.value } : undefined,
    ...damageToForm(entity.damage),
    damageType: entity.damageType,
    versatileCount: entity.versatileDamage?.count,
    versatileFaces: entity.versatileDamage?.faces,
    properties: entity.properties,
    mastery: entity.mastery,
    rangeNormal: entity.range?.normal,
    rangeLong: entity.range?.long,
    specialRules: entity.specialRules,
  }),
  toInput,
  useListQuery: useWeapons,
  queryKey: weaponsQueryKey,
}

contentFormRegistry['weapons'] = weaponFormDef

export { weaponFormDef, weaponFormSchema }
export type { WeaponFormValues }
