import { describe, expect, it } from 'vitest'

import {
  formatAvailabilityCountSummary,
  formatHiddenUnavailableNotice,
  formatNoAvailableMatchesLabel,
  formatUnavailableMatchesLine,
} from '../campaign-access/campaign-access-table-labels'

describe('campaign-access-table-labels', () => {
  it('formats availability count summaries for master-detail rails', () => {
    expect(formatAvailabilityCountSummary(13, 0)).toBe('13 available · 0 unavailable')
    expect(formatAvailabilityCountSummary(1, 1)).toBe('1 available · 1 unavailable')
  })

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
