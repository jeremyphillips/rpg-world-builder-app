import { describe, expect, it } from 'vitest'

import {
  canonicalizeEmblemPresentation,
  clampEmblemOffset,
  isDefaultEmblemPresentation,
  isEmblemCentered,
  resolveEmblemLayoutMetrics,
} from './emblem-layout'

const canvasSize = 256

describe('resolveEmblemLayoutMetrics', () => {
  it('fills width for a landscape source at 100% scale', () => {
    const metrics = resolveEmblemLayoutMetrics({
      source: { width: 512, height: 256 },
      canvasSize,
      layout: { scale: 1 },
    })

    expect(metrics.renderedWidth).toBe(canvasSize)
    expect(metrics.renderedHeight).toBe(128)
    expect(metrics.maxTranslationX).toBe(0)
    expect(metrics.maxTranslationY).toBeGreaterThan(0)
    expect(metrics.left).toBe(0)
    expect(metrics.top).toBe(Math.round((canvasSize - metrics.renderedHeight) / 2))
  })

  it('fills height for a tall source at 100% scale', () => {
    const metrics = resolveEmblemLayoutMetrics({
      source: { width: 256, height: 512 },
      canvasSize,
      layout: { scale: 1 },
    })

    expect(metrics.renderedHeight).toBe(canvasSize)
    expect(metrics.renderedWidth).toBe(128)
    expect(metrics.maxTranslationY).toBe(0)
    expect(metrics.maxTranslationX).toBeGreaterThan(0)
  })

  it('applies authored scale after contain-fit', () => {
    const full = resolveEmblemLayoutMetrics({
      source: { width: 256, height: 256 },
      canvasSize,
      layout: { scale: 1 },
    })
    const half = resolveEmblemLayoutMetrics({
      source: { width: 256, height: 256 },
      canvasSize,
      layout: { scale: 0.5 },
    })

    expect(half.renderedWidth).toBe(Math.round(full.renderedWidth / 2))
    expect(half.maxTranslationX).toBeGreaterThan(0)
    expect(half.maxTranslationY).toBeGreaterThan(0)
  })

  it('maps normalized offset to pixel placement', () => {
    const metrics = resolveEmblemLayoutMetrics({
      source: { width: 256, height: 256 },
      canvasSize,
      layout: { scale: 0.5, offset: { x: 1, y: -1 } },
    })

    expect(metrics.left).toBe(Math.round(metrics.maxTranslationX * 2))
    expect(metrics.top).toBe(0)
  })
})

describe('clampEmblemOffset', () => {
  it('zeroes axes with no available travel', () => {
    expect(clampEmblemOffset({ x: 0.5, y: 0.25 }, 0, 40)).toEqual({ x: 0, y: 0.25 })
  })
})

describe('canonicalizeEmblemPresentation', () => {
  it('omits offset when centered', () => {
    expect(
      canonicalizeEmblemPresentation({ width: 256, height: 256 }, { mode: 'contain', scale: 1 }),
    ).toEqual({ mode: 'contain', scale: 1 })
  })

  it('drops latent horizontal offset when travel is zero at 100%', () => {
    expect(
      canonicalizeEmblemPresentation(
        { width: 512, height: 256 },
        { mode: 'contain', scale: 1, offset: { x: 0.5, y: 0.25 } },
      ),
    ).toEqual({
      mode: 'contain',
      scale: 1,
      offset: { x: 0, y: 0.25 },
    })
  })

  it('restores horizontal offset to center when travel returns to zero', () => {
    const atHalf = canonicalizeEmblemPresentation(
      { width: 512, height: 256 },
      { mode: 'contain', scale: 0.5, offset: { x: 0.5, y: 0 } },
    )
    expect(atHalf.offset).toEqual({ x: 0.5, y: 0 })

    expect(
      canonicalizeEmblemPresentation(
        { width: 512, height: 256 },
        { mode: 'contain', scale: 1, offset: atHalf.offset },
      ),
    ).toEqual({ mode: 'contain', scale: 1 })
  })

  it('preserves offset on both axes when scale opens travel on landscape sources', () => {
    expect(
      canonicalizeEmblemPresentation(
        { width: 512, height: 256 },
        { mode: 'contain', scale: 0.5, offset: { x: 0.5, y: 0.25 } },
      ).offset,
    ).toEqual({ x: 0.5, y: 0.25 })
  })
})

describe('presentation helpers', () => {
  it('detects default and centered layouts', () => {
    expect(isDefaultEmblemPresentation({ mode: 'contain', scale: 1 })).toBe(true)
    expect(isDefaultEmblemPresentation({ mode: 'contain', scale: 0.75 })).toBe(false)
    expect(isEmblemCentered({ mode: 'contain', scale: 1 })).toBe(true)
    expect(isEmblemCentered({ mode: 'contain', scale: 1, offset: { x: 0.2, y: 0 } })).toBe(false)
  })
})
