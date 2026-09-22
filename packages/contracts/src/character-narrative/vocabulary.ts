import { z } from 'zod'

export const NARRATIVE_THEME_TERM = {
  label: 'Narrative theme',
  description: 'Authoring theme that groups narrative fragments.',
}
export const NARRATIVE_THEME_ENTRIES = {
  duty: { label: 'Duty' },
  belonging: { label: 'Belonging' },
  ambition: { label: 'Ambition' },
} as const
export const narrativeThemeSchema = z.enum(['duty', 'belonging', 'ambition'])
export const NARRATIVE_THEMES = narrativeThemeSchema.options

export const NARRATIVE_SLOT_TERM = {
  label: 'Narrative slot',
  description: 'Output slot a narrative fragment fills.',
}
export const NARRATIVE_SLOT_ENTRIES = {
  personalityTraits: { label: 'Personality trait' },
  ideals: { label: 'Ideal' },
  bonds: { label: 'Bond' },
  flaws: { label: 'Flaw' },
  experience: { label: 'Formative experience' },
  choice: { label: 'Defining choice' },
  motivation: { label: 'Present motivation' },
} as const
export const narrativeSlotSchema = z.enum([
  'personalityTraits',
  'ideals',
  'bonds',
  'flaws',
  'experience',
  'choice',
  'motivation',
])
export const NARRATIVE_SLOTS = narrativeSlotSchema.options
export const NARRATIVE_ARRAY_FIELDS = ['personalityTraits', 'ideals', 'bonds', 'flaws'] as const
export const NARRATIVE_STORY_SLOTS = ['experience', 'choice', 'motivation'] as const

export const NARRATIVE_TOKEN_TERM = {
  label: 'Narrative token',
  description: 'Interpolated character or connection token in narrative prose.',
}
export const NARRATIVE_TOKEN_ENTRIES = {
  'organization.name': { label: 'Organization name' },
  'organization.title': { label: 'Membership title' },
  'residence.name': { label: 'Residence name' },
  'class.name': { label: 'Class name' },
  'species.name': { label: 'Species name' },
  'heritage.name': { label: 'Heritage name' },
  'culture.name': { label: 'Culture name' },
} as const
export const narrativeTokenSchema = z.enum([
  'organization.name',
  'organization.title',
  'residence.name',
  'class.name',
  'species.name',
  'heritage.name',
  'culture.name',
])
export type NarrativeToken = z.infer<typeof narrativeTokenSchema>
export type NarrativeTheme = z.infer<typeof narrativeThemeSchema>
export type NarrativeSlot = z.infer<typeof narrativeSlotSchema>
export const NARRATIVE_TOKEN_PATTERN = /\{\{([^{}]+)\}\}/g
