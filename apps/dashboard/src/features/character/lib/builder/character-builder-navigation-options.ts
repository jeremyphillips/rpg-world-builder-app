import type { EquipmentPickerFocusIntent } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'

export type CharacterBuilderNavigateToStepOptions = {
  equipmentPickerFocus?: EquipmentPickerFocusIntent
}

export type CharacterBuilderNavigateToStep = (
  stepId: CharacterBuilderStepId,
  options?: CharacterBuilderNavigateToStepOptions,
) => void
