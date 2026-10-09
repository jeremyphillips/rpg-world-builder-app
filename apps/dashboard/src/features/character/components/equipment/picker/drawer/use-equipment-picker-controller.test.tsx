/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { equipmentPickerItemsFixture } from './equipment-picker-drawer.fixtures'
import { EQUIPMENT_PICKER_VIEW_DEFAULTS } from './equipment-picker-drawer.lib'
import { useEquipmentPickerController } from './use-equipment-picker-controller'

describe('useEquipmentPickerController', () => {
  it('resets browse view fields without touching sheet search', () => {
    const onCommitAdd = vi.fn()

    const { result } = renderHook(() =>
      useEquipmentPickerController({
        items: equipmentPickerItemsFixture,
        budget: undefined,
        onCommitAdd,
      }),
    )

    act(() => {
      result.current.setSortMode('name_desc')
      result.current.resetBrowseView()
    })

    expect(result.current.sortMode).toBe(EQUIPMENT_PICKER_VIEW_DEFAULTS.sortMode)
    expect(result.current.selectedKind).toBe(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
    expect(result.current.showAffordableOnly).toBe(
      EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly,
    )
  })

  it('commits one copy per header add and reports whether the draft took it', () => {
    const ropeRow = equipmentPickerItemsFixture[2]!
    const onCommitAdd = vi.fn().mockReturnValue(false)

    const { result } = renderHook(() =>
      useEquipmentPickerController({
        items: [ropeRow],
        budget: undefined,
        onCommitAdd,
      }),
    )

    let applied = true
    act(() => {
      applied = result.current.handleHeaderCommit(ropeRow)
    })

    expect(onCommitAdd).toHaveBeenCalledWith(ropeRow)
    expect(applied).toBe(false)
  })
})
