import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  ChoiceSet,
  EquipmentPickerFocusIntent,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

export type EquipmentStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  equipmentPickerFocus?: EquipmentPickerFocusIntent
  onEquipmentPickerFocusConsumed?: () => void
}
