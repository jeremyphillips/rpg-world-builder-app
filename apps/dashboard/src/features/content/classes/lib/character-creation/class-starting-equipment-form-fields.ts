import { z } from 'zod'
import {
  choiceOptionTitle,
  defineMessage,
  GEAR_KIND_ENTRIES,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  spellcastingFocusGearKindSchema,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  wealthGrantMoneyField,
  wealthGrantMoneyFromForm,
} from '../../../lib/forms/fields/content-economy-form-fields'
import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import {
  equipmentGrantChoiceItemFormSchema,
  equipmentGrantFixedItemFormSchema,
  equipmentGrantItemFields,
  EQUIPMENT_GRANT_ITEM_KINDS,
} from '../../../lib/forms/grants/equipment-grant-form-fields'
import {
  equipmentGrantTitle,
  equipmentGrantSummary,
} from '../../../lib/forms/grants/equipment-grant-form-values'
import { STARTING_EQUIPMENT_OPTION_DESCRIPTION_HINT } from './class-starting-equipment-form-labels'

/** Starting equipment validation messages (tier 3 form overrides). */
export const startingEquipmentValidationMessages = {
  wealthGrantRequired: defineMessage(
    'validation.startingEquipment.wealthGrantRequired',
    () => 'Packages with no items require a wealth grant',
    () => 'Missing wealth grant',
  ),
}

export const STARTING_EQUIPMENT_ITEM_KINDS = EQUIPMENT_GRANT_ITEM_KINDS

export const STARTING_EQUIPMENT_OPTIONS_FIELD_NAME =
  'characterCreation.startingEquipment.options' as const

export const STARTING_EQUIPMENT_FIELD_NAME = 'characterCreation.startingEquipment' as const

const focusKindOptions = toOptions(
  SPELLCASTING_FOCUS_GEAR_KINDS,
  Object.fromEntries(
    SPELLCASTING_FOCUS_GEAR_KINDS.map((kind) => [kind, GEAR_KIND_ENTRIES[kind].label]),
  ) as Record<(typeof SPELLCASTING_FOCUS_GEAR_KINDS)[number], string>,
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

export const startingEquipmentFixedItemFormSchema = equipmentGrantFixedItemFormSchema.extend({
  modifiers: z.array(startingEquipmentModifierFormSchema).optional(),
})

export const startingEquipmentChoiceItemFormSchema = equipmentGrantChoiceItemFormSchema

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
        message: startingEquipmentValidationMessages.wealthGrantRequired(),
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
  equipmentOptions: Parameters<typeof equipmentGrantTitle>[2] = [],
): string {
  return equipmentGrantTitle(row, index, equipmentOptions)
}

export function startingEquipmentModifierFields(): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'modifiers',
      legend: 'Modifiers',
      addLabel: 'Add modifier',
      itemCollapsible: true,
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
  return equipmentGrantItemFields(ctx, { extraFields: startingEquipmentModifierFields() })
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
        summary: (values) =>
          equipmentGrantSummary(values as StartingEquipmentItemForm | undefined, equipmentOptions),
      },
      fields: startingEquipmentItemFields(ctx),
    },
  ]
}
