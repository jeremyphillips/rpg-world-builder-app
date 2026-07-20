'use client'

import type { ComponentProps } from 'react'

import type { EquipmentBudgetSummary } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_CLASS_OPTIONS_REPLACED_MESSAGE,
  EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL,
  EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL,
  EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE,
  formatEquipmentReplacedStartingWealthTitle,
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

export function EquipmentStepReplacedClassOptionsNotice({ tierLabel }: { tierLabel?: string }) {
  return (
    <section className="space-y-2" aria-label="Starting wealth replacement">
      <Heading variant="subsection" as="h3">
        {formatEquipmentReplacedStartingWealthTitle(tierLabel)}
      </Heading>
      <Text variant="muted">{EQUIPMENT_CLASS_OPTIONS_REPLACED_MESSAGE}</Text>
    </section>
  )
}

export function EquipmentStepShoppingSection({ budget }: { budget: EquipmentBudgetSummary }) {
  return (
    <section className="space-y-4">
      <Heading variant="subsection" as="h3">
        Budget
      </Heading>
      <EquipmentBudgetHeader budget={budget} />
    </section>
  )
}

export function EquipmentStepMagicItemsSection({
  progressLabel,
  onOpenPicker,
}: {
  progressLabel: string
  onOpenPicker: () => void
}) {
  return (
    <section className="space-y-3" aria-label="Magic item grants">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading variant="subsection" as="h3">
          Magic items
        </Heading>
        <Button type="button" size="sm" onClick={onOpenPicker}>
          Choose magic items
        </Button>
      </div>
      <Text variant="muted">
        {EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL}: {progressLabel}
      </Text>
    </section>
  )
}

export type EquipmentStepInventorySectionProps = ComponentProps<typeof EquipmentInventorySummary>

export function EquipmentStepInventorySection(props: EquipmentStepInventorySectionProps) {
  return (
    <section className="space-y-3">
      <Heading variant="sheetSection" as="h3">
        Inventory
      </Heading>
      <EquipmentInventorySummary {...props} />
    </section>
  )
}
