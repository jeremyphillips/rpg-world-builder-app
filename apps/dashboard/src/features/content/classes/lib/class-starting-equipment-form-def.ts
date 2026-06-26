import { z } from 'zod'
import {
  choiceOptionTitle,
  GEAR_KIND_ENTRIES,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  spellcastingFocusGearKindSchema,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  toolCategorySchema,
  type StartingEquipmentChoice,
  type StartingEquipmentFixedItem,
  type StartingEquipmentItem,
  type StartingEquipmentItemChoice,
  type StartingEquipmentOption,
} from '@rpg/contracts'
import {
  buildItemDefaultValues,
  toOptions,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import {
  wealthGrantMoneyField,
  wealthGrantMoneyFromForm,
  wealthGrantMoneyToForm,
} from '../../lib/content-form-field-helpers'
import { applyStableIdsForChoiceOptions } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'

export const STARTING_EQUIPMENT_ITEM_KINDS = ['fixed', 'choice'] as const

export const STARTING_EQUIPMENT_ITEM_KIND_LABELS = {
  fixed: 'Fixed item',
  choice: 'Pool choice',
} as const satisfies Record<(typeof STARTING_EQUIPMENT_ITEM_KINDS)[number], string>

export const STARTING_EQUIPMENT_OPTION_DESCRIPTION_HINT =
  'For cross-references tied to another proficiency pick (e.g. Monk tool/instrument), describe the choice in prose and include FOLLOWUP: proficiencyLinkedChoice when structured support is deferred.'

export const ADD_STARTING_EQUIPMENT_LABEL = 'Add starting equipment'
export const STARTING_EQUIPMENT_EMPTY_MESSAGE =
  'No starting equipment yet. Add packages players choose from at character creation.'
export const STARTING_EQUIPMENT_OPTION_NOUN = 'package'
export const ADD_STARTING_EQUIPMENT_OPTION_LABEL = 'Add package'
export const REMOVE_STARTING_EQUIPMENT_LABEL = 'Remove starting equipment'

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
    return label ?? row.equipmentSlug ?? `Item ${index + 1}`
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
      itemTitle: (values) => {
        const row = values as StartingEquipmentModifierForm | undefined
        if (row?.focusKind) {
          return GEAR_KIND_ENTRIES[row.focusKind].label
        }
        return 'Modifier'
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
      itemTitle: (values, index) =>
        startingEquipmentItemTitle(
          values as StartingEquipmentItemForm | undefined,
          index,
          equipmentOptions,
        ),
      fields: startingEquipmentItemFields(ctx),
    },
  ]
}

function fixedItemToFormRow(item: StartingEquipmentFixedItem): StartingEquipmentItemForm {
  return {
    itemKind: 'fixed',
    equipmentSlug: item.equipmentSlug,
    quantity: item.quantity,
    equipped: item.equipped,
    modifiers: item.modifiers?.map((modifier) => ({
      kind: modifier.kind,
      focusKind: modifier.focusKind,
    })),
  }
}

function choiceItemToFormRow(item: StartingEquipmentItemChoice): StartingEquipmentItemForm {
  return {
    itemKind: 'choice',
    label: item.label,
    choose: item.choose,
    fromEquipmentSlugs: item.from.equipmentSlugs,
    fromToolCategories: item.from.toolCategories,
  }
}

function startingEquipmentItemToFormRow(item: StartingEquipmentItem): StartingEquipmentItemForm {
  return item.kind === 'fixed' ? fixedItemToFormRow(item) : choiceItemToFormRow(item)
}

function fixedItemFromFormRow(
  row: z.infer<typeof startingEquipmentFixedItemFormSchema>,
): StartingEquipmentFixedItem {
  const item: StartingEquipmentFixedItem = {
    kind: 'fixed',
    equipmentSlug: row.equipmentSlug,
    quantity: row.quantity ?? 1,
  }
  if (row.equipped !== undefined) {
    item.equipped = row.equipped
  }
  if (row.modifiers?.length) {
    item.modifiers = row.modifiers
  }
  return item
}

function choiceItemFromFormRow(
  row: z.infer<typeof startingEquipmentChoiceItemFormSchema>,
): StartingEquipmentItemChoice {
  const from: StartingEquipmentItemChoice['from'] = {}
  if (row.fromEquipmentSlugs?.length) {
    from.equipmentSlugs = row.fromEquipmentSlugs
  }
  if (row.fromToolCategories?.length) {
    from.toolCategories = row.fromToolCategories
  }

  return {
    kind: 'choice',
    label: row.label,
    choose: row.choose ?? 1,
    from,
  }
}

function startingEquipmentItemFromFormRow(row: StartingEquipmentItemForm): StartingEquipmentItem {
  return row.itemKind === 'fixed' ? fixedItemFromFormRow(row) : choiceItemFromFormRow(row)
}

export function startingEquipmentOptionToFormRow(
  option: StartingEquipmentOption,
): StartingEquipmentOptionForm {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    wealth: wealthGrantMoneyToForm(option.wealth),
    items: option.items.map(startingEquipmentItemToFormRow),
  }
}

export function startingEquipmentOptionFromFormRow(
  row: StartingEquipmentOptionForm & { id: string },
): StartingEquipmentOption {
  const option: StartingEquipmentOption = {
    id: row.id,
    label: row.label,
    items: row.items.map(startingEquipmentItemFromFormRow),
  }
  if (row.description) {
    option.description = row.description
  }
  const wealth = wealthGrantMoneyFromForm(row.wealth)
  if (wealth) {
    option.wealth = wealth
  }
  return option
}

export function startingEquipmentToFormValues(
  startingEquipment: StartingEquipmentChoice,
): StartingEquipmentForm {
  return {
    choose: startingEquipment.choose,
    options: startingEquipment.options.map(startingEquipmentOptionToFormRow),
  }
}

export function startingEquipmentFromFormValues(
  row: StartingEquipmentForm | undefined,
  existing?: StartingEquipmentChoice,
): StartingEquipmentChoice | undefined {
  if (!row?.options?.length) return undefined

  const options = applyStableIdsForChoiceOptions(
    row.options.filter((option) => option.label.trim()),
    existing?.options,
  ).map((option) => startingEquipmentOptionFromFormRow(option))

  if (!options.length) return undefined

  return {
    choose: row.choose ?? existing?.choose ?? 1,
    options,
  }
}

export function startingEquipmentDefaultValues(ctx: ContentFormCtx): StartingEquipmentForm {
  const standardOption = {
    ...(buildItemDefaultValues(
      startingEquipmentOptionItemFields(ctx),
    ) as StartingEquipmentOptionForm),
    id: 'standard',
    label: 'Standard Equipment',
    items: [],
  }

  const goldOption: StartingEquipmentOptionForm = {
    id: 'gold',
    label: 'Starting Gold',
    description: '',
    items: [],
  }

  return {
    choose: 1,
    options: [standardOption, goldOption],
  }
}
