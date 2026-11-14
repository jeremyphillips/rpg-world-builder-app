import { describe, expect, it } from 'vitest'

import { ACTION_ECONOMY_SECTION_LABELS, getActionEconomySectionLabel } from './action-economy'

describe('action economy section labels', () => {
  it('uses explicit section plurals', () => {
    expect(ACTION_ECONOMY_SECTION_LABELS).toEqual({
      action: 'Actions',
      'bonus-action': 'Bonus actions',
      reaction: 'Reactions',
    })
    expect(getActionEconomySectionLabel('action')).toBe('Actions')
    expect(getActionEconomySectionLabel('bonus-action')).toBe('Bonus actions')
    expect(getActionEconomySectionLabel('reaction')).toBe('Reactions')
  })
})
