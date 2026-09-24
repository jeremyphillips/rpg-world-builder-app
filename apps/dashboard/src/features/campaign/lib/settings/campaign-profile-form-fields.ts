import { z } from 'zod'
import {
  contentMediaSchema,
  DEFAULT_UPLOAD_MAX_BYTES,
  PLAY_STYLES,
  MOODS,
  MAGIC_LEVELS,
  DIFFICULTIES,
  STANDARD_IMAGE_UPLOAD_ACCEPT,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import {
  PLAY_STYLE_LABELS,
  MOOD_LABELS,
  MAGIC_LEVEL_LABELS,
  DIFFICULTY_LABELS,
} from './campaign-profile-form-labels'

// ---------------------------------------------------------------------------
// Identity — create wizard
// ---------------------------------------------------------------------------

export const createIdentitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  banner: z.array(z.custom<File>((v: unknown) => v instanceof File)).optional(),
})

export type CreateIdentityValues = z.infer<typeof createIdentitySchema>

export const createIdentityFields: FormItem[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Campaign name',
    controlSizeOverride: 'lg',
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
    hint: 'Used as the campaign banner.',
    accept: [...STANDARD_IMAGE_UPLOAD_ACCEPT],
    maxSize: DEFAULT_UPLOAD_MAX_BYTES,
  },
]

// ---------------------------------------------------------------------------
// Identity — settings
// ---------------------------------------------------------------------------

export const settingsIdentitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  media: contentMediaSchema.optional(),
})

export type SettingsIdentityValues = z.infer<typeof settingsIdentitySchema>

export const settingsIdentityFields: FormItem[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Campaign name',
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
]

/** @deprecated Use createIdentitySchema or settingsIdentitySchema. */
export const identitySchema = createIdentitySchema
/** @deprecated Use createIdentityFields or settingsIdentityFields. */
export const identityFields = createIdentityFields
/** @deprecated Use CreateIdentityValues or SettingsIdentityValues. */
export type IdentityValues = CreateIdentityValues

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
    options: toOptions(PLAY_STYLES, PLAY_STYLE_LABELS),
  },
  {
    type: 'chips',
    name: 'mood',
    label: 'Mood',
    multiple: true,
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
