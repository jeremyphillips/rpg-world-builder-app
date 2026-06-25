import { z } from 'zod'

// ---------------------------------------------------------------------------
// Languages — closed SRD 5.2.1 vocabulary for fixed language references.
// Homebrew extension/disablement belongs in campaign/content policy later; this
// contract only models the system ids and their standard/rare grouping.
// ---------------------------------------------------------------------------

export const LANGUAGE_CATEGORIES = ['standard', 'rare'] as const

export const languageCategorySchema = z.enum(LANGUAGE_CATEGORIES)

export type LanguageCategory = z.infer<typeof languageCategorySchema>

export type LanguageEntry = {
  readonly label: string
  readonly category: LanguageCategory
  readonly description?: string
}

export const LANGUAGE_ENTRIES = {
  common: {
    label: 'Common',
    category: 'standard',
  },
  'common-sign-language': {
    label: 'Common Sign Language',
    category: 'standard',
  },
  draconic: {
    label: 'Draconic',
    category: 'standard',
  },
  dwarvish: {
    label: 'Dwarvish',
    category: 'standard',
  },
  elvish: {
    label: 'Elvish',
    category: 'standard',
  },
  giant: {
    label: 'Giant',
    category: 'standard',
  },
  gnomish: {
    label: 'Gnomish',
    category: 'standard',
  },
  goblin: {
    label: 'Goblin',
    category: 'standard',
  },
  halfling: {
    label: 'Halfling',
    category: 'standard',
  },
  abyssal: {
    label: 'Abyssal',
    category: 'rare',
  },
  primordial: {
    label: 'Primordial',
    category: 'rare',
    description:
      'Primordial includes the Aquan, Auran, Ignan, and Terran dialects. Creatures that know one of these dialects can communicate with those that know a different one.',
  },
  celestial: {
    label: 'Celestial',
    category: 'rare',
  },
  sylvan: {
    label: 'Sylvan',
    category: 'rare',
  },
  'deep-speech': {
    label: 'Deep Speech',
    category: 'rare',
  },
  'thieves-cant': {
    label: "Thieves' Cant",
    category: 'rare',
  },
  druidic: {
    label: 'Druidic',
    category: 'rare',
  },
  undercommon: {
    label: 'Undercommon',
    category: 'rare',
  },
  infernal: {
    label: 'Infernal',
    category: 'rare',
  },
} as const satisfies Record<string, LanguageEntry>

export type Language = keyof typeof LANGUAGE_ENTRIES

export const LANGUAGE_IDS = Object.keys(LANGUAGE_ENTRIES) as [Language, ...Language[]]

export const languageSchema = z.enum(LANGUAGE_IDS)

export type LanguageByCategory<C extends LanguageCategory> = {
  [K in Language]: (typeof LANGUAGE_ENTRIES)[K]['category'] extends C ? K : never
}[Language]

export type StandardLanguage = LanguageByCategory<'standard'>
export type RareLanguage = LanguageByCategory<'rare'>

export const STANDARD_LANGUAGE_IDS = LANGUAGE_IDS.filter(
  (id): id is StandardLanguage => LANGUAGE_ENTRIES[id].category === 'standard',
) as [StandardLanguage, ...StandardLanguage[]]

export const RARE_LANGUAGE_IDS = LANGUAGE_IDS.filter(
  (id): id is RareLanguage => LANGUAGE_ENTRIES[id].category === 'rare',
) as [RareLanguage, ...RareLanguage[]]

/** Returns the language ids in a category. */
export function languageIdsByCategory<C extends LanguageCategory>(
  category: C,
): LanguageByCategory<C>[] {
  return LANGUAGE_IDS.filter(
    (id): id is LanguageByCategory<C> => LANGUAGE_ENTRIES[id].category === category,
  )
}

/** Returns the reference entry for a language id, if known. */
export function getLanguageEntry(id: string): LanguageEntry | undefined {
  return LANGUAGE_ENTRIES[id as Language]
}

/** Returns the display label for a language id. Falls back to the raw value. */
export function getLanguageLabel(id: string): string {
  return getLanguageEntry(id)?.label ?? id
}
