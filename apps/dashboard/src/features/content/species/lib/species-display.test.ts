import { describe, expect, it } from 'vitest'

import { DEFAULT_SYSTEM_RULESET_ID, type Species } from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import {
  buildSeedCreatureTypeVocabulary,
  buildSeedSenseVocabulary,
  getCreatureTypeLabel,
  getSenseLabelFromVocabulary,
} from '@/features/homebrew'

import { pickSpecies } from '../../lib/fixtures/pick'

import {
  buildSpeciesCardViewModel,
  buildSpeciesDetailViewModel,
  SPECIES_SECTION_LABELS,
  SPECIES_STAT_LABELS,
} from './species-display'

const creatureTypeVocabulary = buildSeedCreatureTypeVocabulary()
const senseVocabulary = buildSeedSenseVocabulary()

const dwarfWithTraits = {
  ...pickSpecies('dwarf'),
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

function buildVocabulary(languages: ReturnType<typeof listLanguageSeedOptions>) {
  return {
    resolveCreatureTypeLabel: (id: string) => getCreatureTypeLabel(creatureTypeVocabulary, id),
    resolveLanguageLabel: (id: string) => languages.find((entry) => entry.id === id)?.label ?? id,
    resolveSenseLabel: (type: string) => getSenseLabelFromVocabulary(senseVocabulary, type),
  }
}

describe('species-display', () => {
  const languages = listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)
  const vocabulary = buildVocabulary(languages)
  const dwarvishLabel =
    languages.find((language) => language.id === 'dwarvish')?.label ?? 'dwarvish'

  it('builds card view model with resolved creature type and trait names', () => {
    expect(buildSpeciesCardViewModel(dwarfWithTraits, vocabulary)).toEqual({
      label: 'Dwarf',
      description: 'Humanoid',
      summaryItems: ['Darkvision', 'Dwarven Resilience'],
    })
  })

  it('builds detail stat rows with registry labels and formatted values', () => {
    const { statRows } = buildSpeciesDetailViewModel(dwarfWithTraits, vocabulary)

    expect(statRows).toEqual([
      { label: SPECIES_STAT_LABELS.creatureType, value: 'Humanoid' },
      { label: SPECIES_STAT_LABELS.size, value: 'Medium' },
      { label: SPECIES_STAT_LABELS.speed, value: '30 ft.' },
      { label: SPECIES_STAT_LABELS.senses, value: 'Darkvision 120 ft.' },
      { label: SPECIES_STAT_LABELS.languageAffinities, value: dwarvishLabel },
    ])
  })

  it('shows None for senses when no sense grants are present', () => {
    const speciesWithoutSenses = {
      ...dwarfWithTraits,
      traits: [dwarfWithTraits.traits[1]!],
    } as const satisfies Species

    const { statRows } = buildSpeciesDetailViewModel(speciesWithoutSenses, vocabulary)
    const sensesRow = statRows.find((row) => row.label === SPECIES_STAT_LABELS.senses)

    expect(sensesRow?.value).toBe('None')
  })

  it('omits language affinities stat row when absent', () => {
    const speciesWithoutLanguages = {
      ...dwarfWithTraits,
      languageAffinities: undefined,
    } as const satisfies Species

    const { statRows } = buildSpeciesDetailViewModel(speciesWithoutLanguages, vocabulary)

    expect(statRows.some((row) => row.label === SPECIES_STAT_LABELS.languageAffinities)).toBe(false)
  })

  it('builds traits section and omits heritage when absent', () => {
    const { sections } = buildSpeciesDetailViewModel(dwarfWithTraits, vocabulary)

    expect(sections).toHaveLength(1)
    expect(sections[0]).toMatchObject({
      id: 'traits',
      title: SPECIES_SECTION_LABELS.traits,
      items: [
        { id: 'darkvision', title: 'Darkvision' },
        {
          id: 'dwarven-resilience',
          title: 'Dwarven Resilience',
          bodyHtml: '<p>Poison resistance.</p>',
        },
      ],
    })
  })

  it('omits traits section when empty', () => {
    const speciesWithoutTraits = {
      ...dwarfWithTraits,
      traits: [],
    } as const satisfies Species

    const { sections } = buildSpeciesDetailViewModel(speciesWithoutTraits, vocabulary)

    expect(sections).toHaveLength(0)
  })

  it('builds heritage section when present', () => {
    const dragonborn = {
      ...dwarfWithTraits,
      heritage: {
        id: 'draconic-ancestry',
        name: 'Draconic Ancestry',
        description: '<p>Choose your ancestor.</p>',
        choose: 1,
        options: [
          {
            kind: 'custom',
            id: 'black',
            name: 'Black',
            description: '<p>Acid damage.</p>',
          },
        ],
      },
    } as const satisfies Species

    const { sections } = buildSpeciesDetailViewModel(dragonborn, vocabulary)

    expect(sections).toHaveLength(2)
    expect(sections[1]).toMatchObject({
      id: 'heritage',
      heritageId: 'draconic-ancestry',
      title: 'Draconic Ancestry',
      descriptionHtml: '<p>Choose your ancestor.</p>',
      items: [{ id: 'black', title: 'Black', bodyHtml: '<p>Acid damage.</p>' }],
    })
  })
})
