import { z } from 'zod'
import {
  abilitySchema,
  ABILITIES,
  ABILITY_IDS,
  createEquipmentInputSchema,
  currencySchema,
  EQUIPMENT_KINDS,
  EQUIPMENT_KIND_LABELS,
  GEAR_CATEGORY_LABELS,
  focusTypeSchema,
  FOCUS_TYPE_LABELS,
  gearCategorySchema,
  slugSchema,
  toolCategorySchema,
  TOOL_CATEGORY_LABELS,
  type CreateEquipmentInput,
  type Equipment,
  type EquipmentKind,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  costFields,
  costToFormDefaults,
  identityFields,
  optionalWeightFields,
  weightFromForm,
} from '../../lib/content-form-field-helpers'
import { contentFormRegistry, type ContentFormDef } from '../../lib/content-form-registry'
import { useEquipment, equipmentQueryKey } from '../hooks/use-equipment'

const equipmentKindSchema = z.enum(EQUIPMENT_KINDS)

const equipmentKindOptions = toOptions(EQUIPMENT_KINDS, EQUIPMENT_KIND_LABELS)

const gearCategoryOptions = toOptions(
  Object.keys(GEAR_CATEGORY_LABELS) as [
    keyof typeof GEAR_CATEGORY_LABELS,
    ...Array<keyof typeof GEAR_CATEGORY_LABELS>,
  ],
  GEAR_CATEGORY_LABELS,
)
const focusTypeOptions = toOptions(
  Object.keys(FOCUS_TYPE_LABELS) as [
    keyof typeof FOCUS_TYPE_LABELS,
    ...Array<keyof typeof FOCUS_TYPE_LABELS>,
  ],
  FOCUS_TYPE_LABELS,
)
const toolCategoryOptions = toOptions(
  Object.keys(TOOL_CATEGORY_LABELS) as [
    keyof typeof TOOL_CATEGORY_LABELS,
    ...Array<keyof typeof TOOL_CATEGORY_LABELS>,
  ],
  TOOL_CATEGORY_LABELS,
)
const abilityOptions = toOptions(ABILITY_IDS, ABILITIES)

function visibleWhenKind(...kinds: EquipmentKind[]): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (v) => kinds.includes(v.kind as EquipmentKind),
  }
}

const equipmentFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
  description: z.string().optional(),
  kind: equipmentKindSchema,
  cost: z.object({
    amount: z.coerce.number().int().min(0),
    currency: currencySchema,
  }),
  weight: z.object({ value: z.coerce.number().min(0).optional() }).optional(),
  gearCategory: gearCategorySchema.optional(),
  propertiesText: z.string().optional(),
  capacity: z.string().optional(),
  bundleSize: z.coerce.number().int().min(1).optional(),
  storage: z.string().optional(),
  focusType: focusTypeSchema.optional(),
  toolCategory: toolCategorySchema.optional(),
  ability: abilitySchema.optional(),
  carryingCapacity: z.coerce.number().min(0).optional(),
  speed: z.string().optional(),
  vehicleCapacity: z.coerce.number().min(0).optional(),
  crew: z.coerce.number().int().min(0).optional(),
  passengers: z.coerce.number().int().min(0).optional(),
  cargoTons: z.coerce.number().min(0).optional(),
  ac: z.coerce.number().int().min(0).optional(),
  hp: z.coerce.number().int().min(0).optional(),
  damageThreshold: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
})

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>

function parseProperties(text: string | undefined): string[] | undefined {
  if (!text?.trim()) return undefined
  const items = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

function formatProperties(items: string[] | undefined): string | undefined {
  return items?.length ? items.join('\n') : undefined
}

type EquipmentInputBase = Pick<EquipmentFormValues, 'name' | 'slug' | 'description' | 'cost'>

function inputBase(values: EquipmentFormValues): EquipmentInputBase & { description?: string } {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description || undefined,
    cost: values.cost,
  }
}

function gearInput(values: EquipmentFormValues, weight: ReturnType<typeof weightFromForm>) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'gear',
    ...(weight && { weight }),
    ...(values.gearCategory && { gearCategory: values.gearCategory }),
    ...(parseProperties(values.propertiesText) && {
      properties: parseProperties(values.propertiesText),
    }),
    ...(values.capacity && { capacity: values.capacity }),
  })
}

function ammunitionInput(values: EquipmentFormValues, weight: ReturnType<typeof weightFromForm>) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'ammunition',
    ...(weight && { weight }),
    bundleSize: values.bundleSize ?? 1,
    storage: values.storage ?? '',
  })
}

function focusInput(values: EquipmentFormValues, weight: ReturnType<typeof weightFromForm>) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'focus',
    ...(weight && { weight }),
    focusType: values.focusType ?? 'arcane',
  })
}

function toolInput(values: EquipmentFormValues, weight: ReturnType<typeof weightFromForm>) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'tool',
    ...(weight && { weight }),
    toolCategory: values.toolCategory ?? 'other',
    ...(values.ability && { ability: values.ability }),
  })
}

function mountInput(values: EquipmentFormValues) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'mount',
    carryingCapacity: { value: values.carryingCapacity ?? 0, unit: 'lb' },
    ...(values.speed && { speed: values.speed }),
  })
}

function vehicleInput(values: EquipmentFormValues, weight: ReturnType<typeof weightFromForm>) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'vehicle',
    ...(weight && { weight }),
    ...(values.vehicleCapacity !== undefined && {
      capacity: { value: values.vehicleCapacity, unit: 'lb' },
    }),
  })
}

function shipInput(values: EquipmentFormValues) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'ship',
    ...(values.speed && { speed: values.speed }),
    ...(values.crew !== undefined && { crew: values.crew }),
    ...(values.passengers !== undefined && { passengers: values.passengers }),
    ...(values.cargoTons !== undefined && { cargoTons: values.cargoTons }),
    ...(values.ac !== undefined && { ac: values.ac }),
    ...(values.hp !== undefined && { hp: values.hp }),
    ...(values.damageThreshold !== undefined && { damageThreshold: values.damageThreshold }),
  })
}

function miscInput(values: EquipmentFormValues, weight: ReturnType<typeof weightFromForm>) {
  return createEquipmentInputSchema.parse({
    ...inputBase(values),
    kind: 'misc',
    ...(weight && { weight }),
    ...(values.notes && { notes: values.notes }),
  })
}

const kindInputBuilders: Record<
  EquipmentKind,
  (values: EquipmentFormValues, weight: ReturnType<typeof weightFromForm>) => CreateEquipmentInput
> = {
  gear: gearInput,
  ammunition: ammunitionInput,
  focus: focusInput,
  tool: toolInput,
  mount: (values) => mountInput(values),
  vehicle: vehicleInput,
  ship: (values) => shipInput(values),
  misc: miscInput,
}

function toInput(values: EquipmentFormValues): CreateEquipmentInput {
  const weight = weightFromForm(values.weight?.value)
  return kindInputBuilders[values.kind](values, weight)
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
    weight: 'weight' in entity && entity.weight ? { value: entity.weight.value } : undefined,
  }
}

type KindFormExtractor = (entity: Equipment) => Partial<EquipmentFormValues>

const kindFormValueExtractors: Record<EquipmentKind, KindFormExtractor> = {
  gear: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'gear' }>
    return {
      gearCategory: item.gearCategory,
      propertiesText: formatProperties(item.properties),
      capacity: item.capacity,
    }
  },
  ammunition: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'ammunition' }>
    return { bundleSize: item.bundleSize, storage: item.storage }
  },
  focus: (entity) => ({ focusType: (entity as Extract<Equipment, { kind: 'focus' }>).focusType }),
  tool: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'tool' }>
    return { toolCategory: item.toolCategory, ability: item.ability }
  },
  mount: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'mount' }>
    return { carryingCapacity: item.carryingCapacity.value, speed: item.speed }
  },
  vehicle: (entity) => ({
    vehicleCapacity: (entity as Extract<Equipment, { kind: 'vehicle' }>).capacity?.value,
  }),
  ship: (entity) => {
    const item = entity as Extract<Equipment, { kind: 'ship' }>
    return {
      speed: item.speed,
      crew: item.crew,
      passengers: item.passengers,
      cargoTons: item.cargoTons,
      ac: item.ac,
      hp: item.hp,
      damageThreshold: item.damageThreshold,
    }
  },
  misc: (entity) => ({ notes: (entity as Extract<Equipment, { kind: 'misc' }>).notes }),
}

function kindFormValues(entity: Equipment): Partial<EquipmentFormValues> {
  return kindFormValueExtractors[entity.kind](entity)
}

const equipmentFormDef: ContentFormDef<Equipment, EquipmentFormValues, CreateEquipmentInput> = {
  routeKey: 'equipment',
  schema: equipmentFormSchema,
  coverage: 'roundtrip-only',
  createDefaultValues: {
    kind: 'gear',
    cost: costToFormDefaults(),
  },
  buildFields: (): FormItem[] => [
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
      legend: 'Gear',
      fields: [
        {
          type: 'select',
          name: 'gearCategory',
          label: 'Gear category',
          options: gearCategoryOptions,
          visibility: visibleWhenKind('gear'),
        },
        {
          type: 'textarea',
          name: 'propertiesText',
          label: 'Properties',
          hint: 'One mechanical note per line',
          visibility: visibleWhenKind('gear'),
        },
        {
          type: 'text',
          name: 'capacity',
          label: 'Capacity',
          visibility: visibleWhenKind('gear'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Ammunition',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'bundleSize',
              label: 'Bundle size',
              min: 1,
              visibility: visibleWhenKind('ammunition'),
              required: true,
            },
            {
              type: 'text',
              name: 'storage',
              label: 'Storage',
              visibility: visibleWhenKind('ammunition'),
              required: true,
            },
          ],
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Focus',
      fields: [
        {
          type: 'select',
          name: 'focusType',
          label: 'Focus type',
          options: focusTypeOptions,
          visibility: visibleWhenKind('focus'),
          required: true,
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
          visibility: visibleWhenKind('mount', 'ship'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Vehicle',
      fields: [
        {
          type: 'number',
          name: 'vehicleCapacity',
          label: 'Cargo capacity (lb)',
          min: 0,
          visibility: visibleWhenKind('vehicle'),
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Ship',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'crew',
              label: 'Crew',
              min: 0,
              visibility: visibleWhenKind('ship'),
            },
            {
              type: 'number',
              name: 'passengers',
              label: 'Passengers',
              min: 0,
              visibility: visibleWhenKind('ship'),
            },
            {
              type: 'number',
              name: 'cargoTons',
              label: 'Cargo (tons)',
              min: 0,
              visibility: visibleWhenKind('ship'),
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
              visibility: visibleWhenKind('ship'),
            },
            {
              type: 'number',
              name: 'hp',
              label: 'HP',
              min: 0,
              visibility: visibleWhenKind('ship'),
            },
            {
              type: 'number',
              name: 'damageThreshold',
              label: 'Damage threshold',
              min: 0,
              visibility: visibleWhenKind('ship'),
            },
          ],
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Miscellaneous',
      fields: [
        {
          type: 'textarea',
          name: 'notes',
          label: 'Notes',
          visibility: visibleWhenKind('misc'),
        },
      ],
    },
  ],
  toFormValues: (entity) => ({
    ...sharedFormValues(entity),
    ...kindFormValues(entity),
  }),
  toInput,
  useListQuery: useEquipment,
  queryKey: equipmentQueryKey,
}

contentFormRegistry['equipment'] = equipmentFormDef

export { equipmentFormDef, equipmentFormSchema }
export type { EquipmentFormValues }
