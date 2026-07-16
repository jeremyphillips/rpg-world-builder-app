import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'

import {
  equipmentMatchesRecommendationSelector,
  expandRecommendationSelector,
  type EquipmentRecommendationSelector,
} from './equipment-recommendation-selector'
import {
  specificityForMatchCount,
  specificityForSelectorExpansion,
} from './equipment-recommendation-specificity'

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
  damage: { dice: { count: 1, faces: 8 } },
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

function makeMusicalInstrument(slug: string, name: string) {
  return equipmentSchema.parse({
    ...CONTENT_META,
    id: `${RULESET}:${slug}`,
    slug,
    name,
    description: '',
    cost: { amount: 10, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    kind: 'tool',
    toolCategory: 'musical_instrument',
    ability: 'cha',
    utilizes: [{ description: 'Play', dc: 10 }],
  })
}

describe('specificityForSelectorExpansion', () => {
  it('classifies exact equipment selectors as exact regardless of match count', () => {
    expect(specificityForSelectorExpansion({ kind: 'equipment', equipmentId: lute.id }, 10)).toBe(
      'exact',
    )
  })

  it('classifies pool expansion counts at threshold boundaries', () => {
    const oneToolCatalog = new Map([[lute.id, lute]])
    const threeTools = [
      makeMusicalInstrument('flute', 'Flute'),
      makeMusicalInstrument('drum', 'Drum'),
    ]
    const threeToolCatalog = new Map([
      [lute.id, lute],
      ...threeTools.map((tool) => [tool.id, tool] as const),
    ])
    const tenTools = [
      makeMusicalInstrument('bagpipes', 'Bagpipes'),
      makeMusicalInstrument('dulcimer', 'Dulcimer'),
      makeMusicalInstrument('horn', 'Horn'),
      makeMusicalInstrument('lyre', 'Lyre'),
      makeMusicalInstrument('pan-flute', 'Pan Flute'),
      makeMusicalInstrument('shawm', 'Shawm'),
      makeMusicalInstrument('viol', 'Viol'),
    ]
    const tenToolCatalog = new Map([
      [lute.id, lute],
      ...threeTools.map((tool) => [tool.id, tool] as const),
      ...tenTools.map((tool) => [tool.id, tool] as const),
    ])
    const pool: EquipmentRecommendationSelector = {
      kind: 'tool_proficiency_pool',
      pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
    }

    expect(
      specificityForSelectorExpansion(
        pool,
        expandRecommendationSelector({
          selector: pool,
          equipment: oneToolCatalog,
          rulesetId: RULESET,
        }).length,
      ),
    ).toBe('exact')
    expect(
      specificityForSelectorExpansion(
        pool,
        expandRecommendationSelector({
          selector: pool,
          equipment: threeToolCatalog,
          rulesetId: RULESET,
        }).length,
      ),
    ).toBe('narrow_pool')
    expect(
      specificityForSelectorExpansion(
        pool,
        expandRecommendationSelector({
          selector: pool,
          equipment: tenToolCatalog,
          rulesetId: RULESET,
        }).length,
      ),
    ).toBe('broad_pool')
  })

  it('classifies match counts directly via specificityForMatchCount', () => {
    expect(specificityForMatchCount(1)).toBe('exact')
    expect(specificityForMatchCount(2)).toBe('narrow_pool')
    expect(specificityForMatchCount(5)).toBe('narrow_pool')
    expect(specificityForMatchCount(6)).toBe('broad_pool')
  })
})
