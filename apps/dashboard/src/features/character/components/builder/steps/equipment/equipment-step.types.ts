import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  ChoiceSet,
  EquipmentPickerFocusIntent,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'

export type EquipmentStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onNavigateToStep: CharacterBuilderNavigateToStep
  equipmentPickerFocus?: EquipmentPickerFocusIntent
  onEquipmentPickerFocusConsumed?: () => void
}
