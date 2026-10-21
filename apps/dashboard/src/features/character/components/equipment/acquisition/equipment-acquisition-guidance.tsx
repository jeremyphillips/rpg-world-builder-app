import type { MagicItemAllowance, MagicItemGrantProgress } from '@rpg/contracts'
import { Card, CardContent, CardHeader, CardTitle, Text } from '@rpg/ui'

import {
  EQUIPMENT_MAGIC_ITEMS_BROWSE_LABEL,
  EQUIPMENT_MAGIC_ITEMS_MANAGE_LABEL,
  EQUIPMENT_STEP_BROWSE_LABEL,
  type EquipmentStepFundingState,
} from '../../../lib/equipment/equipment-step.lib'
import {
  EQUIPMENT_UNRESOLVED_FUNDING_DESCRIPTION,
  EQUIPMENT_UNRESOLVED_FUNDING_HEADING,
  formatEquipmentUnresolvedFundingSelectedLabel,
  resolveEquipmentAcquisitionGuidanceView,
  type EquipmentAcquisitionGuidanceAction,
} from './equipment-acquisition-guidance.lib'
import {
  EquipmentResourceSummary,
  type EquipmentResourceSummaryAction,
} from './equipment-resource-summary'

export type EquipmentAcquisitionGuidanceProps = {
  showPurchaseWorkflow: boolean
  fundingState: EquipmentStepFundingState
  onOpenPurchasePicker: () => void
  showMagicItemGrants: boolean
  magicItemAllowances: readonly MagicItemAllowance[]
  magicItemProgress: readonly MagicItemGrantProgress[]
  onOpenMagicItemsPicker: () => void
}

function EquipmentUnresolvedFundingCard({ pendingCostCp }: { pendingCostCp: number }) {
  return (
    <Card tone="subtle" density="comfortable">
      <CardHeader>
        <CardTitle>{EQUIPMENT_UNRESOLVED_FUNDING_HEADING}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-3">
        <Text as="p" variant="muted">
          {EQUIPMENT_UNRESOLVED_FUNDING_DESCRIPTION}
        </Text>
        <Text as="p" variant="muted">
          {formatEquipmentUnresolvedFundingSelectedLabel(pendingCostCp)}
        </Text>
      </CardContent>
    </Card>
  )
}

const GUIDANCE_ACTION_LABELS: Record<EquipmentAcquisitionGuidanceAction, string> = {
  browse: EQUIPMENT_STEP_BROWSE_LABEL,
  'browse-magic': EQUIPMENT_MAGIC_ITEMS_BROWSE_LABEL,
  'manage-magic': EQUIPMENT_MAGIC_ITEMS_MANAGE_LABEL,
}

const GUIDANCE_ACTION_VARIANTS = {
  browse: 'secondary',
  'browse-magic': 'secondary',
  'manage-magic': 'outline',
} as const satisfies Record<
  EquipmentAcquisitionGuidanceAction,
  EquipmentResourceSummaryAction['variant']
>

function guidanceActionHandler(
  action: EquipmentAcquisitionGuidanceAction,
  handlers: Pick<
    EquipmentAcquisitionGuidanceProps,
    'onOpenPurchasePicker' | 'onOpenMagicItemsPicker'
  >,
): () => void {
  if (action === 'browse') return handlers.onOpenPurchasePicker
  return handlers.onOpenMagicItemsPicker
}

function toResourceSummaryAction(
  action: EquipmentAcquisitionGuidanceAction | undefined,
  handlers: Pick<
    EquipmentAcquisitionGuidanceProps,
    'onOpenPurchasePicker' | 'onOpenMagicItemsPicker'
  >,
): EquipmentResourceSummaryAction | undefined {
  if (!action) return undefined
  return {
    label: GUIDANCE_ACTION_LABELS[action],
    variant: GUIDANCE_ACTION_VARIANTS[action],
    onClick: guidanceActionHandler(action, handlers),
  }
}

export function EquipmentAcquisitionGuidance({
  showPurchaseWorkflow,
  fundingState,
  onOpenPurchasePicker,
  showMagicItemGrants,
  magicItemAllowances,
  magicItemProgress,
  onOpenMagicItemsPicker,
}: EquipmentAcquisitionGuidanceProps) {
  const view = resolveEquipmentAcquisitionGuidanceView({
    showPurchaseWorkflow,
    fundingState,
    showMagicItemGrants,
    magicItemAllowances,
    magicItemProgress,
  })
  if (!view) return null

  const handlers = { onOpenPurchasePicker, onOpenMagicItemsPicker }

  return (
    <section aria-label="Acquisition guidance" className="grid grid-cols-1 gap-4">
      {view.unresolvedPendingCostCp !== undefined ? (
        <EquipmentUnresolvedFundingCard pendingCostCp={view.unresolvedPendingCostCp} />
      ) : null}
      {view.currency || view.slots ? (
        <EquipmentResourceSummary
          density="comfortable"
          currency={view.currency}
          slots={view.slots}
          currencyAction={toResourceSummaryAction(view.currencyAction, handlers)}
          magicItemsAction={toResourceSummaryAction(view.magicItemsAction, handlers)}
        />
      ) : null}
    </section>
  )
}
