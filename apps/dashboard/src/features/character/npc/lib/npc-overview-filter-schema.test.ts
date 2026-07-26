import { describe, expect, it } from 'vitest'
import { applyFilterSchema } from '@rpg/ui/filters'
import { createDefaultCharacterLifecycle } from '@rpg/contracts'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { npcOverviewFilterSchema } from './npc-overview-filter-schema'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const filterSchema = npcOverviewFilterSchema(catalogIndex)

const defaultLifecycle = createDefaultCharacterLifecycle()

const fighterNpc = {
  ...SAMPLE_PC,
  id: 'npc-fighter',
  name: 'Captain Aldric',
  characterType: 'npc' as const,
  campaignId: 'campaign-1',
  userId: undefined,
  lifecycle: defaultLifecycle,
}

const warlockNpc = {
  ...fighterNpc,
  id: 'npc-warlock',
  name: 'Mira Thornwick',
  classes: [{ classId: 'srd-cc-5.2.1:warlock', level: 3 }],
  species: { id: 'srd-cc-5.2.1:elf' },
}

const retiredNpc = {
  ...fighterNpc,
  id: 'npc-retired',
  name: 'Old Guard',
  lifecycle: {
    roster: { status: 'retired' as const },
    vital: { status: 'alive' as const },
  },
}

const deceasedNpc = {
  ...fighterNpc,
  id: 'npc-deceased',
  name: 'Fallen Scout',
  lifecycle: {
    roster: { status: 'active' as const },
    vital: { status: 'deceased' as const },
  },
}

describe('npcOverviewFilterSchema', () => {
  it('keeps class and species filters in the primary strip and lifecycle filters advanced', () => {
    expect(filterSchema.fields.map((field) => field.id)).toEqual([
      'name',
      'classId',
      'speciesId',
      'rosterStatus',
      'vitalStatus',
    ])
    expect(
      filterSchema.fields
        .filter((field) => field.id === 'classId' || field.id === 'speciesId')
        .every((field) => field.placement !== 'advanced'),
    ).toBe(true)
    expect(
      filterSchema.fields
        .filter((field) => field.id === 'rosterStatus' || field.id === 'vitalStatus')
        .every((field) => field.placement === 'advanced'),
    ).toBe(true)
  })

  it('shows retired and deceased NPCs when lifecycle filters are unset', () => {
    const rows = applyFilterSchema(filterSchema, {}, [fighterNpc, retiredNpc, deceasedNpc])

    expect(rows).toHaveLength(3)
  })

  it('filters NPCs by name', () => {
    const rows = applyFilterSchema(filterSchema, { name: 'mira' }, [fighterNpc, warlockNpc])

    expect(rows).toEqual([warlockNpc])
  })

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

  it('filters NPCs by roster status when opted in', () => {
    const rows = applyFilterSchema(filterSchema, { rosterStatus: 'retired' }, [
      fighterNpc,
      retiredNpc,
      deceasedNpc,
    ])

    expect(rows).toEqual([retiredNpc])
  })

  it('filters NPCs by vital status when opted in', () => {
    const rows = applyFilterSchema(filterSchema, { vitalStatus: 'deceased' }, [
      fighterNpc,
      retiredNpc,
      deceasedNpc,
    ])

    expect(rows).toEqual([deceasedNpc])
  })
})
