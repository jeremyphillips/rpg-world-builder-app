import { z } from 'zod'
import { createElement } from 'react'
import {
  characterWealthFromGrant,
  choiceOptionTitle,
  defineMessage,
  formatWealth,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  SPELLCASTING_GEAR_KIND_ENTRIES,
  spellcastingFocusGearKindSchema,
} from '@rpg/contracts'
import { Heading } from '@rpg/ui'
import {
  toOptions,
  type ArrayItemShellRenderProps,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import {
  wealthGrantMoneyField,
  wealthGrantMoneyFromForm,
} from '../../../lib/forms/fields/content-economy-form-fields'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { referenceEquipmentFieldOptions } from '../../../lib/form-options/content-field-option.lib'
import { EntityDisclosureArrayItemShell } from '../../../lib/entity/disclosure/entity-disclosure-array-item-shell.client'
import {
  equipmentGrantChoiceItemFormSchema,
  equipmentGrantItemFields,
  equipmentGrantValidationMessages,
  grantedEquipmentItemFormSchema,
  EQUIPMENT_GRANT_ITEM_KINDS,
} from '../../../lib/forms/grants/equipment/equipment-grant-form-fields'
import {
  INELIGIBLE_PROFICIENCY_CHOICE_ERROR,
  STARTING_EQUIPMENT_GRANT_ITEM_KIND_LABELS,
  STARTING_EQUIPMENT_GRANT_TARGET_SOURCE_LABELS,
} from '../../../lib/forms/grants/equipment/equipment-grant-form-labels'
import { STARTING_EQUIPMENT_ITEM_TYPE_LABEL } from './class-character-creation-link-labels'
import {
  STARTING_EQUIPMENT_CHOICE_COPY,
  STARTING_EQUIPMENT_GOLD_WEALTH_HINT_PREFIX,
  STARTING_EQUIPMENT_PACKAGE_WEALTH_HINT_PREFIX,
} from './class-starting-equipment-form-labels'
import { ProficiencyLinkedGrantRowCue } from '../../components/character-creation/proficiency-linked-grant-row-cue.client'
import {
  equipmentGrantTitle,
  equipmentGrantSummary,
} from '../../../lib/forms/grants/equipment/equipment-grant-form-values'

/** Starting equipment validation messages (tier 3 form overrides). */
export const startingEquipmentValidationMessages = {
  wealthGrantRequired: defineMessage(
    'validation.startingEquipment.wealthGrantRequired',
    () => 'Packages with no items require a wealth grant.',
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
    SPELLCASTING_FOCUS_GEAR_KINDS.map((kind) => [kind, SPELLCASTING_GEAR_KIND_ENTRIES[kind].label]),
  ) as Record<(typeof SPELLCASTING_FOCUS_GEAR_KINDS)[number], string>,
)

const wealthGrantMoneyFormSchema = z.object({
  amount: z.coerce.number().int().min(0).default(0),
  currency: z.enum(['cp', 'sp', 'gp', 'pp']).default('gp'),
})

export const startingEquipmentModifierFormSchema = z.object({
  kind: z.literal('spellcasting_focus'),
  spellcastingGearKind: spellcastingFocusGearKindSchema,
})

export type StartingEquipmentModifierForm = z.infer<typeof startingEquipmentModifierFormSchema>

export const startingEquipmentGrantedItemFormSchema = grantedEquipmentItemFormSchema
  .extend({
    modifiers: z.array(startingEquipmentModifierFormSchema).optional(),
  })
  .superRefine((row, ctx) => {
    if (row.grantTargetSource === 'proficiency_choice' && (row.modifiers?.length ?? 0) > 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Proficiency-linked starting equipment grants cannot carry modifiers.',
        path: ['modifiers'],
      })
    }
  })

export type StartingEquipmentProficiencyLinkValidationContext = {
  definedToolChoiceIds: ReadonlySet<string>
  eligibleProficiencyChoiceIds: ReadonlySet<string>
}

export function refineStartingEquipmentProficiencyLinkRow(
  row: z.infer<typeof grantedEquipmentItemFormSchema>,
  ctx: Pick<z.RefinementCtx, 'addIssue'>,
  validation?: StartingEquipmentProficiencyLinkValidationContext,
): void {
  if (row.grantTargetSource !== 'proficiency_choice' || !row.proficiencyChoiceId?.trim()) return
  if (!validation) return

  const choiceId = row.proficiencyChoiceId.trim()

  if (!validation.definedToolChoiceIds.has(choiceId)) {
    ctx.addIssue({
      code: 'custom',
      message: equipmentGrantValidationMessages.missingProficiencyChoice({ choiceId }),
      path: ['proficiencyChoiceId'],
    })
    return
  }

  if (!validation.eligibleProficiencyChoiceIds.has(choiceId)) {
    ctx.addIssue({
      code: 'custom',
      message: INELIGIBLE_PROFICIENCY_CHOICE_ERROR,
      path: ['proficiencyChoiceId'],
    })
  }
}

export const startingEquipmentChoiceItemFormSchema = equipmentGrantChoiceItemFormSchema

export const startingEquipmentItemFormSchema = z.discriminatedUnion('itemKind', [
  startingEquipmentGrantedItemFormSchema,
  startingEquipmentChoiceItemFormSchema,
])

export type StartingEquipmentItemForm = z.infer<typeof startingEquipmentItemFormSchema>

export const startingEquipmentOptionFormSchema = z
  .object({
    id: z.string().min(1).optional(),
    label: z.string().min(1),
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
  choose: z.literal(1).default(1),
  options: z.array(startingEquipmentOptionFormSchema).min(1),
})

export type StartingEquipmentForm = z.infer<typeof startingEquipmentFormSchema>

export function startingEquipmentOptionTitle(
  row: Pick<StartingEquipmentOptionForm, 'id' | 'label'> | undefined,
): string {
  if (!row) return ''
  return choiceOptionTitle({ id: row.id ?? '', label: row.label })
}

/** Master-detail eyebrow describing baseline wealth composition for an option. */
export function startingEquipmentOptionWealthHint(
  row: StartingEquipmentOptionForm | undefined,
): string | undefined {
  if (!row) return undefined

  const wealth = wealthGrantMoneyFromForm(row.wealth)
  if (!wealth) return undefined

  const amount = formatWealth(characterWealthFromGrant(wealth))
  const isWealthOnly = (row.items?.length ?? 0) === 0
  const prefix = isWealthOnly
    ? STARTING_EQUIPMENT_GOLD_WEALTH_HINT_PREFIX
    : STARTING_EQUIPMENT_PACKAGE_WEALTH_HINT_PREFIX
  return `${prefix}: ${amount}`
}

export function startingEquipmentItemTitle(
  row: StartingEquipmentItemForm | undefined,
  index: number,
  equipmentOptions: Parameters<typeof equipmentGrantTitle>[2] = [],
  proficiencyChoiceOptions: Parameters<typeof equipmentGrantTitle>[3] = [],
): string {
  return equipmentGrantTitle(row, index, equipmentOptions, proficiencyChoiceOptions)
}

function visibleForEquipmentGrantTarget(): FieldVisibility {
  return {
    dependsOn: ['itemKind', 'grantTargetSource'],
    visibleWhen: (watched) =>
      watched['itemKind'] === 'grant' &&
      (watched['grantTargetSource'] === 'equipment' || watched['grantTargetSource'] === undefined),
  }
}

export function startingEquipmentModifierFields(): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'modifiers',
      legend: 'Modifiers',
      visibility: visibleForEquipmentGrantTarget(),
      addAction: { label: 'Add modifier' },
      item: {
        collapsible: true,
        header: {
          fallback: () => 'Modifier',
          primary: (values) => {
            const row = values as StartingEquipmentModifierForm | undefined
            if (row?.spellcastingGearKind) {
              return SPELLCASTING_GEAR_KIND_ENTRIES[row.spellcastingGearKind].label
            }
            return undefined
          },
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
          name: 'spellcastingGearKind',
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
      kind: 'slot',
      name: '_startingEquipmentChoiceCopy',
      render: () =>
        createElement(Heading, { variant: 'subsection', as: 'p' }, STARTING_EQUIPMENT_CHOICE_COPY),
    },
  ]
}

const startingEquipmentItemKindOptions = toOptions(
  EQUIPMENT_GRANT_ITEM_KINDS,
  STARTING_EQUIPMENT_GRANT_ITEM_KIND_LABELS,
)

const startingEquipmentGrantTargetSourceOptions = toOptions(
  ['equipment', 'proficiency_choice'] as const,
  STARTING_EQUIPMENT_GRANT_TARGET_SOURCE_LABELS,
)

export function startingEquipmentItemFields(ctx: ContentFormCtx): FormItem[] {
  return equipmentGrantItemFields(ctx, {
    allowProficiencyChoiceTarget: true,
    kindSelectLabel: STARTING_EQUIPMENT_ITEM_TYPE_LABEL,
    itemKindOptions: startingEquipmentItemKindOptions,
    grantTargetSourceOptions: startingEquipmentGrantTargetSourceOptions,
    extraFields: startingEquipmentModifierFields(),
    renderProficiencyLinkedGrantCue: () => createElement(ProficiencyLinkedGrantRowCue),
  })
}

export function startingEquipmentOptionItemFields(ctx: ContentFormCtx): FormItem[] {
  const equipmentOptions = referenceEquipmentFieldOptions(ctx.options?.equipment)
  const proficiencyChoiceOptions = ctx.options?.proficiencyChoiceTargets ?? []

  return [
    {
      type: 'text',
      name: 'label',
      label: 'Label',
      required: true,
    },
    ...wealthGrantMoneyField('wealth'),
    {
      kind: 'array',
      name: 'items',
      legend: 'Items',
      addAction: { label: 'Add item' },
      item: {
        variant: 'detailed',
        collapsible: true,
        header: {
          fallback: (index) => `Item ${index + 1}`,
          primary: (values, index) =>
            startingEquipmentItemTitle(
              values as StartingEquipmentItemForm | undefined,
              index,
              equipmentOptions,
              proficiencyChoiceOptions,
            ),
          summary: (values) =>
            equipmentGrantSummary(
              values as StartingEquipmentItemForm | undefined,
              equipmentOptions,
            ),
        },
        renderShell: (props: ArrayItemShellRenderProps) =>
          createElement(EntityDisclosureArrayItemShell, props),
      },
      fields: startingEquipmentItemFields(ctx),
    },
  ]
}
