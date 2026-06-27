import { createElement } from 'react'
import { z } from 'zod'
import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  EXTENDED_PROGRESSION_TIER_NAME_MAX,
  MAX_CHARACTER_LEVEL,
  creatureTypeSchema,
  validateExtendedMaxLevel,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldConfig,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import { vocabularyComboboxField } from '@/features/homebrew'

import { ExtendedProgressionEffects } from '../components/extended-progression-effects.client'
import {
  ExtendedLevelRangeSummary,
  StandardLevelRangeSummary,
} from '../components/level-range-summary.client'
import { IMPORTED_CHARACTERS_POLICY_LABELS } from './labels'

export type CharacterRuleSurface = 'create' | 'config'

export const CREATE_WIZARD_RULE_FIELD_IDS = ['startingLevel', 'importedCharactersPolicy'] as const

export type CreateWizardRuleFieldId = (typeof CREATE_WIZARD_RULE_FIELD_IDS)[number]

const EXTENDED_PROGRESSION_ENABLED = 'extendedProgressionEnabled'

const configRulesObjectSchema = z.object({
  startingLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL),
  maxCharacterLevel: z
    .number()
    .int()
    .min(1)
    .max(ABSOLUTE_MAX_CHARACTER_LEVEL)
    .default(MAX_CHARACTER_LEVEL),
  extendedProgressionEnabled: z.boolean().default(false),
  extendedTierName: z.string().max(EXTENDED_PROGRESSION_TIER_NAME_MAX).optional(),
  extendedMaxLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL).optional(),
  importedCharactersPolicy: z.enum(['approval_required', 'disabled']),
  allowedCharacterCreatureTypes: z
    .array(creatureTypeSchema)
    .min(1)
    .default([...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES]),
})

type ConfigRulesValues = z.output<typeof configRulesObjectSchema>

const configRulesSchema = configRulesObjectSchema.superRefine(configRulesSuperRefine)

const createRulesSchema = z
  .object({
    startingLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL),
    importedCharactersPolicy: z.enum(['approval_required', 'disabled']),
  })
  .superRefine((values, ctx) => {
    if (values.startingLevel > MAX_CHARACTER_LEVEL) {
      ctx.addIssue({
        code: 'custom',
        message: 'Starting level cannot exceed max character level',
        path: ['startingLevel'],
      })
    }
  })

export type RulesValues = z.infer<typeof configRulesSchema>

export type CreateRulesValues = Pick<RulesValues, CreateWizardRuleFieldId>

export type RulesReviewRow = {
  label: string
  value: string
}

function visibleWhenExtendedProgression(): FieldVisibility {
  return {
    dependsOn: [EXTENDED_PROGRESSION_ENABLED],
    visibleWhen: (watched) => watched[EXTENDED_PROGRESSION_ENABLED] === true,
  }
}

function resolveEffectiveMax(values: {
  maxCharacterLevel: number
  extendedProgressionEnabled: boolean
  extendedMaxLevel?: number
}): number {
  if (values.extendedProgressionEnabled) {
    return values.extendedMaxLevel ?? values.maxCharacterLevel
  }
  return values.maxCharacterLevel
}

function configRulesSuperRefine(values: ConfigRulesValues, ctx: z.RefinementCtx) {
  const effectiveMax = resolveEffectiveMax(values)

  if (values.startingLevel > effectiveMax) {
    ctx.addIssue({
      code: 'custom',
      message: 'Starting level cannot exceed max character level',
      path: ['startingLevel'],
    })
  }

  if (!values.extendedProgressionEnabled) return

  const tierName = values.extendedTierName?.trim() ?? ''
  if (tierName.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Tier name is required when extended progression is enabled',
      path: ['extendedTierName'],
    })
  }

  if (values.extendedMaxLevel === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'Extended maximum level is required when extended progression is enabled',
      path: ['extendedMaxLevel'],
    })
    return
  }

  const result = validateExtendedMaxLevel(values.maxCharacterLevel, values.extendedMaxLevel)
  if (!result.valid) {
    ctx.addIssue({
      code: 'custom',
      message: result.message,
      path: ['extendedMaxLevel'],
    })
  }
}

function startingLevelField(width?: '1/2'): FieldConfig {
  return {
    type: 'number',
    name: 'startingLevel',
    label: 'Character starting level',
    min: 1,
    max: ABSOLUTE_MAX_CHARACTER_LEVEL,
    defaultValue: 1,
    required: true,
    hint: 'The level at which new player characters begin.',
    ...(width ? { width } : {}),
    digits: 2,
  }
}

function importedCharactersPolicyField(width?: '1/2'): FieldConfig {
  return {
    type: 'radio',
    name: 'importedCharactersPolicy',
    label: 'Allow imported characters?',
    required: true,
    ...(width ? { width } : {}),
    options: toOptions(['approval_required', 'disabled'], IMPORTED_CHARACTERS_POLICY_LABELS),
  }
}

function maxCharacterLevelField(): FormItem {
  return {
    type: 'number',
    name: 'maxCharacterLevel',
    label: 'Standard max level',
    min: 1,
    max: ABSOLUTE_MAX_CHARACTER_LEVEL,
    defaultValue: MAX_CHARACTER_LEVEL,
    required: true,
    hint: 'Normal cap before any extended tier.',
    width: '1/2',
    digits: 2,
  }
}

function standardLevelRangeSummarySlot(): FormItem {
  return {
    kind: 'slot',
    name: '_standardLevelRangeSummary',
    render: () => createElement(StandardLevelRangeSummary),
  }
}

function allowedCharacterCreatureTypesField(creatureTypeOptions: FieldOption[]): FormItem {
  return vocabularyComboboxField({
    name: 'allowedCharacterCreatureTypes',
    label: 'Allowed creature types',
    multiple: true,
    required: true,
    hint: 'Creature types allowed for player and NPC character sheets.',
    options: creatureTypeOptions,
    placeholder: 'Choose creature types…',
  })
}

function extendedProgressionGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Extended progression',
    collapsible: false,
    fields: [
      {
        type: 'switch',
        name: EXTENDED_PROGRESSION_ENABLED,
        label: 'Extended progression',
        hint: 'Use a named tier for levels beyond the standard cap.',
        defaultValue: false,
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'text',
            name: 'extendedTierName',
            label: 'Tier name',
            hint: 'Examples: Epic Destiny, Epic Levels, Immortal Path',
            required: true,
            width: '1/2',
            visibility: visibleWhenExtendedProgression(),
          },
          {
            type: 'number',
            name: 'extendedMaxLevel',
            label: 'Extended max level',
            min: 1,
            max: ABSOLUTE_MAX_CHARACTER_LEVEL,
            required: true,
            width: '1/2',
            digits: 2,
            visibility: visibleWhenExtendedProgression(),
          },
        ],
      },
      {
        kind: 'slot',
        name: '_extendedProgressionEffects',
        render: () => createElement(ExtendedProgressionEffects),
      },
      {
        kind: 'slot',
        name: '_extendedLevelRangeSummary',
        render: () => createElement(ExtendedLevelRangeSummary),
      },
    ],
  }
}

type CharacterRuleFieldDef = {
  id: string
  surfaces: readonly CharacterRuleSurface[]
  configAnchorId?: string
  buildFormItems: (creatureTypeOptions: FieldOption[]) => FormItem[]
  buildReviewRow?: (values: Partial<RulesValues>) => RulesReviewRow | undefined
}

const CHARACTER_RULE_FIELD_REGISTRY: CharacterRuleFieldDef[] = [
  {
    id: 'startingLevel',
    surfaces: ['create', 'config'],
    configAnchorId: 'starting-level',
    buildFormItems: () => [startingLevelField()],
    buildReviewRow: (values) => ({
      label: 'Starting level',
      value: values.startingLevel !== undefined ? String(values.startingLevel) : '—',
    }),
  },
  {
    id: 'importedCharactersPolicy',
    surfaces: ['create', 'config'],
    configAnchorId: 'imported-characters',
    buildFormItems: () => [importedCharactersPolicyField()],
    buildReviewRow: (values) => ({
      label: 'Imported characters',
      value: values.importedCharactersPolicy
        ? IMPORTED_CHARACTERS_POLICY_LABELS[values.importedCharactersPolicy]
        : '—',
    }),
  },
  {
    id: 'maxCharacterLevel',
    surfaces: ['config'],
    configAnchorId: 'standard-max-level',
    buildFormItems: () => [maxCharacterLevelField(), standardLevelRangeSummarySlot()],
  },
  {
    id: 'allowedCharacterCreatureTypes',
    surfaces: ['config'],
    configAnchorId: 'creature-type-policy',
    buildFormItems: (creatureTypeOptions) => [
      allowedCharacterCreatureTypesField(creatureTypeOptions),
    ],
  },
  {
    id: 'extendedProgression',
    surfaces: ['config'],
    configAnchorId: 'extended-progression',
    buildFormItems: () => [extendedProgressionGroup()],
  },
]

function fieldsForSurface(surface: CharacterRuleSurface): CharacterRuleFieldDef[] {
  return CHARACTER_RULE_FIELD_REGISTRY.filter((field) => field.surfaces.includes(surface))
}

export function buildRulesConfigLayoutFields(creatureTypeOptions: FieldOption[]): FormItem[] {
  return fieldsForSurface('config').flatMap((field) => {
    const items = field.buildFormItems(creatureTypeOptions)
    if (!field.configAnchorId) return items
    return [
      {
        kind: 'slot' as const,
        name: `_anchor_${field.configAnchorId}`,
        render: () => createElement('div', { id: field.configAnchorId, className: 'scroll-mt-20' }),
      },
      ...items,
    ]
  })
}

export function buildRulesSchemaForSurface(surface: 'create'): typeof createRulesSchema
export function buildRulesSchemaForSurface(surface: 'config'): typeof configRulesSchema
export function buildRulesSchemaForSurface(surface: CharacterRuleSurface) {
  return surface === 'create' ? createRulesSchema : configRulesSchema
}

export function buildRulesFieldsForSurface(
  surface: CharacterRuleSurface,
  creatureTypeOptions: FieldOption[],
): FormItem[] {
  if (surface === 'create') {
    return [
      {
        kind: 'group',
        legend: 'Basic',
        fields: [
          {
            kind: 'row',
            fields: [startingLevelField('1/2'), importedCharactersPolicyField('1/2')],
          },
        ],
      },
    ]
  }

  return fieldsForSurface('config').flatMap((field) => field.buildFormItems(creatureTypeOptions))
}

export function buildRulesReviewRowsForSurface(
  surface: CharacterRuleSurface,
  values: Partial<RulesValues>,
): RulesReviewRow[] {
  return fieldsForSurface(surface).flatMap((field) => {
    const row = field.buildReviewRow?.(values)
    return row ? [row] : []
  })
}
