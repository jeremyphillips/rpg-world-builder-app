import { describe, expect, it } from 'vitest'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { resolveNpcOverviewClassName, resolveNpcOverviewSpeciesName } from './npc-overview-display'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

const SAMPLE_NPC = {
  ...SAMPLE_PC,
  characterType: 'npc' as const,
  campaignId: 'campaign-1',
  userId: undefined,
}

describe('resolveNpcOverviewClassName', () => {
  it('resolves the first class entry from the catalog index', () => {
    expect(resolveNpcOverviewClassName(SAMPLE_NPC, catalogIndex)).toBe('Fighter')
  })

  it('title-cases unknown class ids', () => {
    const npc = {
      ...SAMPLE_NPC,
      classes: [{ classId: 'srd-cc-5.2.1:warlock', level: 1 }],
    }

    expect(resolveNpcOverviewClassName(npc, catalogIndex)).toBe('Warlock')
  })

  it('returns an em dash when no classes are present', () => {
    expect(resolveNpcOverviewClassName({ ...SAMPLE_NPC, classes: [] }, catalogIndex)).toBe('—')
  })
})

describe('resolveNpcOverviewSpeciesName', () => {
  it('resolves species from the catalog index', () => {
    expect(resolveNpcOverviewSpeciesName(SAMPLE_NPC, catalogIndex)).toBe('Dwarf')
  })

  it('title-cases unknown species ids', () => {
    const npc = {
      ...SAMPLE_NPC,
      species: { id: 'srd-cc-5.2.1:elf' },
    }

    expect(resolveNpcOverviewSpeciesName(npc, catalogIndex)).toBe('Elf')
  })
})
