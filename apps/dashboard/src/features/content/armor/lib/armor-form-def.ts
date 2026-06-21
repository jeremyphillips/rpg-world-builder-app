import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  ARMOR_MATERIALS,
  ARMOR_MATERIAL_ENTRIES,
  armorCategorySchema,
  armorMaterialSchema,
  createArmorInputSchema,
  currencySchema,
  slugSchema,
  type Armor,
  type CreateArmorInput,
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
import { finalizeContentInput, slugForInputParse } from '../../lib/content-form-key-helpers'
import { useArmor, armorQueryKey } from '../hooks/use-armor'

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const armorMaterialOptions = toOptions(
  ARMOR_MATERIALS,
  Object.fromEntries(ARMOR_MATERIALS.map((m) => [m, ARMOR_MATERIAL_ENTRIES[m].label])) as Record<
    (typeof ARMOR_MATERIALS)[number],
    string
  >,
)

function visibleWhenNotShield(): FieldVisibility {
  return {
    dependsOn: ['category'],
    visibleWhen: (v) => v.category !== 'shields' && v.category !== undefined && v.category !== '',
  }
}

function visibleWhenShield(): FieldVisibility {
  return {
    dependsOn: ['category'],
    visibleWhen: (v) => v.category === 'shields',
  }
}

function visibleWhenDexCap(): FieldVisibility {
  return {
    dependsOn: ['category', 'addDexModifier'],
    visibleWhen: (v) => v.category === 'medium' && v.addDexModifier === true,
  }
}

const armorFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  category: armorCategorySchema,
  cost: z.object({
    amount: z.coerce.number().int().min(0),
    currency: currencySchema,
  }),
  weight: z
    .object({
      value: z.coerce.number().min(0).optional(),
    })
    .optional(),
  material: armorMaterialSchema.optional(),
  baseAc: z.coerce.number().int().optional(),
  acBonus: z.coerce.number().int().optional(),
  addDexModifier: z.boolean(),
  maxDexBonus: z.coerce.number().int().optional(),
  stealthDisadvantage: z.boolean(),
  strengthRequirement: z.coerce.number().int().optional(),
})

type ArmorFormValues = z.infer<typeof armorFormSchema>

function buildFields(): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Identity',
      fields: identityFields(),
    },
    {
      kind: 'group',
      legend: 'Classification',
      fields: [
        {
          type: 'select',
          name: 'category',
          label: 'Category',
          options: armorCategoryOptions,
          required: true,
        },
        {
          type: 'select',
          name: 'material',
          label: 'Material',
          options: armorMaterialOptions,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Economy',
      fields: [...costFields(), ...optionalWeightFields()],
    },
    {
      kind: 'group',
      legend: 'Armor class',
      fields: [
        {
          type: 'number',
          name: 'baseAc',
          label: 'Base AC',
          min: 0,
          visibility: visibleWhenNotShield(),
          required: true,
        },
        {
          type: 'number',
          name: 'acBonus',
          label: 'AC bonus',
          visibility: visibleWhenShield(),
          required: true,
        },
        {
          type: 'switch',
          name: 'addDexModifier',
          label: 'Add Dex modifier',
          visibility: visibleWhenNotShield(),
        },
        {
          type: 'number',
          name: 'maxDexBonus',
          label: 'Max Dex bonus',
          min: 0,
          visibility: visibleWhenDexCap(),
        },
        {
          type: 'switch',
          name: 'stealthDisadvantage',
          label: 'Stealth disadvantage',
        },
        {
          type: 'number',
          name: 'strengthRequirement',
          label: 'Strength requirement',
          min: 0,
          hint: 'Minimum Strength to avoid speed penalty (heavy armor)',
        },
      ],
    },
  ]
}

function optionalAcFields(values: ArmorFormValues): Partial<CreateArmorInput> {
  if (values.category === 'shields') {
    return values.acBonus !== undefined ? { acBonus: values.acBonus } : {}
  }
  return values.baseAc !== undefined ? { baseAc: values.baseAc } : {}
}

function toInput(values: ArmorFormValues, ctx?: ContentFormInputCtx<Armor>): CreateArmorInput {
  const weight = weightFromForm(values.weight?.value)
  const input = createArmorInputSchema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    category: values.category,
    cost: values.cost,
    addDexModifier: values.addDexModifier,
    stealthDisadvantage: values.stealthDisadvantage,
    ...(weight && { weight }),
    ...(values.material && { material: values.material }),
    ...optionalAcFields(values),
    ...(values.maxDexBonus !== undefined && { maxDexBonus: values.maxDexBonus }),
    ...(values.strengthRequirement !== undefined && {
      strengthRequirement: values.strengthRequirement,
    }),
  })
  return finalizeContentInput(input, ctx) as CreateArmorInput
}

const armorFormDef: ContentFormDef<Armor, ArmorFormValues, CreateArmorInput> = {
  routeKey: 'armor',
  schema: armorFormSchema,
  coverage: 'structural',
  createDefaultValues: {
    category: 'light',
    cost: costToFormDefaults(),
    addDexModifier: true,
    stealthDisadvantage: false,
  },
  buildFields: () => buildFields(),
  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    category: entity.category,
    cost: entity.cost,
    weight: entity.weight ? { value: entity.weight.value } : undefined,
    material: entity.material,
    baseAc: entity.baseAc,
    acBonus: entity.acBonus,
    addDexModifier: entity.addDexModifier,
    maxDexBonus: entity.maxDexBonus,
    stealthDisadvantage: entity.stealthDisadvantage,
    strengthRequirement: entity.strengthRequirement,
  }),
  toInput,
  useListQuery: useArmor,
  queryKey: armorQueryKey,
}

contentFormRegistry['armor'] = armorFormDef

export { armorFormDef, armorFormSchema }
export type { ArmorFormValues }
