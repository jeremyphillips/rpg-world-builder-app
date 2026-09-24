import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../validation/define-message'
import { contentMediaValidationMessages } from './content-media-validation-messages'
import {
  cropFromFocalPoint,
  cropFromPanZoom,
  fixedAspectRoleEligibility,
  isFixedAspectCrop,
  isSquareCrop,
  meetsFixedAspectMinimum,
  meetsPortraitMinimumCrop,
  resetFixedAspectCrop,
  resetPortraitCrop,
  resetPrimaryCrop,
  resolveEffectiveCrop,
  widestFixedAspectCropDimensions,
} from './geometry'
import { getFixedAspectCropSpec } from './role-crop-spec'
import { validateContentMedia } from './validate-content-media'
import { getContentMediaPolicy } from './media-policy'

describe('resetPortraitCrop', () => {
  it('centers the largest square on landscape sources', () => {
    expect(resetPortraitCrop({ width: 1600, height: 900 })).toEqual({
      x: 0.21875,
      y: 0,
      width: 0.5625,
      height: 1,
    })
  })

  it('centers the largest square on portrait sources', () => {
    expect(resetPortraitCrop({ width: 900, height: 1600 })).toEqual({
      x: 0,
      y: 0.21875,
      width: 1,
      height: 0.5625,
    })
  })

  it('covers square sources fully', () => {
    expect(resetPortraitCrop({ width: 512, height: 512 })).toEqual({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    })
  })
})

describe('fixed-aspect crop geometry', () => {
  const primarySpec = getFixedAspectCropSpec('primary')!
  const bannerSpec = getFixedAspectCropSpec('banner')!
  const portraitSpec = getFixedAspectCropSpec('portrait')!

  it('computes widest crops for 1:1, 3:1, and 4:3', () => {
    const source = { width: 1800, height: 1200 }
    expect(widestFixedAspectCropDimensions(source, 1)).toEqual({ cropW: 1200, cropH: 1200 })
    expect(widestFixedAspectCropDimensions(source, 3)).toEqual({ cropW: 1800, cropH: 600 })
    expect(widestFixedAspectCropDimensions(source, 4 / 3)).toEqual({ cropW: 1600, cropH: 1200 })
  })

  it('resets centered fixed-aspect crops', () => {
    const source = { width: 1600, height: 900 }
    const crop = resetFixedAspectCrop(source, primarySpec)
    expect(isFixedAspectCrop(crop, source, primarySpec)).toBe(true)
    expect(crop.x + crop.width / 2).toBeCloseTo(0.5)
    expect(crop.y + crop.height / 2).toBeCloseTo(0.5)
  })

  it('rejects primary crops below 800×600 and accepts 800×600 exactly', () => {
    const source = { width: 800, height: 600 }
    const passCrop = resetPrimaryCrop(source)
    expect(meetsFixedAspectMinimum(passCrop, source, primarySpec)).toBe(true)

    const failSource = { width: 799, height: 600 }
    const failCrop = resetPrimaryCrop(failSource)
    expect(meetsFixedAspectMinimum(failCrop, failSource, primarySpec)).toBe(false)
  })

  it('validates aspect ratio within tolerance for each role spec', () => {
    const source = { width: 1200, height: 900 }
    expect(isFixedAspectCrop(resetPrimaryCrop(source), source, primarySpec)).toBe(true)
    expect(isFixedAspectCrop(resetFixedAspectCrop(source, bannerSpec), source, bannerSpec)).toBe(
      true,
    )
    expect(
      isFixedAspectCrop(resetFixedAspectCrop(source, portraitSpec), source, portraitSpec),
    ).toBe(true)
  })
})

describe('cropFromPanZoom', () => {
  it('maps editor pan/zoom into normalized coordinates', () => {
    const crop = cropFromPanZoom({
      sourceWidth: 1600,
      sourceHeight: 900,
      viewportSize: 400,
      zoom: 1,
      panX: 200,
      panY: 100,
    })

    expect(crop.x).toBeCloseTo(0.125)
    expect(crop.y).toBeCloseTo(0.111111, 5)
    expect(crop.width).toBeCloseTo(0.25)
    expect(crop.height).toBeCloseTo(0.444444, 5)
  })

  it('clamps pan so the crop never exposes blank pixels', () => {
    const crop = cropFromPanZoom({
      sourceWidth: 800,
      sourceHeight: 600,
      viewportSize: 300,
      zoom: 2,
      panX: 999,
      panY: 999,
    })

    expect(crop.x + crop.width).toBeLessThanOrEqual(1 + Number.EPSILON)
    expect(crop.y + crop.height).toBeLessThanOrEqual(1 + Number.EPSILON)
  })
})

describe('resolveEffectiveCrop', () => {
  it('prefers explicit crop over focal point and reset', () => {
    const crop = resolveEffectiveCrop(
      {
        mode: 'crop',
        crop: { x: 0.1, y: 0.2, width: 0.3, height: 0.3 },
        focalPoint: { x: 0.8, y: 0.8 },
      },
      { width: 1000, height: 800 },
    )

    expect(crop).toEqual({ x: 0.1, y: 0.2, width: 0.3, height: 0.3 })
  })

  it('derives a crop from focal point when no explicit crop exists', () => {
    const crop = resolveEffectiveCrop(
      { mode: 'crop', focalPoint: { x: 0.75, y: 0.25 } },
      { width: 1200, height: 800 },
    )

    expect(isSquareCrop(crop, { width: 1200, height: 800 })).toBe(true)
    expect(crop.x).toBeGreaterThan(0)
  })

  it('falls back to reset when presentation is empty', () => {
    expect(resolveEffectiveCrop(undefined, { width: 640, height: 480 })).toEqual(
      resetPortraitCrop({ width: 640, height: 480 }),
    )
  })
})

describe('cropFromFocalPoint', () => {
  it('keeps the focal point inside the square when possible', () => {
    const crop = cropFromFocalPoint({ x: 0.5, y: 0.5 }, { width: 400, height: 200 })
    expect(isSquareCrop(crop, { width: 400, height: 200 })).toBe(true)
  })
})

describe('portrait eligibility helpers', () => {
  it('accepts square crops within tolerance and rejects nonsquare crops', () => {
    const source = { width: 1000, height: 800 }
    const square = resetPortraitCrop(source)
    const nonsquare = { x: 0, y: 0, width: 0.5, height: 0.4 }

    expect(isSquareCrop(square, source)).toBe(true)
    expect(isSquareCrop(nonsquare, source)).toBe(false)
  })

  it('enforces the minimum portrait edge requirement', () => {
    const source = { width: 200, height: 200 }
    const tooSmall = { x: 0, y: 0, width: 0.5, height: 0.5 }
    const largeEnough = resetPortraitCrop(source)

    expect(meetsPortraitMinimumCrop(tooSmall, source)).toBe(false)
    expect(meetsPortraitMinimumCrop(largeEnough, source)).toBe(true)
  })
})

describe('fixedAspectRoleEligibility and validateContentMedia', () => {
  it('emits the same formatted message for an invalid primary crop', () => {
    const source = { width: 1200, height: 900 }
    const invalidCrop = { x: 0, y: 0, width: 0.2, height: 0.2 }
    const eligibility = fixedAspectRoleEligibility('primary', source, {
      mode: 'crop',
      crop: invalidCrop,
    })
    expect(eligibility.eligible).toBe(false)
    if (eligibility.eligible) return

    const validation = validateContentMedia(
      {
        revision: 0,
        images: [{ id: 'img-1', assetId: 'asset-large' }],
        roles: {
          primary: {
            imageId: 'img-1',
            presentation: { mode: 'crop', crop: invalidCrop },
          },
        },
      },
      {
        policy: getContentMediaPolicy('class'),
        assetDimensionsById: { 'asset-large': { orientedWidth: 1200, orientedHeight: 900 } },
      },
    )

    expect(validation.ok).toBe(false)
    if (validation.ok) return
    const validationMessage = validation.issues.find((issue) =>
      issue.path.includes('primary'),
    )?.message
    expect(formatFieldMessage(eligibility.message)).toBe(formatFieldMessage(validationMessage!))
    expect(formatFieldMessage(eligibility.message)).toBe(
      formatFieldMessage(
        contentMediaValidationMessages.fixedAspectCropInvalid({
          roleLabel: 'Primary image',
          aspectLabel: '4:3',
          minWidthPx: 800,
          minHeightPx: 600,
        }),
      ),
    )
  })
})
