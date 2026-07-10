import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'

import {
  equipmentMatchesRecommendationSelector,
  expandRecommendationSelector,
} from './equipment-recommendation-selector'

const RULESET = 'srd-cc-5.2.1' as const

const CONTENT_META = {
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const lute = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:lute`,
  slug: 'lute',
  name: 'Lute',
  description: '',
  cost: { amount: 35, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play', dc: 10 }],
})

const longsword = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { kind: 'dice', count: 1, faces: 8 },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
})

const catalog = new Map([
  [lute.id, lute],
  [longsword.id, longsword],
])

describe('equipmentMatchesRecommendationSelector', () => {
  it('matches exact equipment references and tool proficiency pools', () => {
    expect(
      equipmentMatchesRecommendationSelector({
        equipment: lute,
        selector: { kind: 'equipment', equipmentId: 'lute' },
        rulesetId: RULESET,
      }),
    ).toBe(true)

    expect(
      equipmentMatchesRecommendationSelector({
        equipment: lute,
        selector: {
          kind: 'tool_proficiency_pool',
          pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
        },
        rulesetId: RULESET,
      }),
    ).toBe(true)

    expect(
      equipmentMatchesRecommendationSelector({
        equipment: longsword,
        selector: {
          kind: 'tool_proficiency_pool',
          pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
        },
        rulesetId: RULESET,
      }),
    ).toBe(false)
  })
})

describe('expandRecommendationSelector', () => {
  it('expands filtered tool proficiency pools to catalog tools', () => {
    const matches = expandRecommendationSelector({
      selector: {
        kind: 'tool_proficiency_pool',
        pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
      },
      equipment: catalog,
      rulesetId: RULESET,
    })

    expect(matches.map((row) => row.id)).toEqual([lute.id])
  })
})
