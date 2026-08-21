import { isBuilderStepReadinessMessageOnly } from '../../../../lib/builder/builder-step-readiness.lib'
import { BuilderStepFrame } from '../shared/builder-step-frame'
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
  step,
}: EquipmentStepProps & { step: ReturnType<typeof useEquipmentStep> }) {
  const { classId, characterClass, readiness } = step

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
