import { describe, expect, it } from 'vitest'

import {
  buildEquipmentPickerFocusIntent,
  createEquipmentPickerFocusRequestId,
  shouldConsumeEquipmentPickerFocusIntent,
} from './equipment-picker-focus'

describe('equipment picker focus intent', () => {
  it('consumes a focus intent at most once per requestId', () => {
    const requestId = createEquipmentPickerFocusRequestId()
    const intent = buildEquipmentPickerFocusIntent(
      { mode: 'magic_items', allowanceId: 'allowance:common' },
      requestId,
    )

    expect(
      shouldConsumeEquipmentPickerFocusIntent({
        intent,
        consumedRequestIds: new Set(),
      }),
    ).toBe(true)

    expect(
      shouldConsumeEquipmentPickerFocusIntent({
        intent,
        consumedRequestIds: new Set([requestId]),
      }),
    ).toBe(false)
  })
})
