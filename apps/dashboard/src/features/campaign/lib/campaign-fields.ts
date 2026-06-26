import { createElement } from 'react'
import { z } from 'zod'
import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  EXTENDED_PROGRESSION_TIER_NAME_MAX,
  MAX_CHARACTER_LEVEL,
  PLAY_STYLES,
  MOODS,
  MAGIC_LEVELS,
  DIFFICULTIES,
  creatureTypeSchema,
  validateExtendedMaxLevel,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  buildActiveCreatureTypeFieldOptions,
  buildSeedCreatureTypeVocabulary,
} from '@/features/homebrew'

import { ExtendedProgressionEffects } from '../components/extended-progression-effects.client'
import {
  ExtendedLevelRangeSummary,
  StandardLevelRangeSummary,
} from '../components/level-range-summary.client'
import {
  PLAY_STYLE_LABELS,
  MOOD_LABELS,
  MAGIC_LEVEL_LABELS,
  DIFFICULTY_LABELS,
  IMPORTED_CHARACTERS_POLICY_LABELS,
} from './labels'

const defaultCreatureTypeOptions = buildActiveCreatureTypeFieldOptions(
  buildSeedCreatureTypeVocabulary(),
)

const EXTENDED_PROGRESSION_ENABLED = 'extendedProgressionEnabled'

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

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const identitySchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  description: z.string().max(500).optional(),
  banner: z.array(z.custom<File>((v: unknown) => v instanceof File)).optional(),
})

export type IdentityValues = z.infer<typeof identitySchema>

export const identityFields: FormItem[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Campaign name',
    size: 'lg',
    placeholder: 'Your campaign name',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Description',
    placeholder: 'A short summary of the campaign setting and tone.',
    rows: 3,
  },
  {
    type: 'file',
    name: 'banner',
    label: 'Campaign image',
    hint: 'JPEG, PNG, or WebP. Used as the campaign banner.',
    accept: ['image/jpeg', 'image/png', 'image/webp'],
  },
]

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

export const rulesSchema = z
  .object({
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
  .superRefine((values, ctx) => {
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
  })

export type RulesValues = z.infer<typeof rulesSchema>

export function resolveRulesSchema(activeCreatureTypeIds?: ReadonlySet<string>) {
  if (!activeCreatureTypeIds) return rulesSchema

  return rulesSchema.superRefine((values, ctx) => {
    for (const id of values.allowedCharacterCreatureTypes) {
      if (!activeCreatureTypeIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Creature type is not available in this campaign vocabulary',
          path: ['allowedCharacterCreatureTypes'],
        })
      }
    }
  })
}

export function buildRulesFields(creatureTypeOptions: FieldOption[]): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Basic',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'startingLevel',
              label: 'Character starting level',
              min: 1,
              max: ABSOLUTE_MAX_CHARACTER_LEVEL,
              defaultValue: 1,
              required: true,
              hint: 'The level at which new player characters begin.',
              width: '1/2',
              digits: 2,
            },
            {
              type: 'radio',
              name: 'importedCharactersPolicy',
              label: 'Allow imported characters?',
              required: true,
              width: '1/2',
              options: toOptions(
                ['approval_required', 'disabled'],
                IMPORTED_CHARACTERS_POLICY_LABELS,
              ),
            },
          ],
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Advanced',
      fields: [
        {
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
        },
        {
          kind: 'slot',
          name: '_standardLevelRangeSummary',
          render: () => createElement(StandardLevelRangeSummary),
        },
        {
          type: 'combobox',
          name: 'allowedCharacterCreatureTypes',
          label: 'Allowed creature types',
          multiple: true,
          required: true,
          hint: 'Creature types allowed for player and NPC character sheets.',
          options: creatureTypeOptions,
          placeholder: 'Choose creature types…',
        },
        {
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
        },
      ],
    },
  ]
}

/** Seed-based rules fields for campaign create (no campaign vocabulary yet). */
export const rulesFields = buildRulesFields(defaultCreatureTypeOptions)

// ---------------------------------------------------------------------------
// Flavor — maps to campaign.configuration.flavor.*
// ---------------------------------------------------------------------------

export const flavorSchema = z.object({
  playStyle: z.array(z.enum(PLAY_STYLES)).optional(),
  mood: z.array(z.enum(MOODS)).optional(),
  magicLevel: z.enum(MAGIC_LEVELS).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
})

export type FlavorValues = z.infer<typeof flavorSchema>

export const flavorFields: FormItem[] = [
  {
    type: 'chips',
    name: 'playStyle',
    label: 'Play Style',
    multiple: true,
    hint: 'Pick as many as apply.',
    options: toOptions(PLAY_STYLES, PLAY_STYLE_LABELS),
  },
  {
    type: 'chips',
    name: 'mood',
    label: 'Mood',
    multiple: true,
    hint: 'Pick as many as apply.',
    options: toOptions(MOODS, MOOD_LABELS),
  },
  {
    type: 'chips',
    name: 'magicLevel',
    label: 'Magic Level',
    multiple: false,
    options: toOptions(MAGIC_LEVELS, MAGIC_LEVEL_LABELS),
  },
  {
    type: 'chips',
    name: 'difficulty',
    label: 'Difficulty',
    multiple: false,
    options: toOptions(DIFFICULTIES, DIFFICULTY_LABELS),
  },
]
