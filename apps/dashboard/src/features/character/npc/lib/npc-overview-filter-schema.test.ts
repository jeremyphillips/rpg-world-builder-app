import { describe, expect, it } from 'vitest'
import { applyFilterSchema } from '@rpg/ui/filters'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { npcOverviewFilterSchema } from './npc-overview-filter-schema'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const filterSchema = npcOverviewFilterSchema(catalogIndex)

const fighterNpc = {
  ...SAMPLE_PC,
  id: 'npc-fighter',
  characterType: 'npc' as const,
  campaignId: 'campaign-1',
  userId: undefined,
}

const warlockNpc = {
  ...fighterNpc,
  id: 'npc-warlock',
  classes: [{ classId: 'srd-cc-5.2.1:warlock', level: 3 }],
  species: { id: 'srd-cc-5.2.1:elf' },
}

describe('npcOverviewFilterSchema', () => {
  it('filters NPCs by primary class id', () => {
    const rows = applyFilterSchema(filterSchema, { classId: 'srd-cc-5.2.1:fighter' }, [
      fighterNpc,
      warlockNpc,
    ])

    expect(rows).toEqual([fighterNpc])
  })

  it('filters NPCs by species id', () => {
    const rows = applyFilterSchema(filterSchema, { speciesId: 'srd-cc-5.2.1:dwarf' }, [
      fighterNpc,
      warlockNpc,
    ])

    expect(rows).toEqual([fighterNpc])
  })
})
