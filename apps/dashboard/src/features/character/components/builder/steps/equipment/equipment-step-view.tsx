import type { ReactNode } from 'react'

import {
  isBuilderStepBlockedNoClass,
  isBuilderStepReadinessMessageOnly,
} from '../../../../lib/builder/builder-step-readiness.lib'
import {
  EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/equipment/equipment-step.lib'
import { BuilderStepFrame } from '../shared/builder-step-frame'
import { BuilderStepChooseClassPrompt } from '../shared/builder-step-choose-class-prompt'
import { BuilderStepReadinessPanel } from '../shared/builder-step-readiness-panel'
import { EquipmentStepInteractive } from './equipment-step-interactive'
import { EquipmentStepTierSummary } from './equipment-step-tier-summary'
import type { EquipmentStepProps } from './equipment-step.types'
import { type useEquipmentStep } from '../../../../hooks/use-equipment-step'

export function EquipmentStepView({
  context,
  draft,
  resolvedChoiceSets: _resolvedChoiceSets,
  validationIssues,
  onDraftChange,
  onNavigateToStep,
  step,
}: EquipmentStepProps & { step: ReturnType<typeof useEquipmentStep> }) {
  const { classId, characterClass, readiness } = step

  let body: ReactNode
  if (isBuilderStepBlockedNoClass(readiness, draft)) {
    body = (
      <BuilderStepChooseClassPrompt
        heading={EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING}
        description={EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION}
        onNavigateToStep={onNavigateToStep}
      />
    )
  } else if (
    isBuilderStepReadinessMessageOnly(readiness, {
      equipmentSkipped: draft.equipment?.skipped === true,
    })
  ) {
    body = <BuilderStepReadinessPanel state={readiness} />
  } else if (!classId || !characterClass) {
    return null
  } else {
    body = (
      <EquipmentStepInteractive
        draft={draft}
        onDraftChange={onDraftChange}
        step={step}
        readiness={readiness}
      />
    )
  }

  return (
    <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
      <EquipmentStepTierSummary
        startingWealth={context.characterCreationRules.startingWealth}
        startingLevel={draft.class.level}
      />
      {body}
    </BuilderStepFrame>
  )
}
