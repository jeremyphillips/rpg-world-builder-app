'use client'

import type { ComponentProps } from 'react'

import type { EquipmentBudgetSummary } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_STEP_BROWSE_LABEL,
  EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL,
  EQUIPMENT_STEP_CUSTOMIZED_MESSAGE,
  EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE,
} from '../../lib/equipment-step.lib'
import { EquipmentBudgetHeader } from '../equipment/equipment-budget-header.client'
import { EquipmentInventorySummary } from '../equipment/equipment-inventory-summary.client'

export function EquipmentStepFallback({ onContinueWithout }: { onContinueWithout: () => void }) {
  return (
    <div className="space-y-4">
      <Text>{EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE}</Text>
      <Button type="button" variant="secondary" onClick={onContinueWithout}>
        {EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL}
      </Button>
    </div>
  )
}

export function EquipmentStepShoppingSection({
  budget,
  customized,
  onOpenPicker,
}: {
  budget: EquipmentBudgetSummary
  customized?: boolean
  onOpenPicker: () => void
}) {
  return (
    <section className="space-y-4">
      <Heading variant="subsection" as="h3">
        Budget
      </Heading>
      <EquipmentBudgetHeader budget={budget} />
      <div>
        <Button type="button" variant="default" onClick={onOpenPicker}>
          {EQUIPMENT_STEP_BROWSE_LABEL}
        </Button>
      </div>
      {customized ? <Text variant="muted">{EQUIPMENT_STEP_CUSTOMIZED_MESSAGE}</Text> : null}
    </section>
  )
}

export type EquipmentStepInventorySectionProps = ComponentProps<typeof EquipmentInventorySummary>

export function EquipmentStepInventorySection(props: EquipmentStepInventorySectionProps) {
  return (
    <section className="space-y-3">
      <Heading variant="subsection" as="h3">
        Inventory
      </Heading>
      <EquipmentInventorySummary {...props} />
    </section>
  )
}
