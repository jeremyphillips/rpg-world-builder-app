import { describe, expect, it } from 'vitest'

import {
  resolveCatalogPickerRowActionPhase,
  resolvePickerActionFailureStatus,
} from './catalog-picker-row-action.lib'

describe('resolveCatalogPickerRowActionPhase', () => {
  it('follows pending → remove → add precedence', () => {
    expect(resolveCatalogPickerRowActionPhase({ isPending: true, isSelected: true })).toBe(
      'pending',
    )
    expect(resolveCatalogPickerRowActionPhase({ isSelected: true })).toBe('remove')
    expect(resolveCatalogPickerRowActionPhase({})).toBe('add')
  })
})

describe('resolvePickerActionFailureStatus', () => {
  it('uses the stable imperative and falls back for anything else', () => {
    expect(resolvePickerActionFailureStatus('Add')).toBe('Add failed')
    expect(resolvePickerActionFailureStatus('Learn')).toBe('Learn failed')
    expect(resolvePickerActionFailureStatus('Prepare')).toBe('Prepare failed')
    expect(resolvePickerActionFailureStatus('Remove')).toBe('Remove failed')
    expect(resolvePickerActionFailureStatus('Unlearn')).toBe('Unlearn failed')
    expect(resolvePickerActionFailureStatus('Release one')).toBe('Action failed')
    expect(resolvePickerActionFailureStatus('')).toBe('Action failed')
    expect(resolvePickerActionFailureStatus('Adding…')).toBe('Action failed')
  })
})
