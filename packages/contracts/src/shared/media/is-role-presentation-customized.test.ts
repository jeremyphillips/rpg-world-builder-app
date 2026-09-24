import { describe, expect, it } from 'vitest'

import { focalPointFromCropCenter, resetPrimaryCrop } from './geometry'
import { isRolePresentationCustomized } from './is-role-presentation-customized'

const source = { width: 2400, height: 1600 }

describe('isRolePresentationCustomized', () => {
  it('returns false for a default primary crop', () => {
    const crop = resetPrimaryCrop(source)
    expect(
      isRolePresentationCustomized({
        role: 'primary',
        presentation: { mode: 'crop', crop, focalPoint: focalPointFromCropCenter(crop) },
        source,
      }),
    ).toBe(false)
  })

  it('returns false when presentation is missing', () => {
    expect(
      isRolePresentationCustomized({
        role: 'primary',
        presentation: undefined,
        source,
      }),
    ).toBe(false)
  })

  it('returns true after a pan away from the default crop', () => {
    const crop = resetPrimaryCrop(source)
    expect(
      isRolePresentationCustomized({
        role: 'primary',
        presentation: {
          mode: 'crop',
          crop: { ...crop, x: crop.x + 0.05 },
          focalPoint: focalPointFromCropCenter(crop),
        },
        source,
      }),
    ).toBe(true)
  })

  it('returns true for a scaled emblem layout', () => {
    expect(
      isRolePresentationCustomized({
        role: 'emblem',
        presentation: { mode: 'contain', scale: 1.2 },
        source,
      }),
    ).toBe(true)
  })
})
