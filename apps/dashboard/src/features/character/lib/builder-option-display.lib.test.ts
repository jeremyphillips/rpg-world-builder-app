import { describe, expect, it } from 'vitest'

import { DEFAULT_SYSTEM_RULESET_ID, type Species, type Spell } from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import { GRANT_SUMMARY_JOIN, SPECIES_SECTION_LABELS, SPECIES_STAT_LABELS } from '@/features/content'

import {
  buildSpeciesDetailsSheetContent,
  formatClassCardOption,
  formatSpeciesCardOption,
} from './builder-option-display.lib'
import { populatedBuilderCatalog } from './character-builder-fixtures'

const dwarfWithTraits = {
  ...populatedBuilderCatalog.species[0]!,
  traits: [
    {
      kind: 'grant',
      id: 'darkvision',
      grantGroups: [
        {
          grants: [{ kind: 'sense', type: 'darkvision', range: 120 }],
        },
      ],
    },
    {
      kind: 'custom',
      id: 'dwarven-resilience',
      name: 'Dwarven Resilience',
      description: '<p>Poison resistance.</p>',
    },
  ],
  languageAffinities: ['dwarvish'],
} as const satisfies Species

const drowHeritageSpells = [
  {
    id: 'srd-cc-5.2.1:dancing-lights',
    slug: 'dancing-lights',
    name: 'Dancing Lights',
    level: 0,
  },
  {
    id: 'srd-cc-5.2.1:faerie-fire',
    slug: 'faerie-fire',
    name: 'Faerie Fire',
    level: 1,
  },
  {
    id: 'srd-cc-5.2.1:darkness',
    slug: 'darkness',
    name: 'Darkness',
    level: 2,
  },
] as Spell[]

const elfWithDrowHeritage = {
  ...dwarfWithTraits,
  name: 'Elf',
  heritage: {
    id: 'elven-lineage',
    name: 'Elven Lineage',
    description: '<p>Choose a lineage.</p>',
    choose: 1,
    options: [
      {
        kind: 'custom',
        id: 'drow',
        name: 'Drow',
        description: '<p>Prose fallback.</p>',
        grantGroups: [
          {
            grants: [
              { kind: 'sense', type: 'darkvision', range: 120 },
              {
                kind: 'spells',
                ability: 'cha',
                mode: 'free_cast',
                spellIds: ['dancing-lights'],
                frequency: 'at_will',
              },
            ],
          },
          {
            unlock: { level: 3 },
            grants: [
              {
                kind: 'spells',
                ability: 'cha',
                mode: 'free_cast',
                spellIds: ['faerie-fire'],
                frequency: 'once_per_long_rest',
              },
            ],
          },
          {
            unlock: { level: 5 },
            grants: [
              {
                kind: 'spells',
                ability: 'cha',
                mode: 'free_cast',
                spellIds: ['darkness'],
                frequency: 'once_per_long_rest',
              },
            ],
          },
        ],
      },
    ],
  },
} as const satisfies Species

describe('builder-option-display.lib', () => {
  it('formats species card rows with creature type label and trait names', () => {
    expect(formatSpeciesCardOption(dwarfWithTraits)).toEqual({
      label: 'Dwarf',
      description: 'Humanoid',
      summaryItems: ['Darkvision', 'Dwarven Resilience'],
    })
  })

  it('formats class card rows as inline ability and hit die summary', () => {
    const fighter = populatedBuilderCatalog.classes[0]!

    expect(formatClassCardOption(fighter)).toEqual({
      label: 'Fighter',
      description: 'Strength · d10 Hit Die',
    })
  })

  it('builds species detail sheet metadata, traits, language affinities, and senses', () => {
    const languages = listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)
    const content = buildSpeciesDetailsSheetContent(dwarfWithTraits, languages)
    const dwarvishLabel =
      languages.find((language) => language.id === 'dwarvish')?.label ?? 'dwarvish'

    expect(content.title).toBe('Dwarf')
    expect(content.eyebrow).toBe('Species')
    expect(content.metadata).toEqual(
      expect.arrayContaining([
        { label: SPECIES_STAT_LABELS.creatureType, value: 'Humanoid' },
        { label: SPECIES_STAT_LABELS.size, value: 'Medium' },
        { label: SPECIES_STAT_LABELS.speed, value: '30 ft.' },
        { label: SPECIES_STAT_LABELS.senses, value: 'Darkvision 120 ft.' },
        { label: SPECIES_STAT_LABELS.languageAffinities, value: dwarvishLabel },
      ]),
    )
    expect(content.sections[0]?.title).toBe(SPECIES_SECTION_LABELS.traits)
    expect(content.sections[0]?.items?.[0]?.title).toBe('Darkvision')
    expect(content.sections[0]?.items?.[1]?.title).toBe('Dwarven Resilience')
  })

  it('builds heritage grant summary lines without prose body in the builder sheet', () => {
    const languages = listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)
    const content = buildSpeciesDetailsSheetContent(
      elfWithDrowHeritage,
      languages,
      drowHeritageSpells,
    )
    const heritageSection = content.sections.find((section) => section.title === 'Elven Lineage')
    const drowItem = heritageSection?.items?.[0]

    expect(drowItem).toEqual({
      title: 'Drow',
      summaryLines: [
        `L1: Darkvision 120 ft${GRANT_SUMMARY_JOIN}Dancing Lights cantrip`,
        'L3: Faerie Fire spell',
        'L5: Darkness spell',
      ],
    })
    expect(drowItem).not.toHaveProperty('body')
  })
})
