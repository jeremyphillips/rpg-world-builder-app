import type { NamingCulture } from '@rpg/contracts/name-generator'

export const NAMING_CULTURES = [
  {
    id: 'elven',
    label: 'Elven',
    origin: 'fictional',
    languageIds: ['elvish'],
    description: 'Elven personal and settlement naming traditions.',
  },
  {
    id: 'dwarf',
    label: 'Dwarf',
    origin: 'fictional',
    languageIds: ['dwarvish'],
    description: 'Hold- and clan-oriented dwarven naming patterns.',
  },
  {
    id: 'halfling',
    label: 'Halfling',
    origin: 'fictional',
    languageIds: ['halfling'],
    description: 'Pastoral halfling naming traditions.',
  },
  {
    id: 'dragonborn',
    label: 'Dragonborn',
    origin: 'fictional',
    languageIds: ['draconic'],
    description:
      'Dragonborn naming traditions drawing on draconic lexical patterns — distinct from true dragon naming.',
  },
  {
    id: 'tiefling',
    label: 'Tiefling',
    origin: 'fictional',
    languageIds: ['infernal'],
    description: 'Fiend-touched personal naming — virtue names as optional chosen surnames.',
  },
  {
    id: 'gnome',
    label: 'Gnome',
    origin: 'fictional',
    languageIds: ['gnomish'],
    description: 'Gnomish personal and settlement naming traditions.',
  },
  {
    id: 'goliath',
    label: 'Goliath',
    origin: 'fictional',
    languageIds: ['giant'],
    description: 'Goliath naming with birth name, earned epithet, and clan name.',
  },
  {
    id: 'orc',
    label: 'Orc',
    origin: 'fictional',
    languageIds: ['orc'],
    description: 'Orc personal naming — short, harsh given names without modeled clan surnames.',
  },
  {
    id: 'human',
    label: 'Human',
    origin: 'fictional',
    selectable: false,
    description:
      'Human cultural affiliation — name generation is not yet modeled for this tradition.',
  },
  {
    id: 'akan',
    label: 'Akan',
    origin: 'historical',
    regionIds: ['west-africa'],
    description: 'Precisely labeled akan naming tradition — not a broad regional label.',
  },
] as const satisfies readonly NamingCulture[]
