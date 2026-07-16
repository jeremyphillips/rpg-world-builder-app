import { createElement } from 'react'
import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  defineMessage,
  EQUIPMENT_KIND_LABELS,
  EQUIPMENT_KINDS,
  GEAR_KIND_ENTRIES,
  GEAR_KINDS,
  SPELLCASTING_GEAR_KINDS,
  SPELLCASTING_GEAR_KIND_ENTRIES,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  toolCategorySchema,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  weaponCategorySchema,
  armorCategorySchema,
  equipmentKindSchema,
  gearKindSchema,
  spellcastingGearKindSchema,
} from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  toOptions,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'
import { ProficiencyLinkedGrantRowCue } from '../../../classes/components/character-creation/proficiency-linked-grant-row-cue.client'
import {
  LINKED_PROFICIENCY_CHOICE_LABEL,
  PROFICIENCY_LINK_GRANT_HINT,
} from '../../../classes/lib/character-creation/class-character-creation-link-labels'
import {
  EQUIPMENT_GRANT_ITEM_KIND_LABELS,
  EQUIPMENT_GRANT_TARGET_SOURCE_LABELS,
  EQUIPMENT_POOL_SOURCE_LABELS,
} from './equipment-grant-form-labels'

/** Sentinel for “any category” in single-select pool category fields (Radix Select rejects `''`). */
export const EQUIPMENT_POOL_CATEGORY_ANY = '__any__' as const

/** React key for the equipment choice pool inline sentence (segments still bind `choose`). */
export const EQUIPMENT_CHOICE_POOL_SENTENCE_FIELD_NAME = 'equipmentChoicePoolSentence' as const

/** Equipment grant validation messages (tier 3 form overrides). */
export const equipmentGrantValidationMessages = {
  explicitPoolSlugsRequired: defineMessage(
    'validation.equipmentGrant.explicitPoolSlugsRequired',
    () => 'Specific item lists require at least one equipment item.',
    () => 'Missing pool equipment',
  ),
  filteredPoolKindRequired: defineMessage(
    'validation.equipmentGrant.filteredPoolKindRequired',
    () => 'Filtered pools require an equipment type.',
    () => 'Missing equipment type',
  ),
  proficiencyChoiceRequired: defineMessage(
    'validation.equipmentGrant.proficiencyChoiceRequired',
    () => 'Select a proficiency choice for this grant.',
    () => 'Missing proficiency choice',
  ),
  missingProficiencyChoice: defineMessage<{ choiceId: string }>(
    'validation.equipmentGrant.missingProficiencyChoice',
    ({ choiceId }) => `Linked proficiency choice unavailable. Could not find "${choiceId}".`,
    () => 'Missing proficiency link',
  ),
  ineligibleProficiencyChoice: defineMessage(
    'validation.equipmentGrant.ineligibleProficiencyChoice',
    () =>
      'Linked proficiency choice is no longer eligible. It must be a tool choice that selects exactly one option.',
    () => 'Ineligible proficiency link',
  ),
}

export const EQUIPMENT_GRANT_ITEM_KINDS = ['grant', 'choice'] as const

export const EQUIPMENT_GRANT_TARGET_SOURCES = ['equipment', 'proficiency_choice'] as const

export const EQUIPMENT_POOL_SOURCES = ['explicit', 'filtered'] as const

const itemKindOptions = toOptions(EQUIPMENT_GRANT_ITEM_KINDS, EQUIPMENT_GRANT_ITEM_KIND_LABELS)

const grantTargetSourceOptions = toOptions(
  EQUIPMENT_GRANT_TARGET_SOURCES,
  EQUIPMENT_GRANT_TARGET_SOURCE_LABELS,
)

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

const spellcastingGearKindOptions = toOptions(
  SPELLCASTING_GEAR_KINDS,
  Object.fromEntries(
    SPELLCASTING_GEAR_KINDS.map((kind) => [kind, SPELLCASTING_GEAR_KIND_ENTRIES[kind].label]),
  ) as Record<(typeof SPELLCASTING_GEAR_KINDS)[number], string>,
)

function categoryOptionsWithAny(options: { value: string; label: string }[]) {
  return [{ value: EQUIPMENT_POOL_CATEGORY_ANY, label: 'Any' }, ...options]
}

export const grantedEquipmentItemFormSchema = z
  .object({
    itemKind: z.literal('grant'),
    grantTargetSource: z.enum(EQUIPMENT_GRANT_TARGET_SOURCES).default('equipment'),
    equipmentSlug: z.string().optional(),
    proficiencyChoiceId: z.string().optional(),
    quantity: z.coerce.number().int().min(1).default(1),
    equipped: z.boolean().optional(),
  })
  .superRefine((row, ctx) => {
    if (row.grantTargetSource === 'equipment' && !row.equipmentSlug?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Equipment is required.',
        path: ['equipmentSlug'],
      })
    }

    if (row.grantTargetSource === 'proficiency_choice' && !row.proficiencyChoiceId?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: equipmentGrantValidationMessages.proficiencyChoiceRequired(),
        path: ['proficiencyChoiceId'],
      })
    }
  })

export const equipmentGrantChoiceItemFormSchema = z
  .object({
    itemKind: z.literal('choice'),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(EQUIPMENT_POOL_SOURCES).default('filtered'),
    poolEquipmentSlugs: z.array(z.string().min(1)).optional(),
    poolEquipmentKind: equipmentKindSchema.optional(),
    poolToolCategory: z
      .union([toolCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
      .optional(),
    poolWeaponCategory: z
      .union([weaponCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
      .optional(),
    poolArmorCategory: z
      .union([armorCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
      .optional(),
    poolGearKind: z.union([gearKindSchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)]).optional(),
    poolSpellcastingGearKind: z
      .union([spellcastingGearKindSchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
      .optional(),
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
  grantedEquipmentItemFormSchema,
  equipmentGrantChoiceItemFormSchema,
])

export type EquipmentGrantItemForm = z.infer<typeof equipmentGrantItemFormSchema>

export type GrantedEquipmentItemForm = Extract<EquipmentGrantItemForm, { itemKind: 'grant' }>

export type EquipmentGrantChoiceItemForm = Extract<EquipmentGrantItemForm, { itemKind: 'choice' }>

function withGuard(
  visibility: FieldVisibility | undefined,
  guard?: FieldVisibility,
): FieldVisibility | undefined {
  if (!guard) return visibility
  if (!visibility) return guard
  return combineFieldVisibilityAll(guard, visibility)
}

function visibleForItemKind(
  itemKind: (typeof EQUIPMENT_GRANT_ITEM_KINDS)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind'],
      visibleWhen: (watched) => watched['itemKind'] === itemKind,
    },
    guard,
  )!
}

function visibleForChoicePoolSource(
  poolSource: (typeof EQUIPMENT_POOL_SOURCES)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind', 'poolSource'],
      visibleWhen: (watched) =>
        watched['itemKind'] === 'choice' && watched['poolSource'] === poolSource,
    },
    guard,
  )!
}

function visibleForFilteredEquipmentKind(
  equipmentKind: (typeof EQUIPMENT_KINDS)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind', 'poolSource', 'poolEquipmentKind'],
      visibleWhen: (watched) =>
        watched['itemKind'] === 'choice' &&
        watched['poolSource'] === 'filtered' &&
        watched['poolEquipmentKind'] === equipmentKind,
    },
    guard,
  )!
}

function visibleForSpellcastingGearPoolFilter(guard?: FieldVisibility): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind', 'poolSource', 'poolEquipmentKind', 'poolGearKind'],
      visibleWhen: (watched) =>
        watched['itemKind'] === 'choice' &&
        watched['poolSource'] === 'filtered' &&
        watched['poolEquipmentKind'] === 'adventuring_gear' &&
        watched['poolGearKind'] === 'spellcasting',
    },
    guard,
  )!
}

function visibleForGrantTargetSource(
  grantTargetSource: (typeof EQUIPMENT_GRANT_TARGET_SOURCES)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind', 'grantTargetSource'],
      visibleWhen: (watched) =>
        watched['itemKind'] === 'grant' && watched['grantTargetSource'] === grantTargetSource,
    },
    guard,
  )!
}

export type GrantedEquipmentItemFieldsOptions = Pick<
  EquipmentGrantItemFieldsOptions,
  | 'guardVisibility'
  | 'allowProficiencyChoiceTarget'
  | 'itemKindOptions'
  | 'grantTargetSourceOptions'
>

export function grantedEquipmentItemFields(
  ctx: ContentFormCtx,
  opts: GrantedEquipmentItemFieldsOptions = {},
): FormItem[] {
  const {
    guardVisibility: guard,
    allowProficiencyChoiceTarget = false,
    grantTargetSourceOptions: grantTargetSelectOptions = grantTargetSourceOptions,
  } = opts
  const equipmentOptions = ctx.options?.equipment ?? []
  const proficiencyChoiceOptions = ctx.options?.proficiencyChoiceTargets ?? []
  const hasEligibleProficiencyChoices = proficiencyChoiceOptions.length > 0

  const grantTargetFields: FormItem[] = allowProficiencyChoiceTarget
    ? [
        {
          type: 'select',
          name: 'grantTargetSource',
          label: 'Item source',
          options: grantTargetSelectOptions,
          required: true,
          defaultValue: 'equipment',
          visibility: visibleForItemKind('grant', guard),
          width: 'full',
        },
        {
          type: 'select',
          name: 'proficiencyChoiceId',
          label: LINKED_PROFICIENCY_CHOICE_LABEL,
          options: proficiencyChoiceOptions,
          required: true,
          placeholder: hasEligibleProficiencyChoices
            ? 'Choose proficiency choice…'
            : 'No eligible choices',
          disabled: !hasEligibleProficiencyChoices,
          hint: hasEligibleProficiencyChoices
            ? PROFICIENCY_LINK_GRANT_HINT
            : 'No eligible tool proficiency choices. Add a character-creation tool choice that selects exactly one tool.',
          visibility: visibleForGrantTargetSource('proficiency_choice', guard),
        },
        {
          kind: 'slot',
          name: '_proficiencyLinkedGrantCue',
          visibility: visibleForGrantTargetSource('proficiency_choice', guard),
          render: () => createElement(ProficiencyLinkedGrantRowCue),
        },
      ]
    : []

  return [
    ...grantTargetFields,
    {
      kind: 'row',
      visibility: allowProficiencyChoiceTarget
        ? visibleForGrantTargetSource('equipment', guard)
        : visibleForItemKind('grant', guard),
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
      kind: 'row',
      visibility: visibleForGrantTargetSource('proficiency_choice', guard),
      fields: [
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
      label: 'Equipped by default',
      visibility: visibleForItemKind('grant', guard),
    },
  ]
}

export function equipmentChoiceGrantFields(
  ctx: ContentFormCtx,
  guard?: FieldVisibility,
): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []

  return [
    {
      type: 'inlineSentence',
      name: EQUIPMENT_CHOICE_POOL_SENTENCE_FIELD_NAME,
      label: '',
      hideLabel: true,
      visibility: visibleForItemKind('choice', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'item(s) from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: poolSourceOptions,
          width: 'lg',
          defaultValue: 'filtered',
          ariaLabel: 'Pool source',
        },
      ],
    },
    {
      type: 'combobox',
      name: 'poolEquipmentSlugs',
      label: 'Equipment',
      multiple: true,
      options: equipmentOptions,
      placeholder: 'Choose equipment…',
      visibility: visibleForChoicePoolSource('explicit', guard),
    },
    {
      kind: 'row',
      visibility: visibleForChoicePoolSource('filtered', guard),
      fields: [
        {
          type: 'select',
          name: 'poolEquipmentKind',
          label: 'Equipment type',
          options: equipmentKindOptions,
          required: true,
          defaultValue: 'tool',
        },
        {
          type: 'select',
          name: 'poolToolCategory',
          label: 'Tool category',
          options: categoryOptionsWithAny(toolCategoryOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('tool', guard),
        },
        {
          type: 'select',
          name: 'poolWeaponCategory',
          label: 'Weapon category',
          options: categoryOptionsWithAny(weaponCategoryOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('weapon', guard),
        },
        {
          type: 'select',
          name: 'poolArmorCategory',
          label: 'Armor category',
          options: categoryOptionsWithAny(armorCategoryOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('armor', guard),
        },
        {
          type: 'select',
          name: 'poolGearKind',
          label: 'Gear kind',
          options: categoryOptionsWithAny(gearKindOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('adventuring_gear', guard),
        },
        {
          type: 'select',
          name: 'poolSpellcastingGearKind',
          label: 'Spellcasting kind',
          options: categoryOptionsWithAny(spellcastingGearKindOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForSpellcastingGearPoolFilter(guard),
        },
      ],
    },
  ]
}

export type EquipmentGrantItemFieldsOptions = {
  extraFields?: FormItem[]
  /** Override the item-kind select label (e.g. when composed inside the grants array). */
  kindSelectLabel?: string
  /** Override item-kind select options (starting equipment uses Granted item labels). */
  itemKindOptions?: { value: string; label: string }[]
  /** Override grant-target select options (starting equipment uses Item source labels). */
  grantTargetSourceOptions?: { value: string; label: string }[]
  /** AND-combined visibility guard applied to every equipment grant field. */
  guardVisibility?: FieldVisibility
  /** Enables proficiency-linked grant targets for class starting equipment. */
  allowProficiencyChoiceTarget?: boolean
}

export function equipmentGrantItemFields(
  ctx: ContentFormCtx,
  opts: EquipmentGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility
  const itemKindSelectOptions = opts.itemKindOptions ?? itemKindOptions
  const grantTargetSelectOptions = opts.grantTargetSourceOptions ?? grantTargetSourceOptions

  return [
    {
      type: 'select',
      name: 'itemKind',
      label: opts.kindSelectLabel ?? 'Grant type',
      options: itemKindSelectOptions,
      required: true,
      defaultValue: 'grant',
      visibility: guard,
      width: opts.allowProficiencyChoiceTarget ? 'full' : '1/2',
    },
    ...grantedEquipmentItemFields(ctx, {
      guardVisibility: guard,
      allowProficiencyChoiceTarget: opts.allowProficiencyChoiceTarget,
      itemKindOptions: itemKindSelectOptions,
      grantTargetSourceOptions: grantTargetSelectOptions,
    }),
    ...(opts.extraFields ?? []),
    ...equipmentChoiceGrantFields(ctx, guard),
  ]
}
