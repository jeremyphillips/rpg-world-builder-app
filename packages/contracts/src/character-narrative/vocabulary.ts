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
  'hometown.name': { label: 'Hometown name' },
  'birthplace.name': { label: 'Birthplace name' },
  'property.name': { label: 'Property name' },
  'mentor.name': { label: 'Mentor name' },
  'child.name': { label: 'Child name' },
  'partner.name': { label: 'Partner name' },
  'rival.name': { label: 'Rival name' },
  'parent.name': { label: 'Parent name' },
  'class.name': { label: 'Class name' },
  'species.name': { label: 'Species name' },
  'heritage.name': { label: 'Heritage name' },
  'culture.name': { label: 'Culture name' },
} as const
export const narrativeTokenSchema = z.enum([
  'organization.name',
  'organization.title',
  'residence.name',
  'hometown.name',
  'birthplace.name',
  'property.name',
  'mentor.name',
  'child.name',
  'partner.name',
  'rival.name',
  'parent.name',
  'class.name',
  'species.name',
  'heritage.name',
  'culture.name',
])

export const NARRATIVE_FRAGMENT_CONDITION_TERM = {
  label: 'Narrative fragment condition',
  description:
    'Semantic requirement beyond token existence — lifecycle, person role, or place role.',
}
export const NARRATIVE_FRAGMENT_CONDITION_ENTRIES = {
  'organizationMembership.current': { label: 'Current organization membership' },
  'organizationMembership.former': { label: 'Former organization membership' },
  'personRole.mentor': { label: 'Known mentor' },
  'personRole.child': { label: 'Known child' },
  'personRole.partner': { label: 'Current partner' },
  'personRole.rival': { label: 'Directed rivalry' },
  'personRole.parent': { label: 'Known parent' },
  'placeRole.hometown': { label: 'Hometown' },
  'placeRole.residence': { label: 'Current residence' },
  'placeRole.birthplace': { label: 'Birthplace' },
  'placeRole.property': { label: 'Owned or associated property' },
} as const
export const narrativeFragmentConditionSchema = z.enum([
  'organizationMembership.current',
  'organizationMembership.former',
  'personRole.mentor',
  'personRole.child',
  'personRole.partner',
  'personRole.rival',
  'personRole.parent',
  'placeRole.hometown',
  'placeRole.residence',
  'placeRole.birthplace',
  'placeRole.property',
])
export type NarrativeToken = z.infer<typeof narrativeTokenSchema>
export type NarrativeFragmentCondition = z.infer<typeof narrativeFragmentConditionSchema>
export type NarrativeTheme = z.infer<typeof narrativeThemeSchema>
export type NarrativeSlot = z.infer<typeof narrativeSlotSchema>
export const NARRATIVE_TOKEN_PATTERN = /\{\{([^{}]+)\}\}/g
