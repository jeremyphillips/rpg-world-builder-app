import { describe, expect, it } from 'vitest'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/fixtures/character-builder-fixtures'
import { makeCampaignNpcListItem } from '../../lib/fixtures/character-fixtures'
import { resolveNpcOverviewClassName, resolveNpcOverviewSpeciesName } from './npc-overview-display'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

const SAMPLE_NPC = makeCampaignNpcListItem()

describe('resolveNpcOverviewClassName', () => {
  it('resolves the first class entry from the catalog index', () => {
    expect(resolveNpcOverviewClassName(SAMPLE_NPC.character, catalogIndex)).toBe('Fighter')
  })

  it('title-cases unknown class ids', () => {
    const character = {
      ...SAMPLE_NPC.character,
      classes: [{ classId: 'srd-cc-5.2.1:warlock', level: 1 }],
    }

    expect(resolveNpcOverviewClassName(character, catalogIndex)).toBe('Warlock')
  })

  it('returns an em dash when no classes are present', () => {
    expect(
      resolveNpcOverviewClassName({ ...SAMPLE_NPC.character, classes: [] }, catalogIndex),
    ).toBe('—')
  })
})

describe('resolveNpcOverviewSpeciesName', () => {
  it('resolves species from the catalog index', () => {
    expect(resolveNpcOverviewSpeciesName(SAMPLE_NPC.character, catalogIndex)).toBe('Dwarf')
  })

  it('title-cases unknown species ids', () => {
    const character = {
      ...SAMPLE_NPC.character,
      species: { id: 'srd-cc-5.2.1:elf' },
    }

    expect(resolveNpcOverviewSpeciesName(character, catalogIndex)).toBe('Elf')
  })
})
