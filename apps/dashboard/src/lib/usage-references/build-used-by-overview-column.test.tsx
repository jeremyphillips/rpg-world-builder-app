import { describe, expect, it } from 'vitest'

import { buildUsedByOverviewColumn } from './build-used-by-overview-column'

describe('buildUsedByOverviewColumn', () => {
  it('uses the provided scope label and summary nouns', () => {
    const column = buildUsedByOverviewColumn({
      usageSummaryLabels: { singular: 'character', plural: 'characters' },
      columnLabel: 'Used by characters',
      scopeTooltip: 'Character-scoped usage only.',
    })

    expect(column.meta?.label).toBe('Used by characters')
    expect(column.id).toBe('usedBy')
  })
})
