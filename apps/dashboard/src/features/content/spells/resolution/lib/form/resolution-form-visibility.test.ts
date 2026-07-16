import { describe, expect, it } from 'vitest'

import {
  combineFieldVisibility,
  isResolutionFormConfigured,
  visibleWhenAreaSelectionMode,
  visibleWhenCountKindEditable,
  visibleWhenNoResolution,
  visibleWhenResolutionConfigured,
  visibleWhenSelectionMode,
  visibleWhenSelectionModeIsOneOf,
  visibleWhenSelfWithoutArea,
  visibleWhenSelfWithArea,
} from './resolution-form-visibility'

describe('resolution form visibility', () => {
  it('treats a hydrated resolution object as configured', () => {
    expect(
      isResolutionFormConfigured({
        resolution: {
          selectionMode: 'targets',
          methodKind: 'attack',
          attackType: 'ranged-spell',
        },
      }),
    ).toBe(true)
    expect(
      visibleWhenResolutionConfigured().visibleWhen({
        resolution: { selectionMode: 'targets', methodKind: 'attack' },
      }),
    ).toBe(true)
    expect(
      visibleWhenNoResolution().visibleWhen({
        resolution: { selectionMode: 'targets', methodKind: 'attack' },
      }),
    ).toBe(false)
  })

  it('treats nested methodKind defaults as configured', () => {
    expect(isResolutionFormConfigured({ 'resolution.methodKind': 'saving-throw' })).toBe(true)
  })

  it('treats absent resolution as unmodeled', () => {
    expect(isResolutionFormConfigured({})).toBe(false)
    expect(visibleWhenNoResolution().visibleWhen({})).toBe(true)
    expect(visibleWhenResolutionConfigured().visibleWhen({})).toBe(false)
  })
})

describe('selection mode visibility matrix', () => {
  const modes = ['self', 'targets', 'point', 'none'] as const

  it('selectionMode select is always visible when configured', () => {
    for (const selectionMode of modes) {
      expect(
        visibleWhenResolutionConfigured().visibleWhen({
          resolution: { selectionMode, methodKind: 'automatic' },
        }),
      ).toBe(true)
    }
  })

  it('target proximity fields only in targets mode', () => {
    expect(
      visibleWhenSelectionMode('targets').visibleWhen({ 'resolution.selectionMode': 'targets' }),
    ).toBe(true)
    expect(
      visibleWhenSelectionMode('targets').visibleWhen({ 'resolution.selectionMode': 'self' }),
    ).toBe(false)
  })

  it('origin distance only in point mode', () => {
    expect(
      visibleWhenSelectionMode('point').visibleWhen({ 'resolution.selectionMode': 'point' }),
    ).toBe(true)
    expect(
      visibleWhenSelectionMode('point').visibleWhen({ 'resolution.selectionMode': 'targets' }),
    ).toBe(false)
  })

  it('countKind hidden when target count is 1', () => {
    expect(
      visibleWhenCountKindEditable().visibleWhen({
        'resolution.selectionMode': 'targets',
        'resolution.targetCount': 1,
      }),
    ).toBe(false)
    expect(
      visibleWhenCountKindEditable().visibleWhen({
        'resolution.selectionMode': 'targets',
        'resolution.targetCount': 6,
      }),
    ).toBe(true)
  })

  it('area panel visible for self and point modes', () => {
    const areaPanel = visibleWhenSelectionModeIsOneOf('self', 'point')
    expect(areaPanel.visibleWhen({ 'resolution.selectionMode': 'self' })).toBe(true)
    expect(areaPanel.visibleWhen({ 'resolution.selectionMode': 'point' })).toBe(true)
    expect(areaPanel.visibleWhen({ 'resolution.selectionMode': 'targets' })).toBe(false)
  })

  it('self recipient hint only without area', () => {
    expect(
      visibleWhenSelfWithoutArea().visibleWhen({
        'resolution.selectionMode': 'self',
        'resolution.areaOfEffect.shape': 'none',
      }),
    ).toBe(true)
    expect(
      visibleWhenSelfWithoutArea().visibleWhen({
        'resolution.selectionMode': 'self',
        'resolution.areaOfEffect.shape': 'cone',
      }),
    ).toBe(false)
  })

  it('self origin hint only with area', () => {
    expect(
      visibleWhenSelfWithArea().visibleWhen({
        'resolution.selectionMode': 'self',
        'resolution.areaOfEffect.shape': 'cone',
      }),
    ).toBe(true)
  })

  it('affected-area hint for self/point when area present', () => {
    expect(
      visibleWhenAreaSelectionMode().visibleWhen({
        'resolution.selectionMode': 'point',
        'resolution.areaOfEffect.shape': 'sphere',
      }),
    ).toBe(true)
  })

  it('none mode hides subordinate target fields via mode predicates', () => {
    const targetsOnly = combineFieldVisibility(
      visibleWhenSelectionMode('targets'),
      visibleWhenCountKindEditable(),
    )
    expect(
      targetsOnly.visibleWhen({
        'resolution.selectionMode': 'none',
        'resolution.targetCount': 6,
      }),
    ).toBe(false)
  })
})
