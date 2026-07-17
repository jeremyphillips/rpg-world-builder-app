import type { NameCulture } from '@rpg/contracts/name-generator'

const ELF_SPECIES_ID = 'srd-cc-5.2.1:elf'

export const NAME_CULTURES = [
  {
    id: 'elven-general',
    label: 'Elven',
    origin: 'fictional',
    languageIds: ['elvish'],
    selectable: false,
    description:
      'Shared elven personal and settlement naming — conventions bind here; heritage cultures resolve to this base.',
  },
  {
    id: 'high-elf',
    label: 'High Elf',
    origin: 'fictional',
    languageIds: ['elvish'],
    speciesIds: [ELF_SPECIES_ID],
    heritageIds: ['high-elf'],
    resolvesToCultureId: 'elven-general',
    description: 'High elf heritage naming — resolves to shared elven conventions.',
  },
  {
    id: 'wood-elf',
    label: 'Wood Elf',
    origin: 'fictional',
    languageIds: ['elvish'],
    speciesIds: [ELF_SPECIES_ID],
    heritageIds: ['wood-elf'],
    resolvesToCultureId: 'elven-general',
    description: 'Wood elf heritage naming — resolves to shared elven conventions.',
  },
  {
    id: 'drow',
    label: 'Drow',
    origin: 'fictional',
    languageIds: ['elvish'],
    speciesIds: [ELF_SPECIES_ID],
    heritageIds: ['drow'],
    resolvesToCultureId: 'elven-general',
    description: 'Drow heritage naming — resolves to shared elven conventions.',
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
