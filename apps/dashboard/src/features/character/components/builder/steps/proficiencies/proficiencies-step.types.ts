import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuildPreview,
  ChoiceSet,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'

export type ProficienciesStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onNavigateToStep: CharacterBuilderNavigateToStep
}
