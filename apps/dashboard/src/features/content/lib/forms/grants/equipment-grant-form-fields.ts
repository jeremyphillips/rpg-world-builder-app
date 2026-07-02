import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  defineMessage,
  EQUIPMENT_KIND_LABELS,
  EQUIPMENT_KINDS,
  GEAR_KIND_ENTRIES,
  GEAR_KINDS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  toolCategorySchema,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  weaponCategorySchema,
  armorCategorySchema,
  equipmentKindSchema,
  gearKindSchema,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'
import {
  EQUIPMENT_GRANT_ITEM_KIND_LABELS,
  EQUIPMENT_POOL_SOURCE_LABELS,
} from './equipment-grant-form-labels'

/** Equipment grant validation messages (tier 3 form overrides). */
export const equipmentGrantValidationMessages = {
  fixedEquipmentRequired: defineMessage(
    'validation.equipmentGrant.fixedEquipmentRequired',
    () => 'Specific items require equipment',
    () => 'Missing equipment',
  ),
  explicitPoolSlugsRequired: defineMessage(
    'validation.equipmentGrant.explicitPoolSlugsRequired',
    () => 'Specific item lists require at least one equipment item',
    () => 'Missing pool equipment',
  ),
  filteredPoolKindRequired: defineMessage(
    'validation.equipmentGrant.filteredPoolKindRequired',
    () => 'Filtered pools require an equipment type',
    () => 'Missing equipment type',
  ),
}

export const EQUIPMENT_GRANT_ITEM_KINDS = ['fixed', 'choice'] as const

export const EQUIPMENT_POOL_SOURCES = ['explicit', 'filtered'] as const

const itemKindOptions = toOptions(EQUIPMENT_GRANT_ITEM_KINDS, EQUIPMENT_GRANT_ITEM_KIND_LABELS)

const poolSourceOptions = toOptions(EQUIPMENT_POOL_SOURCES, EQUIPMENT_POOL_SOURCE_LABELS)

const equipmentKindOptions = toOptions(
  EQUIPMENT_KINDS,
  EQUIPMENT_KIND_LABELS as Record<(typeof EQUIPMENT_KINDS)[number], string>,
)

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(
    TOOL_CATEGORIES.map((category) => [category, TOOL_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof TOOL_CATEGORIES)[number], string>,
)

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(
    WEAPON_CATEGORIES.map((category) => [category, WEAPON_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof WEAPON_CATEGORIES)[number], string>,
)

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(
    ARMOR_CATEGORIES.map((category) => [category, ARMOR_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof ARMOR_CATEGORIES)[number], string>,
)

const gearKindOptions = toOptions(
  GEAR_KINDS,
  Object.fromEntries(GEAR_KINDS.map((kind) => [kind, GEAR_KIND_ENTRIES[kind].label])) as Record<
    (typeof GEAR_KINDS)[number],
    string
  >,
)

export const equipmentGrantFixedItemFormSchema = z.object({
  itemKind: z.literal('fixed'),
  equipmentSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
})

export const equipmentGrantChoiceItemFormSchema = z
  .object({
    itemKind: z.literal('choice'),
    label: z.string().min(1),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(EQUIPMENT_POOL_SOURCES).default('filtered'),
    poolEquipmentSlugs: z.array(z.string().min(1)).optional(),
    poolEquipmentKind: equipmentKindSchema.optional(),
    poolToolCategories: z.array(toolCategorySchema).optional(),
    poolWeaponCategories: z.array(weaponCategorySchema).optional(),
    poolArmorCategories: z.array(armorCategorySchema).optional(),
    poolGearKinds: z.array(gearKindSchema).optional(),
  })
  .superRefine((row, ctx) => {
    if (row.poolSource === 'explicit') {
      if (!row.poolEquipmentSlugs?.length) {
        ctx.addIssue({
          code: 'custom',
          message: equipmentGrantValidationMessages.explicitPoolSlugsRequired(),
          path: ['poolEquipmentSlugs'],
        })
      }
      return
    }

    if (!row.poolEquipmentKind) {
      ctx.addIssue({
        code: 'custom',
        message: equipmentGrantValidationMessages.filteredPoolKindRequired(),
        path: ['poolEquipmentKind'],
      })
    }
  })

export const equipmentGrantItemFormSchema = z.discriminatedUnion('itemKind', [
  equipmentGrantFixedItemFormSchema,
  equipmentGrantChoiceItemFormSchema,
])

export type EquipmentGrantItemForm = z.infer<typeof equipmentGrantItemFormSchema>

export type EquipmentGrantFixedItemForm = Extract<EquipmentGrantItemForm, { itemKind: 'fixed' }>

export type EquipmentGrantChoiceItemForm = Extract<EquipmentGrantItemForm, { itemKind: 'choice' }>

function visibleForItemKind(
  itemKind: (typeof EQUIPMENT_GRANT_ITEM_KINDS)[number],
): FieldVisibility {
  return {
    dependsOn: ['itemKind'],
    visibleWhen: (watched) => watched['itemKind'] === itemKind,
  }
}

function visibleForChoicePoolSource(
  poolSource: (typeof EQUIPMENT_POOL_SOURCES)[number],
): FieldVisibility {
  return {
    dependsOn: ['itemKind', 'poolSource'],
    visibleWhen: (watched) =>
      watched['itemKind'] === 'choice' && watched['poolSource'] === poolSource,
  }
}

function visibleForFilteredEquipmentKind(
  equipmentKind: (typeof EQUIPMENT_KINDS)[number],
): FieldVisibility {
  return {
    dependsOn: ['itemKind', 'poolSource', 'poolEquipmentKind'],
    visibleWhen: (watched) =>
      watched['itemKind'] === 'choice' &&
      watched['poolSource'] === 'filtered' &&
      watched['poolEquipmentKind'] === equipmentKind,
  }
}

export function fixedEquipmentGrantFields(ctx: ContentFormCtx): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []

  return [
    {
      kind: 'row',
      visibility: visibleForItemKind('fixed'),
      fields: [
        {
          type: 'combobox',
          name: 'equipmentSlug',
          label: 'Equipment',
          options: equipmentOptions,
          multiple: false,
          placeholder: 'Choose equipment…',
          required: true,
          width: 'full',
        },
        {
          type: 'number',
          name: 'quantity',
          label: 'Quantity',
          min: 1,
          defaultValue: 1,
          width: 'auto',
          digits: 2,
        },
      ],
    },
    {
      type: 'switch',
      name: 'equipped',
      label: 'Equipped',
      visibility: visibleForItemKind('fixed'),
    },
  ]
}

export function equipmentChoiceGrantFields(ctx: ContentFormCtx): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []

  return [
    {
      type: 'text',
      name: 'label',
      label: 'Choice label',
      required: true,
      visibility: visibleForItemKind('choice'),
    },
    {
      type: 'inlineChooseCount',
      name: 'choose',
      label: '',
      min: 1,
      prefix: 'Character can choose',
      suffix: 'from equipment pool:',
      defaultValue: 1,
      digits: 1,
      visibility: visibleForItemKind('choice'),
    },
    {
      type: 'select',
      name: 'poolSource',
      label: 'Pool source',
      options: poolSourceOptions,
      required: true,
      defaultValue: 'filtered',
      visibility: visibleForItemKind('choice'),
    },
    {
      type: 'combobox',
      name: 'poolEquipmentSlugs',
      label: 'Equipment',
      multiple: true,
      options: equipmentOptions,
      placeholder: 'Choose equipment…',
      visibility: visibleForChoicePoolSource('explicit'),
    },
    {
      type: 'select',
      name: 'poolEquipmentKind',
      label: 'Equipment type',
      options: equipmentKindOptions,
      required: true,
      visibility: visibleForChoicePoolSource('filtered'),
    },
    {
      type: 'chips',
      name: 'poolToolCategories',
      label: 'Tool categories',
      options: toolCategoryOptions,
      visibility: visibleForFilteredEquipmentKind('tool'),
    },
    {
      type: 'chips',
      name: 'poolWeaponCategories',
      label: 'Weapon categories',
      options: weaponCategoryOptions,
      visibility: visibleForFilteredEquipmentKind('weapon'),
    },
    {
      type: 'chips',
      name: 'poolArmorCategories',
      label: 'Armor categories',
      options: armorCategoryOptions,
      visibility: visibleForFilteredEquipmentKind('armor'),
    },
    {
      type: 'chips',
      name: 'poolGearKinds',
      label: 'Gear kinds',
      options: gearKindOptions,
      visibility: visibleForFilteredEquipmentKind('adventuring_gear'),
    },
  ]
}

export type EquipmentGrantItemFieldsOptions = {
  extraFields?: FormItem[]
}

export function equipmentGrantItemFields(
  ctx: ContentFormCtx,
  opts: EquipmentGrantItemFieldsOptions = {},
): FormItem[] {
  return [
    {
      type: 'select',
      name: 'itemKind',
      label: 'Granted item',
      options: itemKindOptions,
      required: true,
      defaultValue: 'fixed',
    },
    ...fixedEquipmentGrantFields(ctx),
    ...(opts.extraFields ?? []),
    ...equipmentChoiceGrantFields(ctx),
  ]
}
