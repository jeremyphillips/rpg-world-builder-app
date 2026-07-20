'use client'

import { EquipmentStepView } from './equipment-step-view.client'
import type { EquipmentStepProps } from './equipment-step.types'
import { useEquipmentPickerFocusIntent } from './use-equipment-picker-focus-intent.client'
import { useEquipmentStep } from './use-equipment-step.client'

export type { EquipmentStepProps } from './equipment-step.types'

export function EquipmentStep({
  equipmentPickerFocus,
  onEquipmentPickerFocusConsumed,
  ...props
}: EquipmentStepProps) {
  const step = useEquipmentStep(props)

  useEquipmentPickerFocusIntent({
    equipmentPickerFocus,
    onEquipmentPickerFocusConsumed,
    onOpenMagicItemsPicker: (allowanceId) =>
      step.openPicker('magic_items', allowanceId ? { allowanceId } : undefined),
  })

  return <EquipmentStepView {...props} step={step} />
}
