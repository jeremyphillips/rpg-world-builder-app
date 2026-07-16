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
    id: 'akan',
    label: 'Akan',
    origin: 'historical',
    regionIds: ['west-africa'],
    description: 'Precisely labeled akan naming tradition — not a broad regional label.',
  },
] as const satisfies readonly NameCulture[]
