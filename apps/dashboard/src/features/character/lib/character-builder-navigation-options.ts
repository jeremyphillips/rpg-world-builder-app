import type { CharacterBuilderStepId, EquipmentPickerFocusIntent } from '@rpg/contracts'

export type CharacterBuilderNavigateToStepOptions = {
  equipmentPickerFocus?: EquipmentPickerFocusIntent
}

export type CharacterBuilderNavigateToStep = (
  stepId: CharacterBuilderStepId,
  options?: CharacterBuilderNavigateToStepOptions,
) => void
