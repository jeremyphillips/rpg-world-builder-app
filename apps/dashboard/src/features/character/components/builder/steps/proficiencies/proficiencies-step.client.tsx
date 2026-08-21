'use client'

import { ProficienciesStepView } from './proficiencies-step-view.client'
import type { ProficienciesStepProps } from './proficiencies-step.types'
import { useProficienciesStep } from '../../../../hooks/use-proficiencies-step.client'

export type { ProficienciesStepProps } from './proficiencies-step.types'

export function ProficienciesStep(props: ProficienciesStepProps) {
  const step = useProficienciesStep(props)
  return <ProficienciesStepView validationIssues={props.validationIssues} step={step} />
}
