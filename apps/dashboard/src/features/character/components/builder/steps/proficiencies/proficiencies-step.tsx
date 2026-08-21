import { ProficienciesStepView } from './proficiencies-step-view'
import type { ProficienciesStepProps } from './proficiencies-step.types'
import { useProficienciesStep } from '../../../../hooks/use-proficiencies-step'

export type { ProficienciesStepProps } from './proficiencies-step.types'

export function ProficienciesStep(props: ProficienciesStepProps) {
  const step = useProficienciesStep(props)
  return <ProficienciesStepView validationIssues={props.validationIssues} step={step} />
}
