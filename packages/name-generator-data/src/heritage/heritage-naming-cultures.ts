import type { HeritageNamingCulture } from '@rpg/contracts/name-generator'

/**
 * Heritage picks that earn their own naming culture. Every `id` here needs a
 * matching `CULTURE_CONVENTION_BINDINGS` entry; heritage options left out fall
 * back to the species culture (e.g. the infernal tiefling legacy).
 */
export const HERITAGE_NAMING_CULTURES = [
  {
    id: 'elven-high',
    label: 'High Elf',
    speciesSlug: 'elf',
    heritageIds: ['high-elf'],
    languageIds: ['elvish'],
  },
  {
    id: 'elven-wood',
    label: 'Wood Elf',
    speciesSlug: 'elf',
    heritageIds: ['wood-elf'],
    languageIds: ['elvish', 'sylvan'],
  },
  {
    id: 'elven-drow',
    label: 'Drow',
    speciesSlug: 'elf',
    heritageIds: ['drow'],
    languageIds: ['elvish', 'undercommon'],
  },
  {
    id: 'dragonborn-metallic',
    label: 'Metallic Dragonborn',
    speciesSlug: 'dragonborn',
    heritageIds: ['brass', 'bronze', 'copper', 'gold', 'silver'],
    languageIds: ['draconic'],
  },
  {
    id: 'dragonborn-chromatic',
    label: 'Chromatic Dragonborn',
    speciesSlug: 'dragonborn',
    heritageIds: ['black', 'blue', 'green', 'red', 'white'],
    languageIds: ['draconic'],
  },
  {
    id: 'tiefling-abyssal',
    label: 'Abyssal Tiefling',
    speciesSlug: 'tiefling',
    heritageIds: ['abyssal'],
    languageIds: ['abyssal'],
  },
  {
    id: 'tiefling-chthonic',
    label: 'Chthonic Tiefling',
    speciesSlug: 'tiefling',
    heritageIds: ['chthonic'],
    languageIds: ['undercommon'],
  },
] as const satisfies readonly HeritageNamingCulture[]

export function getHeritageNamingCulture(cultureId: string): HeritageNamingCulture | undefined {
  return HERITAGE_NAMING_CULTURES.find((culture) => culture.id === cultureId)
}
