/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerRopeFixture,
} from './equipment-picker-drawer.fixtures'
import { EQUIPMENT_PICKER_VIEW_DEFAULTS } from './equipment-picker-drawer.lib'
import { useEquipmentPickerController } from './use-equipment-picker-controller'

describe('useEquipmentPickerController', () => {
  it('preserves browse state across close/reopen but clears add quantities on close', () => {
    const onCommitAdd = vi.fn()

    const { result, rerender } = renderHook(
      (props: { open: boolean }) =>
        useEquipmentPickerController({
          open: props.open,
          items: equipmentPickerItemsFixture,
          budget: undefined,
          onCommitAdd,
        }),
      { initialProps: { open: true } },
    )

    act(() => {
      result.current.setSortMode('name_desc')
      result.current.handleAddQuantityChange(equipmentPickerRopeFixture.id, 3)
    })

    expect(result.current.sortMode).toBe('name_desc')
    expect(result.current.addQuantities[equipmentPickerRopeFixture.id]).toBe(3)

    rerender({ open: false })
    rerender({ open: true })

    expect(result.current.sortMode).toBe('name_desc')
    expect(result.current.addQuantities).toEqual({})
  })

  it('resets browse view fields without touching sheet search', () => {
    const onCommitAdd = vi.fn()

    const { result } = renderHook(() =>
      useEquipmentPickerController({
        open: true,
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

  it('delegates add commits to onCommitAdd and resets stackable quantity after body commit', () => {
    const onCommitAdd = vi.fn()
    const ropeRow = equipmentPickerItemsFixture[2]!

    const { result } = renderHook(() =>
      useEquipmentPickerController({
        open: true,
        items: [ropeRow],
        budget: undefined,
        onCommitAdd,
      }),
    )

    act(() => {
      result.current.handleAddQuantityChange(ropeRow.equipment.id, 3)
    })

    act(() => {
      result.current.handleCommitAdd(ropeRow)
    })

    expect(onCommitAdd).toHaveBeenCalledWith(ropeRow, 3)
    expect(result.current.addQuantities[ropeRow.equipment.id]).toBe(1)
  })

  it('derives owned quantity from purchase and grant maps by workflow mode', () => {
    const onCommitAdd = vi.fn()
    const cheapGear = equipmentPickerDefaultPathItemsFixture[0]!

    const { result } = renderHook(() =>
      useEquipmentPickerController({
        open: true,
        items: [cheapGear],
        workflowMode: 'purchase',
        ownedPurchaseQuantities: { [cheapGear.equipment.id]: 2 },
        ownedGrantQuantities: { [cheapGear.equipment.id]: 5 },
        onCommitAdd,
      }),
    )

    expect(result.current.resolveOwnedQuantity(cheapGear, 'purchase')).toBe(2)
    expect(result.current.resolveOwnedQuantity(cheapGear, 'magic_items')).toBe(5)
  })
})
