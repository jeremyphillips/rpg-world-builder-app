'use client'

import { EquipmentStepView } from './equipment-step-view.client'
import type { EquipmentStepProps } from './equipment-step.types'
import { useEquipmentStep } from './use-equipment-step.client'

export type { EquipmentStepProps } from './equipment-step.types'

export function EquipmentStep(props: EquipmentStepProps) {
  const step = useEquipmentStep(props)
  return <EquipmentStepView {...props} step={step} />
}
