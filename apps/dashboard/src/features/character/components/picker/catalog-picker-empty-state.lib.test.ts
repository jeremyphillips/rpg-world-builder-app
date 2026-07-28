import { describe, expect, it } from 'vitest'

import {
  resolveCatalogPickerEmptyStateKind,
  resolveCatalogPickerEmptyStateMessage,
} from './catalog-picker-empty-state.lib'

describe('resolveCatalogPickerEmptyStateKind', () => {
  it('returns undefined when items exist', () => {
    expect(
      resolveCatalogPickerEmptyStateKind({ itemsLength: 3, choiceSetMax: 2, selectedCount: 0 }),
    ).toBeUndefined()
  })

  it('returns selection-full when the choice set cap is reached with no items', () => {
    expect(
      resolveCatalogPickerEmptyStateKind({ itemsLength: 0, choiceSetMax: 2, selectedCount: 2 }),
    ).toBe('selection-full')
  })

  it('returns no-options when there are no items and selection is not full', () => {
    expect(
      resolveCatalogPickerEmptyStateKind({ itemsLength: 0, choiceSetMax: 2, selectedCount: 0 }),
    ).toBe('no-options')
  })
})

describe('resolveCatalogPickerEmptyStateMessage', () => {
  const messages = { noOptions: 'No options', selectionFull: 'Selection full' }

  it('maps kinds to domain copy', () => {
    expect(resolveCatalogPickerEmptyStateMessage('no-options', messages)).toBe('No options')
    expect(resolveCatalogPickerEmptyStateMessage('selection-full', messages)).toBe('Selection full')
    expect(resolveCatalogPickerEmptyStateMessage(undefined, messages)).toBeUndefined()
  })
})
