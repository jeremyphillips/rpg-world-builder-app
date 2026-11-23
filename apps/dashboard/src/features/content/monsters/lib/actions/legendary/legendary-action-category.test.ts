import { describe, expect, it } from 'vitest'

import { parseMonsterActionAcquisitionId } from '../acquisition/monster-action-acquisition'
import {
  LEGENDARY_ACQUISITION_CATEGORIES,
  LEGENDARY_ACQUISITION_OPTION_ID,
  LEGENDARY_ACTION_CATEGORIES,
  isLegendaryAcquisitionCategory,
  type LegendaryActionCategory,
} from './legendary-action-category'

describe('legendary action category vocabulary', () => {
  it('composes editor categories from acquisition and editor-only subsets', () => {
    expect(LEGENDARY_ACTION_CATEGORIES).toEqual([
      'reference',
      'spellcasting',
      'cast-spell',
      'custom',
    ])
    for (const category of LEGENDARY_ACQUISITION_CATEGORIES) {
      expect(LEGENDARY_ACTION_CATEGORIES).toContain(category)
    }
  })

  it('maps acquisition categories to legendary menu option ids', () => {
    for (const category of LEGENDARY_ACQUISITION_CATEGORIES) {
      const optionId = LEGENDARY_ACQUISITION_OPTION_ID[category]
      expect(isLegendaryAcquisitionCategory(optionId.slice('legendary:'.length))).toBe(true)
    }
  })

  it('rejects unknown acquisition category strings', () => {
    expect(isLegendaryAcquisitionCategory('custom')).toBe(false)
    expect(isLegendaryAcquisitionCategory('bogus')).toBe(false)
  })

  it('keeps acquisition categories assignable to editor categories', () => {
    const editor: LegendaryActionCategory[] = [...LEGENDARY_ACQUISITION_CATEGORIES]
    expect(editor).toHaveLength(3)
  })

  it('round-trips acquisition menu ids through the shared parser', () => {
    for (const category of LEGENDARY_ACQUISITION_CATEGORIES) {
      expect(parseMonsterActionAcquisitionId(LEGENDARY_ACQUISITION_OPTION_ID[category])).toEqual({
        type: 'legendary',
        category,
      })
    }
  })
})
