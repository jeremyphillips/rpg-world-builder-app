import type { ProficiencyInteractiveSection } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import {
  validationIssuesForProficiencyChoiceSet,
  validationIssuesForProficiencySection,
  PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ChoiceSection } from '../shared/choice-section/choice-section'

export type ProficiencySectionProps = {
  section: ProficiencyInteractiveSection
  validationIssues?: readonly CharacterBuildValidationIssue[]
  onOpenChoiceSet: (choiceSetId: string) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

export function ProficiencySection({
  section,
  validationIssues = [],
  onOpenChoiceSet,
  onRemoveChoice,
}: ProficiencySectionProps) {
  return (
    <ChoiceSection
      section={section}
      sectionIdPrefix="proficiency-section"
      overSelectionMessage={PROFICIENCIES_STEP_OVER_SELECTION_MESSAGE}
      validationIssues={validationIssues}
      validationIssuesForChoiceSet={validationIssuesForProficiencyChoiceSet}
      validationIssuesForSection={validationIssuesForProficiencySection}
      onOpenChoiceSet={onOpenChoiceSet}
      onRemoveChoice={onRemoveChoice}
    />
  )
}
