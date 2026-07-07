'use client'

import { Text } from '@rpg/ui'

import { PROFICIENCIES_STEP_EMPTY_MESSAGE } from '../../lib/proficiencies-step.lib'
import { ProficiencySection } from '../proficiencies/proficiency-section.client'
import { BuilderStepFrame } from './builder-step-frame.client'
import type { ProficienciesStepProps } from './proficiencies-step.types'
import type { useProficienciesStep } from './use-proficiencies-step.client'

export function ProficienciesStepView({
  validationIssues,
  step,
}: Pick<ProficienciesStepProps, 'validationIssues'> & {
  step: ReturnType<typeof useProficienciesStep>
}) {
  const { model, openChoiceSet, removeChoiceSelection } = step

  if (model.sections.length === 0) {
    return (
      <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
        <Text variant="muted">{PROFICIENCIES_STEP_EMPTY_MESSAGE}</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
      <div className="space-y-8">
        {model.sections.map((section) => (
          <ProficiencySection
            key={section.kind}
            section={section}
            onOpenChoiceSet={openChoiceSet}
            onRemoveChoice={removeChoiceSelection}
          />
        ))}
      </div>
    </BuilderStepFrame>
  )
}
