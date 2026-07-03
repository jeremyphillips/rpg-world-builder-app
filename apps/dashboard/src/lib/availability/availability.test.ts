import { describe, expect, it } from 'vitest'

import {
  combineAvailabilityReasons,
  resolveAvailability,
  resolveAvailabilityAlertVariant,
  resolveAvailabilityBadge,
} from './availability'

describe('resolveAvailability', () => {
  it('returns active when no reasons are provided', () => {
    expect(resolveAvailability([])).toEqual({ status: 'active' })
  })

  it('returns inactive with reasons when any reason is present', () => {
    expect(
      resolveAvailability([
        { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      ]),
    ).toEqual({
      status: 'inactive',
      reasons: [{ code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' }],
    })
  })
})

describe('combineAvailabilityReasons', () => {
  it('adds the manual toggle reason when the row is inactive in campaign', () => {
    expect(combineAvailabilityReasons(false)).toEqual({
      status: 'inactive',
      reasons: [{ code: 'not-available-in-campaign' }],
    })
  })

  it('merges extra reasons with the manual toggle reason', () => {
    expect(
      combineAvailabilityReasons(false, [
        { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      ]),
    ).toEqual({
      status: 'inactive',
      reasons: [
        { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
        { code: 'not-available-in-campaign' },
      ],
    })
  })
})

describe('resolveAvailabilityBadge', () => {
  it('returns undefined for active availability', () => {
    expect(resolveAvailabilityBadge({ status: 'active' })).toBeUndefined()
  })

  it('uses the highest-severity reason badge label', () => {
    expect(
      resolveAvailabilityBadge({
        status: 'inactive',
        reasons: [
          { code: 'multiclassing-disabled', settingId: 'characterCreation.multiclassing.enabled' },
          { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
        ],
      }),
    ).toEqual({ variant: 'outline', label: 'Inactive' })
  })

  it('breaks severity ties using registry order', () => {
    expect(
      resolveAvailabilityBadge({
        status: 'inactive',
        reasons: [
          { code: 'not-available-in-campaign' },
          { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
        ],
      }),
    ).toEqual({ variant: 'outline', label: 'Inactive' })
  })
})

describe('resolveAvailabilityAlertVariant', () => {
  it('maps the primary reason severity to an alert variant', () => {
    expect(
      resolveAvailabilityAlertVariant({
        status: 'inactive',
        reasons: [
          { code: 'multiclassing-disabled', settingId: 'characterCreation.multiclassing.enabled' },
        ],
      }),
    ).toBe('info')
    expect(
      resolveAvailabilityAlertVariant({
        status: 'inactive',
        reasons: [
          { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
        ],
      }),
    ).toBe('warning')
  })
})
