import { describe, expect, it } from 'vitest'

import type { Species } from '../../../../content/species'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { indexCharacterBuildCatalog } from '../../context'
import { builderTestLanguages, dwarfSpecies } from '../../test-fixtures'
import { deriveRecommendedLanguageIds } from './derive-recommended-language-ids'

const RULESET = 'srd-cc-5.2.1' as const

const dwarfWithAffinities = {
  ...dwarfSpecies,
  languageAffinities: ['dwarvish'],
} as const satisfies Species

const humanWithoutAffinities = {
  id: `${RULESET}:human`,
  slug: 'human',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Human',
  description: '<p>Versatile.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [],
} as const satisfies Species

const dragonbornWithDraconic = {
  id: `${RULESET}:dragonborn`,
  slug: 'dragonborn',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dragonborn',
  description: '<p>Draconic ancestry.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  languageAffinities: ['draconic'],
  traits: [],
} as const satisfies Species

const standardOriginOptionIds = ['common', 'elvish', 'dwarvish'] as const

describe('deriveRecommendedLanguageIds', () => {
  const catalogIndex = indexCharacterBuildCatalog({
    species: [dwarfWithAffinities, humanWithoutAffinities, dragonbornWithDraconic],
    classes: [],
    spells: [],
    equipment: [],
    skillProficiencies: [],
    languages: [...builderTestLanguages],
  })

  it('returns affinities intersected with the ChoiceSet option pool', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: dwarfWithAffinities.id },
    }

    const recommended = deriveRecommendedLanguageIds({
      draft,
      catalogIndex,
      choiceSetOptionIds: standardOriginOptionIds,
    })

    expect([...recommended]).toEqual(['dwarvish'])
  })

  it('returns an empty set when no species is selected', () => {
    const recommended = deriveRecommendedLanguageIds({
      draft: createEmptyCharacterBuilderDraft(),
      catalogIndex,
      choiceSetOptionIds: standardOriginOptionIds,
    })

    expect(recommended.size).toBe(0)
  })

  it('returns an empty set when the species has no language affinities', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: humanWithoutAffinities.id },
    }

    const recommended = deriveRecommendedLanguageIds({
      draft,
      catalogIndex,
      choiceSetOptionIds: standardOriginOptionIds,
    })

    expect(recommended.size).toBe(0)
  })

  it('does not recommend affinities outside the ChoiceSet option pool', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: dragonbornWithDraconic.id },
    }

    const recommended = deriveRecommendedLanguageIds({
      draft,
      catalogIndex,
      choiceSetOptionIds: standardOriginOptionIds,
    })

    expect(recommended.size).toBe(0)
  })

  it('returns an empty set when the ChoiceSet has no options', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: dwarfWithAffinities.id },
    }

    const recommended = deriveRecommendedLanguageIds({
      draft,
      catalogIndex,
      choiceSetOptionIds: [],
    })

    expect(recommended.size).toBe(0)
  })
})
