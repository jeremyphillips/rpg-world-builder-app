'use client'

import { isBuilderStepReadinessMessageOnly } from '../../lib/builder-step-readiness.lib'
import { BuilderStepFrame } from './builder-step-frame.client'
import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'
import { EquipmentStepInteractive } from './equipment-step-interactive.client'
import type { EquipmentStepProps } from './equipment-step.types'
import { useEquipmentStep } from './use-equipment-step.client'

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
