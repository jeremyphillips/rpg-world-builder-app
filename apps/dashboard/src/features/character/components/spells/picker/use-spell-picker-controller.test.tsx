/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  spellPickerCantripChoiceSetFixture,
  spellPickerOpenItemsFixture,
} from './spell-picker-drawer.fixtures'
import { SPELL_PICKER_SORT_NAME_DESC } from './spell-picker-drawer.types'
import { useSpellPickerController } from './use-spell-picker-controller'

describe('useSpellPickerController', () => {
  it('preserves per-mode browse state across close/reopen', () => {
    const { result, rerender } = renderHook(
      (props: { open: boolean }) =>
        useSpellPickerController({
          open: props.open,
          cantripChoiceSet: spellPickerCantripChoiceSetFixture,
          cantripSelectedIds: [],
          preparedSelectedIds: [],
          cantripItems: spellPickerOpenItemsFixture,
          preparedItems: [],
        }),
      { initialProps: { open: true } },
    )

    act(() => {
      result.current.persistBrowseState({
        ...result.current.browseState,
        sortMode: SPELL_PICKER_SORT_NAME_DESC,
        searchQuery: 'fireball',
      })
    })

    expect(result.current.browseState.sortMode).toBe(SPELL_PICKER_SORT_NAME_DESC)
    expect(result.current.browseState.searchQuery).toBe('fireball')

    rerender({ open: false })
    rerender({ open: true })

    expect(result.current.browseState.sortMode).toBe(SPELL_PICKER_SORT_NAME_DESC)
    expect(result.current.browseState.searchQuery).toBe('fireball')
  })

  it('reruns open sync when recommendationsEnabled changes while open', () => {
    const { result, rerender } = renderHook(
      (props: { recommendationsEnabled: boolean }) =>
        useSpellPickerController({
          open: true,
          recommendationsEnabled: props.recommendationsEnabled,
          cantripChoiceSet: spellPickerCantripChoiceSetFixture,
          cantripSelectedIds: [],
          preparedSelectedIds: [],
          cantripItems: spellPickerOpenItemsFixture,
          preparedItems: [],
        }),
      { initialProps: { recommendationsEnabled: false } },
    )

    const initialSyncKey = result.current.openSyncKey

    rerender({ recommendationsEnabled: true })

    expect(result.current.openSyncKey).toBeGreaterThan(initialSyncKey)
  })
})
