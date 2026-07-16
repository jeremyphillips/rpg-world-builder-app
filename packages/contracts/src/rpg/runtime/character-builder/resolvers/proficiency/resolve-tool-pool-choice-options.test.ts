import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../../../content/equipment'
import {
  resolveToolPoolChoiceOptions,
  validateToolProficiencyChoiceResolvable,
} from './resolve-tool-pool-choice-options'

const lute = {
  id: 'srd-cc-5.2.1:lute',
  slug: 'lute',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Lute',
  kind: 'tool',
  toolCategory: 'musical_instrument',
} as Extract<Equipment, { kind: 'tool' }>

const equipment = new Map([[lute.id, lute]])

describe('resolveToolPoolChoiceOptions', () => {
  it('omits missing explicit slugs from options', () => {
    expect(
      resolveToolPoolChoiceOptions(
        { source: 'explicit', toolSlugs: ['lute', 'missing-tool'] },
        equipment,
        'srd-cc-5.2.1',
      ),
    ).toEqual([{ id: lute.id, label: 'Lute' }])
  })

  it('expands filtered category pools against the catalog', () => {
    expect(
      resolveToolPoolChoiceOptions(
        { source: 'filtered', toolCategories: ['musical_instrument'] },
        equipment,
        'srd-cc-5.2.1',
      ),
    ).toEqual([{ id: lute.id, label: 'Lute' }])
  })
})

describe('validateToolProficiencyChoiceResolvable', () => {
  it('returns false when choose exceeds resolved options', () => {
    expect(
      validateToolProficiencyChoiceResolvable(
        {
          choose: 2,
          pool: { source: 'explicit', toolSlugs: ['lute'] },
        },
        equipment,
        'srd-cc-5.2.1',
      ),
    ).toBe(false)
  })

  it('returns true when choose fits the resolved pool', () => {
    expect(
      validateToolProficiencyChoiceResolvable(
        {
          choose: 1,
          pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
        },
        equipment,
        'srd-cc-5.2.1',
      ),
    ).toBe(true)
  })
})
