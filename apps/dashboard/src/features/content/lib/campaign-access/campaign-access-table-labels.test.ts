import { describe, expect, it } from 'vitest'

import {
  formatHiddenUnavailableNotice,
  formatNoAvailableMatchesLabel,
  formatUnavailableMatchesLine,
} from '../campaign-access/campaign-access-table-labels'

describe('campaign-access-table-labels', () => {
  it('formats hidden unavailable notices with singular and plural copy', () => {
    expect(formatHiddenUnavailableNotice(1)).toBe('1 hidden')
    expect(formatHiddenUnavailableNotice(3)).toBe('3 hidden')
  })

  it('formats empty-state copy from content nouns', () => {
    expect(formatNoAvailableMatchesLabel('classes')).toBe(
      'No available classes match these filters.',
    )
    expect(formatUnavailableMatchesLine(2, 'classes')).toBe('2 unavailable classes match.')
    expect(formatUnavailableMatchesLine(1, 'spell')).toBe('1 unavailable spell matches.')
  })
})
