import { describe, expect, it } from 'vitest'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../fixtures/character-builder-fixtures'
import {
  buildCharacterCardViewModel,
  buildCharacterDetailViewModel,
  formatCharacterSummaryFromCatalog,
} from './character-display'
import { SAMPLE_PC, makeCampaignNpcListItem } from '../fixtures/character-fixtures'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

describe('formatCharacterSummaryFromCatalog', () => {
  it('formats a single-class character summary', () => {
    expect(formatCharacterSummaryFromCatalog(SAMPLE_PC, catalogIndex)).toBe(
      'Dwarf · Level 1 Fighter',
    )
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

    expect(formatCharacterSummaryFromCatalog(character, catalogIndex)).toBe(
      'Dwarf · Level 3 Fighter (Champion)',
    )
  })

  it('formats multiclass summaries with class allocation', () => {
    const character = {
      ...SAMPLE_PC,
      classes: [
        { classId: 'srd-cc-5.2.1:fighter', level: 3 },
        { classId: 'srd-cc-5.2.1:rogue', level: 1 },
      ],
    }

    expect(formatCharacterSummaryFromCatalog(character, catalogIndex)).toBe(
      'Dwarf · Level 4 · Fighter 3 / Rogue 1',
    )
  })

  it('does not append per-class level for single-class summaries', () => {
    const character = {
      ...SAMPLE_PC,
      classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 4 }],
    }

    expect(formatCharacterSummaryFromCatalog(character, catalogIndex)).toBe(
      'Dwarf · Level 4 Fighter',
    )
    expect(formatCharacterSummaryFromCatalog(character, catalogIndex)).not.toContain('Fighter 4')
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

  it('maps campaign NPC list rows with the same summary formatter as PCs', () => {
    const npc = makeCampaignNpcListItem().character

    expect(buildCharacterCardViewModel(npc, catalogIndex)).toEqual({
      id: 'npc-1',
      name: 'Captain Aldric',
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
        expect.objectContaining({
          id: 'speed',
          footer: { kind: 'meta', text: 'Walk' },
          value: '30',
        }),
      ]),
    )
    expect(viewModel.stats.find((stat) => stat.id === 'speed')).toEqual({
      id: 'speed',
      label: 'Speed',
      value: '30',
      footer: { kind: 'meta', text: 'Walk' },
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
    expect(viewModel.connections.items).toEqual([])
    expect(viewModel.narrative?.backstory).toContain('hardy dwarf fighter')
  })

  it('maps saved organization reference resolutions for character detail', () => {
    const viewModel = buildCharacterDetailViewModel({
      character: SAMPLE_PC,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
      organizationReferences: [{ organizationId: 'organization-missing', organization: null }],
    })

    expect(viewModel.connections.items).toEqual([
      {
        id: 'organization:organization-missing',
        label: 'Unavailable organization',
        detail: 'This organization is missing or no longer available.',
      },
    ])
  })

  it('uses forward edge labels for character location connection detail', () => {
    const viewModel = buildCharacterDetailViewModel({
      character: SAMPLE_PC,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
      locationReferences: [
        {
          connection: { id: 'loc-conn-1', locationId: 'loc-1', kind: 'resides_at' },
          location: {
            id: 'loc-1',
            campaignId: 'campaign-1',
            name: 'Harbor House',
            slug: 'harbor-house',
            kind: 'structure',
          } as never,
        },
      ],
    })

    expect(viewModel.connections.items).toEqual([
      {
        id: 'location:loc-conn-1',
        label: 'Harbor House',
        detail: 'Resides at',
      },
    ])
  })
})
