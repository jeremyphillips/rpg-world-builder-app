'use client'

import { useEffect, useState } from 'react'

import {
  shouldConsumeEquipmentPickerFocusIntent,
  type EquipmentPickerFocusIntent,
} from '@rpg/contracts'

export function useEquipmentPickerFocusIntent(args: {
  equipmentPickerFocus?: EquipmentPickerFocusIntent
  onEquipmentPickerFocusConsumed?: () => void
  onOpenMagicItemsPicker: () => void
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

    setConsumedEquipmentPickerFocusIds((previous) => {
      const next = new Set(previous)
      next.add(equipmentPickerFocus.requestId)
      return next
    })
    onOpenMagicItemsPicker()
    onEquipmentPickerFocusConsumed?.()
  }, [
    consumedEquipmentPickerFocusIds,
    equipmentPickerFocus,
    onEquipmentPickerFocusConsumed,
    onOpenMagicItemsPicker,
  ])
}
