import { describe, expect, it } from 'vitest'

import {
  AVAILABILITY_STATUS_AVAILABLE,
  AVAILABILITY_STATUS_UNAVAILABLE,
  resolveAvailabilityStatusSummary,
  resolveVocabularyAvailabilitySummary,
} from './availability-status-summary.lib'

describe('resolveAvailabilityStatusSummary', () => {
  it('returns shared available status with optional detail', () => {
    expect(resolveAvailabilityStatusSummary(true, 'All players')).toEqual({
      status: AVAILABILITY_STATUS_AVAILABLE,
      detail: 'All players',
    })
  })

  it('returns shared unavailable status with accent chrome', () => {
    expect(resolveAvailabilityStatusSummary(false, 'DM only')).toEqual({
      status: AVAILABILITY_STATUS_UNAVAILABLE,
      detail: 'DM only',
      chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
    })
  })
})

describe('resolveVocabularyAvailabilitySummary', () => {
  it('reuses the shared status chip without detail', () => {
    expect(resolveVocabularyAvailabilitySummary(true)).toEqual({
      status: AVAILABILITY_STATUS_AVAILABLE,
    })
  })
})
