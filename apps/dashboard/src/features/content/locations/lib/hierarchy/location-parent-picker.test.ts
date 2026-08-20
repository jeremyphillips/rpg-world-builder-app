import { describe, expect, it } from 'vitest'

import { DOCK_WARD, GREYSHORE, HARBORFORD, YAWNING_PORTAL } from '../../fixtures'
import {
  buildParentLocationOptionAvailability,
  parentLocationFieldVisibility,
} from './location-parent-picker'

describe('parentLocationFieldVisibility', () => {
  const visibleWhen = parentLocationFieldVisibility().visibleWhen!

  it('hides the parent field when authoring type is unset or invalid', () => {
    expect(visibleWhen({})).toBe(false)
    expect(visibleWhen({ authoringType: '' })).toBe(false)
    expect(visibleWhen({ authoringType: 'not-a-type' })).toBe(false)
  })

  it('shows the parent field for types that allow a parent', () => {
    expect(visibleWhen({ authoringType: 'region' })).toBe(true)
  })

  it('hides the parent field for types that forbid a parent', () => {
    expect(visibleWhen({ authoringType: 'plane' })).toBe(false)
  })

  it('maps building authoring type to structure kind for parent visibility', () => {
    expect(visibleWhen({ authoringType: 'building' })).toBe(true)
  })
})

describe('buildParentLocationOptionAvailability', () => {
  const enabledWhen = buildParentLocationOptionAvailability(
    [GREYSHORE, DOCK_WARD, YAWNING_PORTAL],
    YAWNING_PORTAL.id,
  ).enabledWhen!

  it('maps building authoring type to structure kind when validating parents', () => {
    expect(enabledWhen({ authoringType: 'building' }, DOCK_WARD.id)).toBe(true)
    expect(enabledWhen({ authoringType: 'building' }, GREYSHORE.id)).toBe(false)
  })

  it('rejects self as a parent option', () => {
    expect(enabledWhen({ authoringType: 'building' }, YAWNING_PORTAL.id)).toBe(false)
  })

  it('omits other districts as parent options for district authoring type', () => {
    const districtEnabledWhen = buildParentLocationOptionAvailability(
      [GREYSHORE, DOCK_WARD, HARBORFORD],
      'location-new-district',
    ).enabledWhen!

    expect(districtEnabledWhen({ authoringType: 'district' }, HARBORFORD.id)).toBe(true)
    expect(districtEnabledWhen({ authoringType: 'district' }, DOCK_WARD.id)).toBe(false)
  })
})
