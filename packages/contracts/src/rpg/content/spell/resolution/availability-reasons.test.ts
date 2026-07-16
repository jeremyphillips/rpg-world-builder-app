import { describe, expect, it } from 'vitest'

import { formatResolutionAvailabilityReason } from './availability-reasons'

describe('formatResolutionAvailabilityReason', () => {
  it('formats method proximity conflicts for option tone', () => {
    expect(
      formatResolutionAvailabilityReason(
        {
          code: 'method-incompatible-with-proximity',
          method: 'ranged-spell',
          proximity: 'self',
        },
        'option',
      ),
    ).toBe('Not available when target proximity is self')
  })

  it('formats pattern distance requirement for dialog tone', () => {
    expect(
      formatResolutionAvailabilityReason(
        { code: 'pattern-requires-distance-proximity', pattern: 'projectiles' },
        'dialog',
      ),
    ).toBe('Projectiles requires distance target proximity.')
  })

  it('formats effect kind method restriction for hint tone', () => {
    expect(
      formatResolutionAvailabilityReason(
        {
          code: 'effect-kind-unsupported-for-method',
          kind: 'healing',
          method: 'ranged-spell',
        },
        'hint',
      ),
    ).toContain('Healing')
  })
})
