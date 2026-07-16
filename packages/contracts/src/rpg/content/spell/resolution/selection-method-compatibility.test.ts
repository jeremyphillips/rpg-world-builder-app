import { describe, expect, it } from 'vitest'

import {
  getSelectionMethodCapabilityRequired,
  getSelectionMethodCompatibility,
  getSelectionMethodCompatibilityReasonCode,
  isSelectionMethodAllowed,
  resolveSelectionMethodContextKey,
  SELECTION_METHOD_COMPATIBILITY_MATRIX,
} from './selection-method-compatibility'

describe('SELECTION_METHOD_COMPATIBILITY_MATRIX', () => {
  it('documents targets mode — all methods supported', () => {
    expect(SELECTION_METHOD_COMPATIBILITY_MATRIX.targets).toEqual({
      attack: { compatibility: 'supported' },
      'saving-throw': { compatibility: 'supported' },
      automatic: { compatibility: 'supported' },
    })
  })

  it('documents point mode — attack deferred, save and automatic supported', () => {
    expect(getSelectionMethodCompatibility('point', 'attack')).toBe('deferred')
    expect(getSelectionMethodCompatibility('point', 'saving-throw')).toBe('supported')
    expect(getSelectionMethodCompatibility('point', 'automatic')).toBe('supported')
  })

  it('documents self without area — automatic supported, attack unsupported, save deferred', () => {
    expect(getSelectionMethodCompatibility('self-without-area', 'automatic')).toBe('supported')
    expect(getSelectionMethodCompatibility('self-without-area', 'attack')).toBe('unsupported')
    expect(getSelectionMethodCompatibility('self-without-area', 'saving-throw')).toBe('deferred')
  })

  it('documents self with area — attack deferred, save and automatic supported', () => {
    expect(getSelectionMethodCompatibility('self-with-area', 'attack')).toBe('deferred')
    expect(getSelectionMethodCompatibility('self-with-area', 'saving-throw')).toBe('supported')
    expect(getSelectionMethodCompatibility('self-with-area', 'automatic')).toBe('supported')
  })

  it('documents none mode — only automatic supported', () => {
    expect(getSelectionMethodCompatibility('none', 'automatic')).toBe('supported')
    expect(getSelectionMethodCompatibility('none', 'attack')).toBe('unsupported')
    expect(getSelectionMethodCompatibility('none', 'saving-throw')).toBe('unsupported')
  })
})

describe('selection method compatibility helpers', () => {
  it('maps self mode to area-split context keys', () => {
    expect(
      resolveSelectionMethodContextKey({ selectionMode: 'self', hasAreaOfEffect: false }),
    ).toBe('self-without-area')
    expect(resolveSelectionMethodContextKey({ selectionMode: 'self', hasAreaOfEffect: true })).toBe(
      'self-with-area',
    )
  })

  it('exposes distinct reason codes for blocked cells', () => {
    expect(getSelectionMethodCompatibilityReasonCode('point', 'attack')).toBe(
      'attack-deferred-for-point-selection',
    )
    expect(getSelectionMethodCapabilityRequired('attack-deferred-for-point-selection')).toBe(
      'point-origin-attack-resolution',
    )
  })

  it('blocks deferred and unsupported combinations for MVP', () => {
    expect(isSelectionMethodAllowed('point', 'attack')).toBe(false)
    expect(isSelectionMethodAllowed('self-without-area', 'saving-throw')).toBe(false)
    expect(isSelectionMethodAllowed('targets', 'attack')).toBe(true)
  })
})
