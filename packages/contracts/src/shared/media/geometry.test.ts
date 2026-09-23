import { describe, expect, it } from 'vitest'

import {
  cropFromFocalPoint,
  cropFromPanZoom,
  isSquareCrop,
  meetsPortraitMinimumCrop,
  resetPortraitCrop,
  resolveEffectiveCrop,
} from './geometry'

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
        crop: { x: 0.1, y: 0.2, width: 0.3, height: 0.3 },
        focalPoint: { x: 0.8, y: 0.8 },
      },
      { width: 1000, height: 800 },
    )

    expect(crop).toEqual({ x: 0.1, y: 0.2, width: 0.3, height: 0.3 })
  })

  it('derives a crop from focal point when no explicit crop exists', () => {
    const crop = resolveEffectiveCrop(
      { focalPoint: { x: 0.75, y: 0.25 } },
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
