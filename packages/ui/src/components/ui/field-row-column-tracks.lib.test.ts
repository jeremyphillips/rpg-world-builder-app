import { describe, expect, it } from 'vitest'

import type { FieldWidth } from './field-control.variants'
import {
  FIELD_WIDTH_FIXED_TRACKS,
  FIELD_WIDTH_FRACTION_WEIGHTS,
  modelFlexProportionalWidths,
  modelGridTrackWidths,
  resolveFieldRowColumnTracks,
} from './field-row-column-tracks.lib'

const FORM_GAP_PX = 24 // gap-6

function expectWidthsClose(actual: number[], expected: number[], tolerance = 1) {
  expect(actual).toHaveLength(expected.length)
  for (let index = 0; index < expected.length; index += 1) {
    expect(Math.abs(actual[index]! - expected[index]!)).toBeLessThanOrEqual(tolerance)
  }
}

function flexWidthsForTokens(
  widths: FieldWidth[],
  containerWidth: number,
  autoContent: number[] = [],
): number[] {
  return modelFlexProportionalWidths({
    containerWidth,
    gap: FORM_GAP_PX,
    growWeights: widths.map((width) => {
      if (width === 'full') return 1
      if (width in FIELD_WIDTH_FRACTION_WEIGHTS) {
        return FIELD_WIDTH_FRACTION_WEIGHTS[width as keyof typeof FIELD_WIDTH_FRACTION_WEIGHTS]
      }
      return 0
    }),
    maxWidths: widths.map((width) => {
      if (width === '1/4') return containerWidth * 0.25
      if (width === '1/3') return containerWidth / 3
      if (width === '1/2') return containerWidth * 0.5
      if (width === '2/3') return (containerWidth * 2) / 3
      if (width === '3/4') return containerWidth * 0.75
      return Number.POSITIVE_INFINITY
    }),
    baseWidths: widths.map((width, index) => {
      if (width in FIELD_WIDTH_FIXED_TRACKS) {
        const rem = Number.parseFloat(
          FIELD_WIDTH_FIXED_TRACKS[width as keyof typeof FIELD_WIDTH_FIXED_TRACKS],
        )
        return rem * 16
      }
      if (width === 'auto') return autoContent[index] ?? 80
      return 0
    }),
  })
}

describe('resolveFieldRowColumnTracks — representative dashboard rows', () => {
  it('tools 1/2 + 1/2 → equal fr tracks (no filler)', () => {
    const result = resolveFieldRowColumnTracks(['1/2', '1/2'])
    expect(result.strategy).toBe('fraction-fr')
    expect(result.usedPhantomFiller).toBe(false)
    expect(result.gridTemplateColumns).toBe('minmax(0, 6fr) minmax(0, 6fr)')
  })

  it('content-identity full + 1/3 → percent-capped fraction so full absorbs leftover', () => {
    const result = resolveFieldRowColumnTracks(['full', '1/3'])
    expect(result.strategy).toBe('fraction-max-percent')
    expect(result.usedPhantomFiller).toBe(false)
    expect(result.tracks[0]).toBe('minmax(0, 1fr)')
    expect(result.tracks[1]).toMatch(/^minmax\(0, 33\.333%?\)$|^minmax\(0, 33\.3333%\)$/)
  })

  it('content-speed all-auto → max-content tracks', () => {
    const result = resolveFieldRowColumnTracks(['auto', 'auto', 'auto', 'auto'])
    expect(result.strategy).toBe('literal')
    expect(result.tracks).toEqual(['max-content', 'max-content', 'max-content', 'max-content'])
  })

  it('weapons three lg → fixed 12rem tracks', () => {
    const result = resolveFieldRowColumnTracks(['lg', 'lg', 'lg'])
    expect(result.strategy).toBe('literal')
    expect(result.gridTemplateColumns).toBe('12rem 12rem 12rem')
  })

  it('resolution auto + xl → max-content + 16rem', () => {
    const result = resolveFieldRowColumnTracks(['auto', 'xl'])
    expect(result.strategy).toBe('literal')
    expect(result.gridTemplateColumns).toBe('max-content 16rem')
  })

  it('never introduces a phantom filler track', () => {
    const cases: FieldWidth[][] = [
      ['1/2'],
      ['1/3', '1/3'],
      ['full', '1/3'],
      ['1/4', '1/4', '1/2'],
      ['md', 'full'],
      ['auto', '1/2'],
    ]
    for (const widths of cases) {
      expect(resolveFieldRowColumnTracks(widths).usedPhantomFiller).toBe(false)
    }
  })
})

describe('resolveFieldRowColumnTracks — token coverage', () => {
  it('maps every fixed token to its rem track', () => {
    expect(resolveFieldRowColumnTracks(['xs']).tracks[0]).toBe('4rem')
    expect(resolveFieldRowColumnTracks(['sm']).tracks[0]).toBe('6rem')
    expect(resolveFieldRowColumnTracks(['md']).tracks[0]).toBe('9rem')
    expect(resolveFieldRowColumnTracks(['lg']).tracks[0]).toBe('12rem')
    expect(resolveFieldRowColumnTracks(['xl']).tracks[0]).toBe('16rem')
  })

  it('uses incomplete percent strategy for a lone fraction', () => {
    const result = resolveFieldRowColumnTracks(['1/2'])
    expect(result.strategy).toBe('fraction-incomplete')
    expect(result.gridTemplateColumns).toBe('minmax(0, 50%)')
  })

  it('composes 1/4 + 1/4 + 1/2 as base-12 fr weights', () => {
    const result = resolveFieldRowColumnTracks(['1/4', '1/4', '1/2'])
    expect(result.strategy).toBe('fraction-fr')
    expect(result.gridTemplateColumns).toBe('minmax(0, 3fr) minmax(0, 3fr) minmax(0, 6fr)')
  })
})

describe('flex ↔ grid width parity models', () => {
  const containers = [480, 720, 960, 1200]

  it('matches tools 1/2 + 1/2 across container widths', () => {
    const tokens: FieldWidth[] = ['1/2', '1/2']
    const { tracks } = resolveFieldRowColumnTracks(tokens)
    for (const containerWidth of containers) {
      const flex = flexWidthsForTokens(tokens, containerWidth)
      const grid = modelGridTrackWidths({
        containerWidth,
        gap: FORM_GAP_PX,
        tracks,
      })
      expectWidthsClose(grid, flex)
    }
  })

  it('matches content-identity full + 1/3 (the flex max-width redistribution case)', () => {
    const tokens: FieldWidth[] = ['full', '1/3']
    const { tracks } = resolveFieldRowColumnTracks(tokens)
    for (const containerWidth of containers) {
      const flex = flexWidthsForTokens(tokens, containerWidth)
      const grid = modelGridTrackWidths({
        containerWidth,
        gap: FORM_GAP_PX,
        tracks,
      })
      // full should be ~2/3 after 1/3 caps — not the naive 1:4 grow split
      expect(flex[1]!).toBeCloseTo(containerWidth / 3, 0)
      expect(flex[0]!).toBeGreaterThan(containerWidth * 0.5)
      expectWidthsClose(grid, flex, 2)
    }
  })

  it('matches weapons three lg fixed tracks', () => {
    const tokens: FieldWidth[] = ['lg', 'lg', 'lg']
    const { tracks } = resolveFieldRowColumnTracks(tokens)
    for (const containerWidth of containers) {
      const flex = flexWidthsForTokens(tokens, containerWidth)
      const grid = modelGridTrackWidths({
        containerWidth,
        gap: FORM_GAP_PX,
        tracks,
      })
      expectWidthsClose(grid, flex)
      expect(flex.every((width) => width === 192)).toBe(true)
    }
  })

  it('matches resolution auto + xl using content width for auto', () => {
    const tokens: FieldWidth[] = ['auto', 'xl']
    const autoContent = [96, 0]
    const { tracks } = resolveFieldRowColumnTracks(tokens)
    for (const containerWidth of containers) {
      const flex = flexWidthsForTokens(tokens, containerWidth, autoContent)
      const grid = modelGridTrackWidths({
        containerWidth,
        gap: FORM_GAP_PX,
        tracks,
        contentWidths: autoContent,
      })
      expectWidthsClose(grid, flex)
    }
  })

  it('matches lone 1/2 without a phantom filler (50% track)', () => {
    const tokens: FieldWidth[] = ['1/2']
    const { tracks, usedPhantomFiller } = resolveFieldRowColumnTracks(tokens)
    expect(usedPhantomFiller).toBe(false)
    for (const containerWidth of containers) {
      const flex = flexWidthsForTokens(tokens, containerWidth)
      const grid = modelGridTrackWidths({
        containerWidth,
        gap: FORM_GAP_PX,
        tracks,
      })
      expectWidthsClose(grid, flex)
      expect(flex[0]!).toBeCloseTo(containerWidth * 0.5, 0)
    }
  })

  it('rejects naive 1fr+4fr for full+1/3 (documents why percent strategy exists)', () => {
    const containerWidth = 1200
    const tokens: FieldWidth[] = ['full', '1/3']
    const flex = flexWidthsForTokens(tokens, containerWidth)
    const naive = modelGridTrackWidths({
      containerWidth,
      gap: FORM_GAP_PX,
      tracks: ['minmax(0, 1fr)', 'minmax(0, 4fr)'],
    })
    // Naive fr starves `full` (~20%) vs flex (~67%).
    expect(naive[0]!).toBeLessThan(containerWidth * 0.3)
    expect(flex[0]!).toBeGreaterThan(containerWidth * 0.5)
    expect(Math.abs(naive[0]! - flex[0]!)).toBeGreaterThan(200)
  })
})
