import { createElement } from 'react'
import { z } from 'zod'
import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  CHARACTER_ABILITY_SCORE_MAX,
  CREATURE_TYPE_TERM,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  DEFAULT_MULTICLASSING_ENABLED,
  DEFAULT_PRIMARY_ABILITY_MINIMUM,
  DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
  DEFAULT_SUBCLASS_CHOICES_ENABLED,
  defineMessage,
  EXTENDED_PROGRESSION_TIER_NAME_MAX,
  getTermSentenceForm,
  isMeaningfulLanguageProficiencyChoice,
  levelValidationMessages,
  MAX_CHARACTER_LEVEL,
  creatureTypeSchema,
  refineLevelRangeTable,
  validateExtendedMaxLevel,
} from '@rpg/contracts'
import {
  toOptions,
  type ArrayConfig,
  type FieldConfig,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  type GroupFieldItem,
} from '@rpg/ui/form'

import { vocabularyComboboxFieldForTerm, vocabularyFieldLabel } from '@/features/homebrew'

import { ExtendedProgressionEffects } from '../../../components/extended-progression-effects.client'
import {
  ExtendedLevelRangeSummary,
  StandardLevelRangeSummary,
} from '../../../components/level-range-summary.client'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { IMPORTED_CHARACTERS_POLICY_LABELS } from './character-configuration-form-labels'
import {
  buildStartingWealthTiersField,
  startingWealthFormSchema,
} from './starting-wealth-form-fields'
import { mapStartingWealthToFormValues } from './starting-wealth-form-values'
import {
  languageProficiencyChoiceFormSchema,
  languageProficiencyFields,
  languageProficiencyGrantsFormSchema,
} from './language-proficiency-form-fields'
import { languageProficiencyRulesDefaultValues } from './language-proficiency-form-values'

/** Character configuration validation messages (tier 3 form overrides). */
export const characterConfigurationValidationMessages = {
  creatureTypeUnavailable: defineMessage(
    'validation.characterConfiguration.creatureTypeUnavailable',
    () =>
      `This ${getTermSentenceForm(CREATURE_TYPE_TERM, 1)} is not available in this campaign vocabulary.`,
  ),
  languageUnavailable: defineMessage(
    'validation.characterConfiguration.languageUnavailable',
    () => 'Language is not available in this campaign vocabulary.',
  ),
}

export type CharacterRuleSurface = 'create' | 'config'

export const CREATE_WIZARD_RULE_FIELD_IDS = ['startingLevel', 'importedCharactersPolicy'] as const

export type CreateWizardRuleFieldId = (typeof CREATE_WIZARD_RULE_FIELD_IDS)[number]

const EXTENDED_PROGRESSION_ENABLED = 'extendedProgressionEnabled'
const MULTICLASSING_ENABLED = 'multiclassingEnabled'
const PRIMARY_ABILITY_MINIMUM_ENABLED = 'primaryAbilityMinimumEnabled'
const SUBCLASS_CHOICES_ENABLED = 'subclassChoicesEnabled'
const SCROLL_SECTION_ANCHOR_CLASS = 'scroll-mt-20'

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
  multiclassingEnabled: z.boolean().default(DEFAULT_MULTICLASSING_ENABLED),
  primaryAbilityMinimumEnabled: z.boolean().default(DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED),
  primaryAbilityMinimumScore: z
    .number()
    .int()
    .min(1)
    .max(CHARACTER_ABILITY_SCORE_MAX)
    .default(DEFAULT_PRIMARY_ABILITY_MINIMUM),
  speciesMulticlassPolicyEnabled: z.boolean().default(DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED),
  speciesLevelLimitsEnabled: z.boolean().default(DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED),
  subclassChoicesEnabled: z.boolean().default(DEFAULT_SUBCLASS_CHOICES_ENABLED),
  startingWealth: startingWealthFormSchema.default(() =>
    mapStartingWealthToFormValues(getStandardStartingWealthRules('srd-cc-5.2.1')),
  ),
  languageProficiencyGrants: languageProficiencyGrantsFormSchema.default(
    () => languageProficiencyRulesDefaultValues().languageProficiencyGrants,
  ),
  languageProficiencyChoice: languageProficiencyChoiceFormSchema.default(
    () => languageProficiencyRulesDefaultValues().languageProficiencyChoice,
  ),
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
        message: levelValidationMessages.startingLevelExceedsMax(),
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

function visibleWhenMulticlassingEnabled(): FieldVisibility {
  return {
    dependsOn: [MULTICLASSING_ENABLED],
    visibleWhen: (watched) => watched[MULTICLASSING_ENABLED] === true,
  }
}

function visibleWhenPrimaryAbilityMinimumEnabled(): FieldVisibility {
  return {
    dependsOn: [MULTICLASSING_ENABLED, PRIMARY_ABILITY_MINIMUM_ENABLED],
    visibleWhen: (watched) =>
      watched[MULTICLASSING_ENABLED] === true && watched[PRIMARY_ABILITY_MINIMUM_ENABLED] === true,
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
      message: levelValidationMessages.startingLevelExceedsMax(),
      path: ['startingLevel'],
    })
  }

  refineLevelRangeTable(values.startingWealth.tiers, ctx, {
    pathPrefix: ['startingWealth', 'tiers'],
    maxLevel: effectiveMax,
    requireStartAt: 1,
    requireEndAt: effectiveMax,
  })

  if (!values.extendedProgressionEnabled) return

  const tierName = values.extendedTierName?.trim() ?? ''
  if (tierName.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: levelValidationMessages.extendedTierNameRequired(),
      path: ['extendedTierName'],
    })
  }

  if (values.extendedMaxLevel === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: levelValidationMessages.extendedMaxLevelRequired(),
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

  const languageChoice = {
    id: 'origin-languages',
    choose: values.languageProficiencyChoice.choose,
    from: [],
    categories: values.languageProficiencyChoice.categories,
  }
  if (languageChoice.choose > 0 && !isMeaningfulLanguageProficiencyChoice(languageChoice)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Choose at least one language category when choose count is greater than zero.',
      path: ['languageProficiencyChoice', 'categories'],
    })
  }
}

function startingLevelField(width?: '1/2'): FieldConfig {
  return {
    type: 'number',
    name: 'startingLevel',
    label: 'Character starting level',
    separator: 'subtle',
    min: 1,
    max: ABSOLUTE_MAX_CHARACTER_LEVEL,
    defaultValue: 1,
    required: true,
    hint: 'The level at which new player characters begin.',
    labelPosition: 'settings',
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
    separator: 'subtle',
  }
}

function maxCharacterLevelField(): FormItem {
  return {
    type: 'number',
    name: 'maxCharacterLevel',
    label: 'Standard max level',
    labelPosition: 'settings',
    min: 1,
    max: ABSOLUTE_MAX_CHARACTER_LEVEL,
    defaultValue: MAX_CHARACTER_LEVEL,
    required: true,
    hint: 'Normal cap before any extended tier.',
    width: 'full',
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
  return vocabularyComboboxFieldForTerm(CREATURE_TYPE_TERM, {
    name: 'allowedCharacterCreatureTypes',
    multiple: true,
    required: true,
    hint: `${vocabularyFieldLabel(CREATURE_TYPE_TERM, { plural: true })} allowed for player and NPC character sheets.`,
    options: creatureTypeOptions,
  })
}

function extendedProgressionGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Extended progression',
    fields: [
      {
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: EXTENDED_PROGRESSION_ENABLED,
          label: 'Extended progression',
          hint: 'Use a named tier for levels beyond the standard cap.',
          defaultValue: false,
        },
        dependents: {
          surface: 'muted',
          fields: [
            {
              kind: 'row',
              visibility: visibleWhenExtendedProgression(),
              fields: [
                {
                  type: 'text',
                  name: 'extendedTierName',
                  label: 'Tier name',
                  hint: {
                    text: 'Examples: Epic Destiny, Epic Levels, Immortal Path',
                    position: 'below-control',
                  },
                  required: true,
                  width: 'full',
                },
                {
                  type: 'number',
                  name: 'extendedMaxLevel',
                  label: 'Extended max level',
                  min: 1,
                  max: ABSOLUTE_MAX_CHARACTER_LEVEL,
                  required: true,
                  width: 'auto',
                  digits: 2,
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
        },
      },
    ],
  }
}

function multiclassingGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Multiclassing',
    fields: [
      {
        type: 'switch',
        name: MULTICLASSING_ENABLED,
        label: 'Allow characters to multiclass',
        hint: 'Characters can take levels in more than one class when leveling up. Turn this off to require characters to remain within a single class.',
        defaultValue: DEFAULT_MULTICLASSING_ENABLED,
        separator: 'subtle',
      },
      {
        kind: 'dependent',
        separator: 'subtle',
        visibility: visibleWhenMulticlassingEnabled(),
        controller: {
          type: 'switch',
          name: PRIMARY_ABILITY_MINIMUM_ENABLED,
          label: 'Primary ability minimum',
          hint: 'Require a minimum score in each relevant class primary ability.',
          defaultValue: DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
        },
        dependents: {
          surface: 'muted',
          fields: [
            {
              type: 'number',
              name: 'primaryAbilityMinimumScore',
              label: 'Minimum ability score',
              labelPosition: 'settings',
              min: 1,
              max: CHARACTER_ABILITY_SCORE_MAX,
              defaultValue: DEFAULT_PRIMARY_ABILITY_MINIMUM,
              required: true,
              digits: 2,
              hint: 'Applied to every primary ability on the target class and all current classes.',
              visibility: visibleWhenPrimaryAbilityMinimumEnabled(),
            },
          ],
        },
      },
      {
        type: 'switch',
        name: 'speciesMulticlassPolicyEnabled',
        label: 'Species multiclass policy',
        hint: 'Let each species define whether and which classes it may multiclass into.',
        defaultValue: DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
        visibility: visibleWhenMulticlassingEnabled(),
        separator: 'subtle',
      },
      {
        type: 'switch',
        name: 'speciesLevelLimitsEnabled',
        label: 'Species level limits',
        hint: 'Let each species cap total character level and per-class levels.',
        defaultValue: DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
        visibility: visibleWhenMulticlassingEnabled(),
        separator: 'subtle',
      },
    ],
  }
}

function subclassesGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Subclasses',
    fields: [
      {
        type: 'switch',
        name: SUBCLASS_CHOICES_ENABLED,
        label: 'Allow characters to choose subclasses',
        hint: 'Characters can select subclasses when their class progression allows it. Turn this off to hide or block subclass choices in the character builder.',
        defaultValue: DEFAULT_SUBCLASS_CHOICES_ENABLED,
      },
    ],
  }
}

type CharacterConfigurationSection = {
  id: string
  label: string
}

type CharacterConfigFormOptions = {
  creatureTypeOptions: FieldOption[]
  languageOptions: FieldOption[]
  languageCategoryOptions: FieldOption[]
}

type CharacterRuleFieldDef = {
  id: string
  surfaces: readonly CharacterRuleSurface[]
  configSection?: CharacterConfigurationSection
  buildFormItems: (options: CharacterConfigFormOptions) => FormItem[]
  buildReviewRow?: (values: Partial<RulesValues>) => RulesReviewRow | undefined
}

function mergeAnchorClassName(className?: string): string {
  return className ? `${className} ${SCROLL_SECTION_ANCHOR_CLASS}` : SCROLL_SECTION_ANCHOR_CLASS
}

function applySectionAnchor(section: CharacterConfigurationSection, items: FormItem[]): FormItem[] {
  if (items.length === 0) return items

  const first = items[0]
  if (first && 'kind' in first && first.kind === 'group') {
    return [
      {
        ...first,
        id: section.id,
        className: mergeAnchorClassName(first.className),
      },
      ...items.slice(1),
    ]
  }

  return [
    {
      kind: 'group',
      id: section.id,
      className: SCROLL_SECTION_ANCHOR_CLASS,
      rhythm: 'comfortable',
      fields: items as GroupFieldItem[],
    },
  ]
}

function creationSectionItems(): FormItem[] {
  const prefix = 'startingWealth'
  return [
    {
      kind: 'group',
      legend: 'Creation',
      fields: [
        {
          kind: 'group',
          id: 'starting-level',
          className: SCROLL_SECTION_ANCHOR_CLASS,
          fields: [startingLevelField()],
        },
        importedCharactersPolicyField(),
        {
          kind: 'group',
          legend: 'Starting wealth by level',
          hint: 'Adds or replaces the class’s baseline starting equipment for characters created at higher levels.',
          fieldsChrome: { variant: 'inset' },
          fields: [
            {
              type: 'text',
              name: `${prefix}.name`,
              label: 'Table name',
              required: true,
              width: 'full',
            },
            {
              type: 'richtext',
              name: `${prefix}.description`,
              label: 'Description',
              width: 'full',
            },
            {
              ...(buildStartingWealthTiersField() as ArrayConfig),
              name: `${prefix}.tiers`,
              id: 'starting-wealth',
              item: { surface: 'raised' },
              className: SCROLL_SECTION_ANCHOR_CLASS,
            },
          ],
        },
      ],
    },
  ]
}

const CHARACTER_RULE_FIELD_REGISTRY: CharacterRuleFieldDef[] = [
  {
    id: 'startingLevel',
    surfaces: ['create'],
    buildFormItems: () => [startingLevelField()],
    buildReviewRow: (values) => ({
      label: 'Starting level',
      value: values.startingLevel !== undefined ? String(values.startingLevel) : '—',
    }),
  },
  {
    id: 'importedCharactersPolicy',
    surfaces: ['create'],
    buildFormItems: () => [importedCharactersPolicyField()],
    buildReviewRow: (values) => ({
      label: 'Imported characters',
      value: values.importedCharactersPolicy
        ? IMPORTED_CHARACTERS_POLICY_LABELS[values.importedCharactersPolicy]
        : '—',
    }),
  },
  {
    id: 'creation',
    surfaces: ['config'],
    configSection: { id: 'creation', label: 'Creation' },
    buildFormItems: () => creationSectionItems(),
  },
  {
    id: 'proficiencies',
    surfaces: ['config'],
    configSection: { id: 'proficiencies', label: 'Proficiencies' },
    buildFormItems: ({ languageOptions, languageCategoryOptions }) =>
      languageProficiencyFields(languageOptions, languageCategoryOptions),
  },
  {
    id: 'maxCharacterLevel',
    surfaces: ['config'],
    configSection: { id: 'standard-max-level', label: 'Standard max level' },
    buildFormItems: () => [maxCharacterLevelField(), standardLevelRangeSummarySlot()],
  },
  {
    id: 'extendedProgression',
    surfaces: ['config'],
    configSection: { id: 'extended-progression', label: 'Extended progression' },
    buildFormItems: () => [extendedProgressionGroup()],
  },
  {
    id: 'allowedCharacterCreatureTypes',
    surfaces: ['config'],
    configSection: {
      id: 'creature-type-policy',
      label: vocabularyFieldLabel(CREATURE_TYPE_TERM, { plural: true }),
    },
    buildFormItems: ({ creatureTypeOptions }) => [
      allowedCharacterCreatureTypesField(creatureTypeOptions),
    ],
  },
  {
    id: 'multiclassing',
    surfaces: ['config'],
    configSection: { id: 'multiclassing', label: 'Multiclassing' },
    buildFormItems: () => [multiclassingGroup()],
  },
  {
    id: 'subclasses',
    surfaces: ['config'],
    configSection: { id: 'subclasses', label: 'Subclasses' },
    buildFormItems: () => [subclassesGroup()],
  },
]

/** In-page anchor sections for Homebrew character configuration — derived from field registry. */
export const CHARACTER_CONFIGURATION_SECTIONS = CHARACTER_RULE_FIELD_REGISTRY.flatMap((field) =>
  field.configSection ? [field.configSection] : [],
)

export type CharacterConfigurationSectionId =
  (typeof CHARACTER_CONFIGURATION_SECTIONS)[number]['id']

function fieldsForSurface(surface: CharacterRuleSurface): CharacterRuleFieldDef[] {
  return CHARACTER_RULE_FIELD_REGISTRY.filter((field) => field.surfaces.includes(surface))
}

export function buildRulesConfigLayoutFields(
  creatureTypeOptions: FieldOption[],
  languageOptions: FieldOption[] = [],
  languageCategoryOptions: FieldOption[] = [],
): FormItem[] {
  const options: CharacterConfigFormOptions = {
    creatureTypeOptions,
    languageOptions,
    languageCategoryOptions,
  }
  return fieldsForSurface('config').flatMap((field) => {
    const items = field.buildFormItems(options)
    const section = field.configSection
    if (!section) return items
    return applySectionAnchor(section, items)
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
  languageOptions: FieldOption[] = [],
  languageCategoryOptions: FieldOption[] = [],
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

  const options: CharacterConfigFormOptions = {
    creatureTypeOptions,
    languageOptions,
    languageCategoryOptions,
  }
  return fieldsForSurface('config').flatMap((field) => field.buildFormItems(options))
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
