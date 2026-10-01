import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { CharacterBuildCatalogIndex } from '../context'
import { createCharacterBuildContext, dwarfSpecies } from '../test-fixtures'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import {
  buildEquipmentPreferenceStream,
  compareEquipmentPreferenceTuples,
  collectHeldEquipmentSlugKeys,
  filterHeldEquipmentPreferences,
  suggestedSourcesForEquipmentPreferenceMatch,
  bestEquipmentPreferenceMatchForReachableIds,
} from './equipment-preference-stream'

const RULESET = 'srd-cc-5.2.1' as const

const spear = equipmentSchema.parse({
  id: `${RULESET}:spear`,
  slug: 'spear',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Spear',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
  properties: ['thrown'],
  mastery: 'sap',
})

const longsword = equipmentSchema.parse({
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
})

function catalogIndex(): CharacterBuildCatalogIndex {
  return {
    species: new Map(),
    classes: new Map(),
    spells: new Map(),
    equipment: new Map([
      [spear.id, spear],
      [longsword.id, longsword],
    ]),
    skillProficiencies: new Map(),
    organizations: new Map(),
    languages: [],
  }
}

describe('equipment preference stream', () => {
  it('orders user preferences ahead of role preferences by tuple', () => {
    const stream = buildEquipmentPreferenceStream({
      userSlugs: ['longsword'],
      templateSlugs: ['spear', 'longsword', 'javelin'],
    })
    const match = bestEquipmentPreferenceMatchForReachableIds({
      equipmentIds: [longsword.id],
      stream,
      catalogIndex: catalogIndex(),
    })
    expect(match?.entry.source).toBe('user')
    expect(match?.tuple).toEqual([0, 0])
  })

  it('lets one user preference beat several role matches', () => {
    const stream = buildEquipmentPreferenceStream({
      userSlugs: ['longsword'],
      titleSlugs: ['spear'],
      templateSlugs: ['spear', 'greatsword', 'javelin'],
    })
    const userTuple = bestEquipmentPreferenceMatchForReachableIds({
      equipmentIds: [longsword.id],
      stream,
      catalogIndex: catalogIndex(),
    })!.tuple
    const roleOnlyTuple = bestEquipmentPreferenceMatchForReachableIds({
      equipmentIds: [spear.id],
      stream,
      catalogIndex: catalogIndex(),
    })!.tuple
    expect(compareEquipmentPreferenceTuples(userTuple, roleOnlyTuple)).toBeLessThan(0)
  })

  it('drops preferences already held in inventory', () => {
    const stream = buildEquipmentPreferenceStream({
      templateSlugs: ['spear', 'longsword'],
    })
    const filtered = filterHeldEquipmentPreferences(stream, new Set(['spear']))
    expect(filtered.map((entry) => entry.slug)).toEqual(['longsword'])
  })

  it('leaves suggestedBy unset when two sources tie on the winning tuple', () => {
    const stream = [
      {
        slug: 'longsword',
        source: 'title' as const,
        sourcePriority: 1,
        index: 0,
      },
      {
        slug: 'longsword',
        source: 'template' as const,
        sourcePriority: 1,
        index: 0,
      },
    ]
    const match = bestEquipmentPreferenceMatchForReachableIds({
      equipmentIds: [longsword.id],
      stream,
      catalogIndex: catalogIndex(),
    })
    expect(suggestedSourcesForEquipmentPreferenceMatch(stream, match, [longsword.id])).toEqual([])
  })

  it('does not treat an unmaterialized role default as held', () => {
    const context = createCharacterBuildContext({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: RULESET },
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: dwarfSpecies.id },
      class: { level: 0 },
      npcTemplateId: 'guard' as const,
    }
    const held = collectHeldEquipmentSlugKeys({
      draft,
      catalogIndex: catalogIndex(),
      context,
    })
    const stream = buildEquipmentPreferenceStream({ templateSlugs: ['spear', 'longsword'] })
    expect(filterHeldEquipmentPreferences(stream, held).map((entry) => entry.slug)).toEqual([
      'spear',
      'longsword',
    ])
  })

  it('attributes suggestedBy when one source owns the winning tuple', () => {
    const stream = buildEquipmentPreferenceStream({
      userSlugs: ['longsword'],
      templateSlugs: ['spear'],
    })
    const match = bestEquipmentPreferenceMatchForReachableIds({
      equipmentIds: [longsword.id],
      stream,
      catalogIndex: catalogIndex(),
    })
    expect(suggestedSourcesForEquipmentPreferenceMatch(stream, match, [longsword.id])).toEqual([
      'user',
    ])
  })
})
