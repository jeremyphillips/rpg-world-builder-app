import { describe, expect, it } from 'vitest'

import { DEFAULT_SYSTEM_RULESET_ID, type Species } from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import { SPECIES_SECTION_LABELS, SPECIES_STAT_LABELS } from '@/features/content'
import {
  DROW_HERITAGE_SHEET_SUMMARY_LINES,
  getDrowHeritageSpellCatalog,
} from '@/features/content/lib/fixtures/grant-display-fixtures'
import { pickSpecies } from '@/features/content/lib/fixtures/pick'

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
        { label: SPECIES_STAT_LABELS.movement, value: 'Walk 30 ft' },
        { label: SPECIES_STAT_LABELS.senses, value: 'Darkvision 120 ft.' },
        { label: SPECIES_STAT_LABELS.languageAffinities, value: dwarvishLabel },
      ]),
    )
    expect(content.sections[0]?.title).toBe(SPECIES_SECTION_LABELS.traits)
    expect(content.sections[0]?.items?.[0]?.title).toBe('Darkvision')
    expect(content.sections[0]?.items?.[1]?.title).toBe('Dwarven Resilience')
  })

  it('builds catalog Elf heritage grant summary lines without prose body', () => {
    const languages = listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)
    const elf = pickSpecies('elf')
    const content = buildSpeciesDetailsSheetContent(elf, languages, getDrowHeritageSpellCatalog())
    const heritageSection = content.sections.find((section) => section.title === 'Elven Lineage')
    const drowItem = heritageSection?.items?.find((item) => item.title === 'Drow')

    expect(drowItem).toEqual({
      title: 'Drow',
      summaryLines: [...DROW_HERITAGE_SHEET_SUMMARY_LINES],
    })
    expect(drowItem).not.toHaveProperty('body')
  })

  it('keeps prose body for heritage options without grant groups', () => {
    const languages = listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)
    const speciesWithProseOnlyHeritage = {
      ...dwarfWithTraits,
      heritage: {
        id: 'test-heritage',
        name: 'Test Heritage',
        description: '<p>Choose an option.</p>',
        choose: 1,
        options: [
          {
            kind: 'custom',
            id: 'option-a',
            name: 'Option A',
            description: '<p>Acid resistance prose.</p>',
          },
        ],
      },
    } as const satisfies Species
    const content = buildSpeciesDetailsSheetContent(speciesWithProseOnlyHeritage, languages, [])
    const heritageSection = content.sections.find((section) => section.title === 'Test Heritage')
    const optionItem = heritageSection?.items?.[0]

    expect(optionItem?.body).toContain('Acid resistance prose')
    expect(optionItem).not.toHaveProperty('summaryLines')
  })
})
