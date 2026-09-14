import { describe, expect, it } from 'vitest'

import { buildMasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import {
  deriveHiddenUnavailableCount,
  deriveMasterDetailAvailabilityState,
  isMasterDetailRowVisible,
  resolveMasterDetailSelectionAfterHide,
  resolveNextAvailableMasterDetailRowId,
} from './master-detail-availability-state.lib'

const items = [
  buildMasterDetailAvailabilityPresentation('a', true),
  buildMasterDetailAvailabilityPresentation('b', true),
  buildMasterDetailAvailabilityPresentation('c', false),
  buildMasterDetailAvailabilityPresentation('d', false),
]

describe('master-detail-availability-state.lib', () => {
  it('keeps a selected row visible and pinned when it becomes unavailable', () => {
    const state = deriveMasterDetailAvailabilityState(items, 'c', false)

    expect(state.selectedUnavailable).toBe(true)
    expect(state.isSelectedPinned).toBe(true)
    expect(state.pinnedRowId).toBe('c')
    expect(state.visibleItems.map((item) => item.rowId)).toEqual(['a', 'b', 'c'])
    expect(state.hiddenUnavailableCount).toBe(1)
    expect(state.canShowHiddenUnavailable).toBe(true)
  })

  it('expires the pin after selecting another row', () => {
    const state = deriveMasterDetailAvailabilityState(items, 'a', false)

    expect(state.pinnedRowId).toBeNull()
    expect(state.isSelectedPinned).toBe(false)
    expect(state.visibleItems.map((item) => item.rowId)).toEqual(['a', 'b'])
    expect(state.hiddenUnavailableCount).toBe(2)
  })

  it('suppresses Show when the only hidden unavailable row is the pinned selection', () => {
    const onlyUnavailable = [
      buildMasterDetailAvailabilityPresentation('a', true),
      buildMasterDetailAvailabilityPresentation('b', false),
    ]
    const state = deriveMasterDetailAvailabilityState(onlyUnavailable, 'b', false)

    expect(state.hiddenUnavailableCount).toBe(0)
    expect(state.canShowHiddenUnavailable).toBe(false)
    expect(state.isSelectedPinned).toBe(true)
    expect(state.visibleItems.map((item) => item.rowId)).toEqual(['a', 'b'])
  })

  it('reveals unavailable rows when Show is active', () => {
    const state = deriveMasterDetailAvailabilityState(items, 'c', true)

    expect(state.visibleItems.map((item) => item.rowId)).toEqual(['a', 'b', 'c', 'd'])
    expect(state.hiddenUnavailableCount).toBe(0)
    expect(state.canShowHiddenUnavailable).toBe(false)
    expect(state.canHideUnavailable).toBe(true)
    expect(state.isSelectedPinned).toBe(false)
  })

  it('moves selection to the next available row when Hide is explicit on an unavailable selection', () => {
    expect(resolveMasterDetailSelectionAfterHide(items, 'c')).toBe('b')
    expect(resolveMasterDetailSelectionAfterHide(items, 'd')).toBe('b')
  })

  it('falls back to the previous available row when no next row exists', () => {
    const onlyTrailingUnavailable = [
      buildMasterDetailAvailabilityPresentation('a', true),
      buildMasterDetailAvailabilityPresentation('b', false),
    ]

    expect(resolveMasterDetailSelectionAfterHide(onlyTrailingUnavailable, 'b')).toBe('a')
    expect(resolveNextAvailableMasterDetailRowId(onlyTrailingUnavailable, 'b')).toBe('a')
  })

  it('keeps the current selection when Hide has no available fallback', () => {
    const onlyUnavailable = [
      buildMasterDetailAvailabilityPresentation('a', false),
      buildMasterDetailAvailabilityPresentation('b', false),
    ]

    expect(resolveMasterDetailSelectionAfterHide(onlyUnavailable, 'a')).toBeUndefined()
    expect(isMasterDetailRowVisible(onlyUnavailable, 'a', false, null)).toBe(false)
  })

  it('derives hidden unavailable counts from pinned visibility, not total unavailable count', () => {
    expect(deriveHiddenUnavailableCount(items, 'c', false)).toBe(1)
    expect(deriveHiddenUnavailableCount(items, null, false)).toBe(2)
    expect(deriveHiddenUnavailableCount(items, 'c', true)).toBe(0)
  })

  it('leaves available selections unchanged when Hide is explicit', () => {
    expect(resolveMasterDetailSelectionAfterHide(items, 'a')).toBeUndefined()
    expect(resolveMasterDetailSelectionAfterHide(items, 'b')).toBeUndefined()
  })
})
