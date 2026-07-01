import { z } from 'zod'
import {
  choiceOptionTitle,
  GEAR_KIND_ENTRIES,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  spellcastingFocusGearKindSchema,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  toolCategorySchema,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  wealthGrantMoneyField,
  wealthGrantMoneyFromForm,
} from '../../../lib/forms/fields/content-economy-form-fields'
import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import {
  STARTING_EQUIPMENT_ITEM_KIND_LABELS,
  STARTING_EQUIPMENT_OPTION_DESCRIPTION_HINT,
} from './class-starting-equipment-form-labels'

export const STARTING_EQUIPMENT_ITEM_KINDS = ['fixed', 'choice'] as const

export const STARTING_EQUIPMENT_OPTIONS_FIELD_NAME =
  'characterCreation.startingEquipment.options' as const

export const STARTING_EQUIPMENT_FIELD_NAME = 'characterCreation.startingEquipment' as const

const itemKindOptions = toOptions(
  STARTING_EQUIPMENT_ITEM_KINDS,
  STARTING_EQUIPMENT_ITEM_KIND_LABELS,
)

const focusKindOptions = toOptions(
  SPELLCASTING_FOCUS_GEAR_KINDS,
  Object.fromEntries(
    SPELLCASTING_FOCUS_GEAR_KINDS.map((kind) => [kind, GEAR_KIND_ENTRIES[kind].label]),
  ) as Record<(typeof SPELLCASTING_FOCUS_GEAR_KINDS)[number], string>,
)

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(
    TOOL_CATEGORIES.map((category) => [category, TOOL_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof TOOL_CATEGORIES)[number], string>,
)

const wealthGrantMoneyFormSchema = z.object({
  amount: z.coerce.number().int().min(0).default(0),
  currency: z.enum(['cp', 'sp', 'gp', 'pp']).default('gp'),
})

export const startingEquipmentModifierFormSchema = z.object({
  kind: z.literal('spellcasting_focus'),
  focusKind: spellcastingFocusGearKindSchema,
})

export type StartingEquipmentModifierForm = z.infer<typeof startingEquipmentModifierFormSchema>

export const startingEquipmentFixedItemFormSchema = z.object({
  itemKind: z.literal('fixed'),
  equipmentSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
  modifiers: z.array(startingEquipmentModifierFormSchema).optional(),
})

export const startingEquipmentChoiceItemFormSchema = z
  .object({
    itemKind: z.literal('choice'),
    label: z.string().min(1),
    choose: z.coerce.number().int().min(1).default(1),
    fromEquipmentSlugs: z.array(z.string().min(1)).optional(),
    fromToolCategories: z.array(toolCategorySchema).optional(),
  })
  .superRefine((row, ctx) => {
    if (!row.fromEquipmentSlugs?.length && !row.fromToolCategories?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Pool choices require equipment slugs and/or tool categories',
        path: ['fromEquipmentSlugs'],
      })
    }
  })

export const startingEquipmentItemFormSchema = z.discriminatedUnion('itemKind', [
  startingEquipmentFixedItemFormSchema,
  startingEquipmentChoiceItemFormSchema,
])

export type StartingEquipmentItemForm = z.infer<typeof startingEquipmentItemFormSchema>

export const startingEquipmentOptionFormSchema = z
  .object({
    id: z.string().min(1).optional(),
    label: z.string().min(1),
    description: z.string().optional(),
    wealth: wealthGrantMoneyFormSchema.optional(),
    items: z.array(startingEquipmentItemFormSchema),
  })
  .superRefine((row, ctx) => {
    if (!row.items.length && !wealthGrantMoneyFromForm(row.wealth)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Packages with no items require a wealth grant',
        path: ['wealth', 'amount'],
      })
    }
  })

export type StartingEquipmentOptionForm = z.infer<typeof startingEquipmentOptionFormSchema>

export const startingEquipmentFormSchema = z.object({
  choose: z.coerce.number().int().min(1).default(1),
  options: z.array(startingEquipmentOptionFormSchema).min(1),
})

export type StartingEquipmentForm = z.infer<typeof startingEquipmentFormSchema>

function visibleForItemKind(
  itemKind: (typeof STARTING_EQUIPMENT_ITEM_KINDS)[number],
): FieldVisibility {
  return {
    dependsOn: ['itemKind'],
    visibleWhen: (watched) => watched['itemKind'] === itemKind,
  }
}

export function startingEquipmentOptionTitle(
  row: Pick<StartingEquipmentOptionForm, 'id' | 'label'> | undefined,
): string {
  if (!row) return ''
  return choiceOptionTitle({ id: row.id ?? '', label: row.label })
}

export function startingEquipmentItemTitle(
  row: StartingEquipmentItemForm | undefined,
  index: number,
  equipmentOptions: FieldOption[] = [],
): string {
  if (!row) return `Item ${index + 1}`

  if (row.itemKind === 'fixed') {
    const label = equipmentOptions?.find((option) => option.value === row.equipmentSlug)?.label
    const name = label ?? row.equipmentSlug ?? `Item ${index + 1}`
    const quantity = row.quantity ?? 1
    return quantity > 1 ? `${name} x${quantity}` : name
  }

  return row.label || `Pool choice ${index + 1}`
}

export function startingEquipmentModifierFields(): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'modifiers',
      legend: 'Modifiers',
      addLabel: 'Add modifier',
      visibility: visibleForItemKind('fixed'),
      itemHeader: {
        fallback: () => 'Modifier',
        primary: (values) => {
          const row = values as StartingEquipmentModifierForm | undefined
          if (row?.focusKind) {
            return GEAR_KIND_ENTRIES[row.focusKind].label
          }
          return undefined
        },
      },
      fields: [
        {
          type: 'select',
          name: 'kind',
          label: 'Modifier kind',
          options: [{ value: 'spellcasting_focus', label: 'Spellcasting focus' }],
          required: true,
          defaultValue: 'spellcasting_focus',
        },
        {
          type: 'select',
          name: 'focusKind',
          label: 'Focus kind',
          options: focusKindOptions,
          required: true,
        },
      ],
    },
  ]
}

export function startingEquipmentChooseFields(): FormItem[] {
  return [
    {
      type: 'inlineChooseCount',
      name: 'choose',
      label: 'Packages to choose',
      hideLabel: true,
      prefix: 'Character can choose',
      suffix: 'package(s) from list',
      chooseMin: 1,
      defaultValue: 1,
    },
  ]
}

export function startingEquipmentItemFields(ctx: ContentFormCtx): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []

  return [
    {
      type: 'select',
      name: 'itemKind',
      label: 'Item kind',
      options: itemKindOptions,
      required: true,
      defaultValue: 'fixed',
    },
    {
      kind: 'row',
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
          visibility: visibleForItemKind('fixed'),
        },
        {
          type: 'number',
          name: 'quantity',
          label: 'Quantity',
          min: 1,
          defaultValue: 1,
          width: 'auto',
          digits: 2,
          visibility: visibleForItemKind('fixed'),
        },
      ],
    },
    {
      type: 'switch',
      name: 'equipped',
      label: 'Equipped',
      visibility: visibleForItemKind('fixed'),
    },
    ...startingEquipmentModifierFields(),
    {
      type: 'text',
      name: 'label',
      label: 'Choice label',
      required: true,
      visibility: visibleForItemKind('choice'),
    },
    {
      type: 'number',
      name: 'choose',
      label: 'Number to choose',
      min: 1,
      defaultValue: 1,
      visibility: visibleForItemKind('choice'),
      digits: 1,
    },
    {
      type: 'combobox',
      name: 'fromEquipmentSlugs',
      label: 'Equipment pool',
      multiple: true,
      options: equipmentOptions,
      placeholder: 'Choose equipment…',
      visibility: visibleForItemKind('choice'),
    },
    {
      type: 'chips',
      name: 'fromToolCategories',
      label: 'Tool categories',
      options: toolCategoryOptions,
      visibility: visibleForItemKind('choice'),
    },
  ]
}

export function startingEquipmentOptionItemFields(ctx: ContentFormCtx): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []

  return [
    {
      type: 'text',
      name: 'label',
      label: 'Label',
      required: true,
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      hint: STARTING_EQUIPMENT_OPTION_DESCRIPTION_HINT,
    },
    ...wealthGrantMoneyField('wealth'),
    {
      kind: 'array',
      name: 'items',
      legend: 'Items',
      addLabel: 'Add item',
      itemVariant: 'detailed',
      itemCollapsible: true,
      itemHeader: {
        fallback: (index) => `Item ${index + 1}`,
        primary: (values, index) =>
          startingEquipmentItemTitle(
            values as StartingEquipmentItemForm | undefined,
            index,
            equipmentOptions,
          ),
      },
      fields: startingEquipmentItemFields(ctx),
    },
  ]
}
