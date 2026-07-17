import type { NameCulture } from '@rpg/contracts/name-generator'

export const NAME_CULTURES = [
  {
    id: 'high-elven',
    label: 'High Elven',
    origin: 'fictional',
    languageIds: ['elvish'],
    description: 'Refined elven naming traditions associated with elvish language affinity.',
  },
  {
    id: 'mountain-dwarf',
    label: 'Mountain Dwarf',
    origin: 'fictional',
    languageIds: ['dwarvish'],
    description: 'Hold- and clan-oriented dwarven naming patterns.',
  },
  {
    id: 'common-halfling',
    label: 'Common Halfling',
    origin: 'fictional',
    languageIds: ['halfling'],
    description: 'Pastoral halfling naming traditions associated with halfling language affinity.',
  },
  {
    id: 'draconic-dragonborn',
    label: 'Draconic Dragonborn',
    origin: 'fictional',
    languageIds: ['draconic'],
    description:
      'Dragonborn naming traditions drawing on draconic lexical patterns — distinct from true dragon naming.',
  },
  {
    id: 'infernal-tiefling',
    label: 'Infernal Tiefling',
    origin: 'fictional',
    languageIds: ['infernal'],
    description: 'Fiend-touched personal naming — virtue names as optional chosen surnames.',
  },
  {
    id: 'common-gnome',
    label: 'Common Gnome',
    origin: 'fictional',
    languageIds: ['gnomish'],
    description:
      'Gnomish personal and settlement naming — single culture covering forest and rock lineages at fixture depth.',
  },
  {
    id: 'giant-goliath',
    label: 'Giant Goliath',
    origin: 'fictional',
    languageIds: ['giant'],
    description: 'Goliath naming with birth name, earned epithet, and clan name.',
  },
  {
    id: 'common-orc',
    label: 'Common Orc',
    origin: 'fictional',
    languageIds: ['orc'],
    description: 'Orc personal naming — short, harsh given names without modeled clan surnames.',
  },
  {
    id: 'akan',
    label: 'Akan',
    origin: 'historical',
    regionIds: ['west-africa'],
    description: 'Precisely labeled akan naming tradition — not a broad regional label.',
  },
] as const satisfies readonly NameCulture[]
