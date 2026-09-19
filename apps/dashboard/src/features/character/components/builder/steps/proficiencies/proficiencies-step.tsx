import { ProficienciesStepView } from './proficiencies-step-view'
import type { ProficienciesStepProps } from './proficiencies-step.types'
import { useProficienciesStep } from '../../../../hooks/use-proficiencies-step'

export type { ProficienciesStepProps } from './proficiencies-step.types'

export function ProficienciesStep(props: ProficienciesStepProps) {
  const step = useProficienciesStep(props)
  return (
    <ProficienciesStepView
      draft={props.draft}
      validationIssues={props.validationIssues}
      onNavigateToStep={props.onNavigateToStep}
      step={step}
    />
  )
}
