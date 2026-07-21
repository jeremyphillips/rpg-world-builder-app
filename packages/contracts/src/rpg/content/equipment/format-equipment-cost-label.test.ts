import { describe, expect, it } from 'vitest'

import { formatEquipmentCostLabel } from './format-equipment-cost-label'

describe('formatEquipmentCostLabel', () => {
  it('returns formatted money for priced equipment', () => {
    expect(formatEquipmentCostLabel({ amount: 15, currency: 'gp' })).toBe('15 GP')
  })

  it('returns undefined for null cost', () => {
    expect(formatEquipmentCostLabel(null)).toBeUndefined()
  })
})
