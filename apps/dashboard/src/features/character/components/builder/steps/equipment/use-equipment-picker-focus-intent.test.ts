/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { buildEquipmentPickerFocusIntent } from '@rpg/contracts'

import { useEquipmentPickerFocusIntent } from '../../../../hooks/use-equipment-picker-focus-intent'

describe('useEquipmentPickerFocusIntent', () => {
  it('opens the magic-items picker once per request id', () => {
    const onOpenMagicItemsPicker = vi.fn()
    const onEquipmentPickerFocusConsumed = vi.fn()
    const intent = buildEquipmentPickerFocusIntent(
      { mode: 'magic_items', allowanceId: 'allowance:common' },
      'equipment-picker-focus:test-1',
    )

    const { rerender } = renderHook((props) => useEquipmentPickerFocusIntent(props), {
      initialProps: {
        equipmentPickerFocus: intent,
        onEquipmentPickerFocusConsumed,
        onOpenMagicItemsPicker,
      },
    })

    expect(onOpenMagicItemsPicker).toHaveBeenCalledTimes(1)
    expect(onOpenMagicItemsPicker).toHaveBeenCalledWith('allowance:common')
    expect(onEquipmentPickerFocusConsumed).toHaveBeenCalledTimes(1)

    rerender({
      equipmentPickerFocus: intent,
      onEquipmentPickerFocusConsumed,
      onOpenMagicItemsPicker,
    })

    expect(onOpenMagicItemsPicker).toHaveBeenCalledTimes(1)
  })

  it('consumes a new request id after the focus intent changes', () => {
    const onOpenMagicItemsPicker = vi.fn()

    const { rerender } = renderHook((props) => useEquipmentPickerFocusIntent(props), {
      initialProps: {
        equipmentPickerFocus: buildEquipmentPickerFocusIntent(
          { mode: 'magic_items', allowanceId: 'allowance:common' },
          'equipment-picker-focus:test-1',
        ),
        onOpenMagicItemsPicker,
      },
    })

    rerender({
      equipmentPickerFocus: buildEquipmentPickerFocusIntent(
        { mode: 'magic_items', allowanceId: 'allowance:uncommon' },
        'equipment-picker-focus:test-2',
      ),
      onOpenMagicItemsPicker,
    })

    expect(onOpenMagicItemsPicker).toHaveBeenCalledTimes(2)
    expect(onOpenMagicItemsPicker).toHaveBeenLastCalledWith('allowance:uncommon')
  })
})
