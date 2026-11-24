import { describe, expect, it } from 'vitest'

import {
  formatRestRecoveryClause,
  formatRestRecoveryLabel,
  type RestRecovery,
} from './rest-recovery'

describe('formatRestRecoveryLabel', () => {
  it('names long and short thresholds', () => {
    expect(formatRestRecoveryLabel({ minimumRest: 'long' })).toBe('Long Rest')
    expect(formatRestRecoveryLabel({ minimumRest: 'short' })).toBe('Short or Long Rest')
  })
})

describe('formatRestRecoveryClause', () => {
  it('describes when slots are restored', () => {
    const long: RestRecovery = { minimumRest: 'long' }
    const short: RestRecovery = { minimumRest: 'short' }

    expect(formatRestRecoveryClause(long)).toBe('when you finish a Long Rest')
    expect(formatRestRecoveryClause(short)).toBe('when you finish a Short or Long Rest')
  })
})
