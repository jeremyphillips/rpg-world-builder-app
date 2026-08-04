'use client'

import { useEffect, useState } from 'react'

import {
  shouldConsumeEquipmentPickerFocusIntent,
  type EquipmentPickerFocusIntent,
} from '@rpg/contracts'

export function useEquipmentPickerFocusIntent(args: {
  equipmentPickerFocus?: EquipmentPickerFocusIntent
  onEquipmentPickerFocusConsumed?: () => void
  onOpenMagicItemsPicker: (allowanceId?: string) => void
}) {
  const { equipmentPickerFocus, onEquipmentPickerFocusConsumed, onOpenMagicItemsPicker } = args
  const [consumedEquipmentPickerFocusIds, setConsumedEquipmentPickerFocusIds] = useState(
    () => new Set<string>(),
  )

  useEffect(() => {
    if (!equipmentPickerFocus) return
    if (
      !shouldConsumeEquipmentPickerFocusIntent({
        intent: equipmentPickerFocus,
        consumedRequestIds: consumedEquipmentPickerFocusIds,
      })
    ) {
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- consumes one-shot focus intent and opens the picker in the same commit.
    setConsumedEquipmentPickerFocusIds((previous) => {
      const next = new Set(previous)
      next.add(equipmentPickerFocus.requestId)
      return next
    })
    onOpenMagicItemsPicker(equipmentPickerFocus.allowanceId)
    onEquipmentPickerFocusConsumed?.()
  }, [
    consumedEquipmentPickerFocusIds,
    equipmentPickerFocus,
    onEquipmentPickerFocusConsumed,
    onOpenMagicItemsPicker,
  ])
}
