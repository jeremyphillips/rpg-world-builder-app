import { describe, expect, it } from 'vitest'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from './character-builder-fixtures'
import {
  buildCharacterCardViewModel,
  buildCharacterDetailViewModel,
  formatCharacterSummary,
} from './character-display'
import { SAMPLE_PC } from './character-fixtures'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

describe('formatCharacterSummary', () => {
  it('formats a single-class character summary', () => {
    expect(formatCharacterSummary(SAMPLE_PC, catalogIndex)).toBe('Dwarf · Level 1 Fighter')
  })

  it('includes subclass labels when present', () => {
    const character = {
      ...SAMPLE_PC,
      classes: [
        {
          classId: 'srd-cc-5.2.1:fighter',
          subclassId: 'srd-cc-5.2.1:champion',
          level: 3,
        },
      ],
    }

    expect(formatCharacterSummary(character, catalogIndex)).toBe(
      'Dwarf · Level 3 Fighter (Champion)',
    )
  })
})

describe('buildCharacterCardViewModel', () => {
  it('maps roster card fields from the character sheet', () => {
    expect(buildCharacterCardViewModel(SAMPLE_PC, catalogIndex)).toEqual({
      id: 'char-sample-1',
      name: 'Verna',
      summary: 'Dwarf · Level 1 Fighter',
    })
  })
})

describe('buildCharacterDetailViewModel', () => {
  it('derives combat stats, XP, and structured ability tiles from the persisted sheet', () => {
    const viewModel = buildCharacterDetailViewModel({
      character: SAMPLE_PC,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
    })

    expect(viewModel.identity.summary).toBe('Dwarf · Level 1 Fighter')
    expect(viewModel.identity.xp).toBe('0')
    expect(viewModel.stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ac', label: 'AC' }),
        expect.objectContaining({ id: 'speed', caption: 'Walk', value: '30' }),
      ]),
    )
    expect(viewModel.stats.find((stat) => stat.id === 'speed')).toEqual({
      id: 'speed',
      label: 'Speed',
      value: '30',
      caption: 'Walk',
    })
    expect(viewModel.hitPoints).toEqual({
      current: '11',
      max: '11',
      temporary: '—',
    })
    expect(viewModel.abilities[0]).toEqual(
      expect.objectContaining({
        id: 'str',
        label: 'Strength',
        score: '15',
        modifier: '+2',
      }),
    )
    expect(viewModel.proficiencies.groups).toEqual([])
    expect(viewModel.narrative?.backstory).toContain('hardy dwarf fighter')
  })
})
