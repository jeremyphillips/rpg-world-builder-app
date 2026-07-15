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

  it('formats selection-mode method restriction for deferred attack on point mode', () => {
    expect(
      formatResolutionAvailabilityReason(
        {
          code: 'method-incompatible-with-selection-mode',
          method: 'melee-spell',
          selectionMode: 'point',
          hasAreaOfEffect: true,
          compatibility: 'deferred',
          reasonCode: 'attack-deferred-for-point-selection',
        },
        'option',
      ),
    ).toContain('Not yet available')
  })

  it('formats selection-mode method restriction for unsupported attack on self', () => {
    expect(
      formatResolutionAvailabilityReason(
        {
          code: 'method-incompatible-with-selection-mode',
          method: 'ranged-spell',
          selectionMode: 'self',
          hasAreaOfEffect: false,
          compatibility: 'unsupported',
          reasonCode: 'attack-unsupported-for-self-without-area',
        },
        'option',
      ),
    ).toContain('Not available for Self selection')
  })

  it('formats effect kind target restriction for option tone', () => {
    expect(
      formatResolutionAvailabilityReason(
        {
          code: 'effect-kind-incompatible-with-target',
          kind: 'healing',
          targetKind: 'object',
        },
        'option',
      ),
    ).toBe('Not available when the target is an object')
  })
})
