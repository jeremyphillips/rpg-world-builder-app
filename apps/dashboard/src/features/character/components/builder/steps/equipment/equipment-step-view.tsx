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
import type { EquipmentStepProps } from './equipment-step.types'
import { type useEquipmentStep } from '../../../../hooks/use-equipment-step'

export function EquipmentStepView({
  context: _context,
  draft,
  resolvedChoiceSets: _resolvedChoiceSets,
  validationIssues,
  onDraftChange,
  onNavigateToStep,
  step,
}: EquipmentStepProps & { step: ReturnType<typeof useEquipmentStep> }) {
  const { classId, characterClass, readiness } = step

  if (isBuilderStepBlockedNoClass(readiness, draft)) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <BuilderStepChooseClassPrompt
          heading={EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING}
          description={EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION}
          onNavigateToStep={onNavigateToStep}
        />
      </BuilderStepFrame>
    )
  }

  if (
    isBuilderStepReadinessMessageOnly(readiness, {
      equipmentSkipped: draft.equipment?.skipped === true,
    })
  ) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <BuilderStepReadinessPanel state={readiness} />
      </BuilderStepFrame>
    )
  }

  if (!classId || !characterClass) return null

  return (
    <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
      <EquipmentStepInteractive
        draft={draft}
        onDraftChange={onDraftChange}
        step={step}
        readiness={readiness}
      />
    </BuilderStepFrame>
  )
}
