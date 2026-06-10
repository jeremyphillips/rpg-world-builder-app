import { z } from 'zod'
import { PLAY_STYLES, MOODS, MAGIC_LEVELS, DIFFICULTIES } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import {
  PLAY_STYLE_LABELS,
  MOOD_LABELS,
  MAGIC_LEVEL_LABELS,
  DIFFICULTY_LABELS,
  IMPORTED_CHARACTERS_POLICY_LABELS,
} from './labels'

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

export const rulesSchema = z.object({
  startingLevel: z.number().int().min(1).max(25),
  importedCharactersPolicy: z.enum(['approval_required', 'disabled']),
})

export type RulesValues = z.infer<typeof rulesSchema>

export const rulesFields: FormItem[] = [
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
            max: 25,
            defaultValue: 1,
            required: true,
            hint: 'The level at which new player characters begin (1–25).',
            width: '1/2',
            inputWidth: 'sm',
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
    description: 'Additional rule configuration coming soon.',
    fields: [],
  },
]

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
