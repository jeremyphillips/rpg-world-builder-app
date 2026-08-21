import { EquipmentStepView } from './equipment-step-view'
import type { EquipmentStepProps } from './equipment-step.types'
import { useEquipmentPickerFocusIntent } from '../../../../hooks/use-equipment-picker-focus-intent'
import { useEquipmentStep } from '../../../../hooks/use-equipment-step'

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
