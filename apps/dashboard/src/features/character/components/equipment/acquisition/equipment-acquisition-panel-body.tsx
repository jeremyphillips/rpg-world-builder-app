import { useId, useMemo } from 'react'

import { Badge, Button, cn, DividedStack, Heading, NumberStepper, Text } from '@rpg/ui'
import {
  clampEquipmentStepQuantity,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../../lib/equipment/equipment-quantity.lib'
import {
  buildEquipmentAcquisitionPanelViewModel,
  formatAcquisitionCommitSuccessAnnouncement,
  type EquipmentAcquisitionPanelViewModel,
  type EquipmentOwnedSourceAction,
  type EquipmentOwnedSourceViewModel,
} from './equipment-acquisition-panel.lib'
import { resolveAcquisitionCommitButtonLabel } from './equipment-acquisition-commit-labels.lib'
import { EquipmentInventorySourceActionButton } from '../inventory/equipment-inventory-source-action-button'
import type { EquipmentAcquisitionPanelBodyProps } from './equipment-acquisition-panel-body.types'

function OwnedSourceQuantity({ source }: { source: EquipmentOwnedSourceViewModel }) {
  if (!source.spendSuffix) {
    return (
      <Text as="span" className="text-sm tabular-nums text-muted-foreground text-right">
        {source.quantityLabel}
      </Text>
    )
  }

  return (
    <div className="flex min-w-0 flex-col items-end text-right">
      <Text as="span" className="text-sm tabular-nums text-muted-foreground text-right">
        {source.quantityLabel}
      </Text>
      <span className="text-style-supporting">{source.spendSuffix}</span>
    </div>
  )
}

function OwnedSourceRow({
  source,
  onSourceAction,
  disabled,
}: {
  source: EquipmentOwnedSourceViewModel
  onSourceAction: (action: EquipmentOwnedSourceAction) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-3">
      <Text as="span" className="text-sm text-foreground">
        {source.label}
      </Text>
      <div className="min-w-0">
        <OwnedSourceQuantity source={source} />
      </div>
      <div className="flex justify-end">
        <EquipmentInventorySourceActionButton
          disabled={disabled}
          onClick={() => onSourceAction(source.action)}
        >
          {source.action.label}
        </EquipmentInventorySourceActionButton>
      </div>
    </div>
  )
}

function AcquisitionOwnedSection({
  owned,
  isDisclosureLayout,
  isPending,
  onSourceAction,
}: {
  owned: NonNullable<EquipmentAcquisitionPanelViewModel['owned']>
  isDisclosureLayout: boolean
  isPending?: boolean
  onSourceAction: (action: EquipmentOwnedSourceAction) => void
}) {
  return (
    <div className={isDisclosureLayout ? 'space-y-0' : 'space-y-3'}>
      <div
        className={cn('flex min-w-0 flex-wrap items-center gap-2', isDisclosureLayout && 'mb-1')}
      >
        <Heading variant="group" as="h4">
          {owned.heading}
        </Heading>
        {owned.totalQuantity > 0 ? (
          <Badge appearance="soft" tone="neutral" size="sm">
            {owned.totalQuantity}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-3">
        {owned.sources.map((source) => (
          <OwnedSourceRow
            key={source.key}
            source={source}
            onSourceAction={onSourceAction}
            disabled={isPending}
          />
        ))}
      </div>
    </div>
  )
}

function AcquisitionNextActionQuantityRow({
  nextAction,
  quantity,
  isPending,
  onQuantityChange,
}: {
  nextAction: EquipmentAcquisitionPanelViewModel['nextAction']
  quantity: number
  isPending?: boolean
  onQuantityChange: (quantity: number) => void
}) {
  if (!nextAction.showQuantity) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Text as="span" className="text-sm text-foreground">
        {nextAction.quantityLabel}
      </Text>
      <NumberStepper
        aria-label={nextAction.quantityLabel}
        bordered
        digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
        min={1}
        max={nextAction.maxQuantity}
        value={quantity}
        disabled={isPending || nextAction.quantityDisabled}
        onChange={(next) =>
          onQuantityChange(clampEquipmentStepQuantity(next, nextAction.maxQuantity))
        }
      />
    </div>
  )
}

function AcquisitionPreviewLines({
  lines,
  isDisclosureLayout,
}: {
  lines: readonly string[]
  isDisclosureLayout: boolean
}) {
  return lines.map((line) => (
    <Text key={line} as="p" className={cn('text-style-supporting', isDisclosureLayout && 'mb-3')}>
      {line}
    </Text>
  ))
}

function AcquisitionNextActionActiveContent({
  nextAction,
  quantity,
  isDisclosureLayout,
  isPending,
  commitButtonLabel,
  onQuantityChange,
  onCommit,
}: {
  nextAction: EquipmentAcquisitionPanelViewModel['nextAction']
  quantity: number
  isDisclosureLayout: boolean
  isPending?: boolean
  commitButtonLabel: string
  onQuantityChange: (quantity: number) => void
  onCommit: (requestedQuantity: number) => void
}) {
  return (
    <>
      <AcquisitionNextActionQuantityRow
        nextAction={nextAction}
        quantity={quantity}
        isPending={isPending}
        onQuantityChange={onQuantityChange}
      />
      <AcquisitionPreviewLines
        lines={nextAction.previewLines}
        isDisclosureLayout={isDisclosureLayout}
      />
      <Button
        type="button"
        size="sm"
        className="min-w-[13rem] justify-center tabular-nums"
        disabled={nextAction.disabled}
        onClick={() => onCommit(nextAction.commitQuantity)}
      >
        {commitButtonLabel}
      </Button>
    </>
  )
}

function AcquisitionNextActionSection({
  nextAction,
  quantity,
  isDisclosureLayout,
  isPending,
  commitButtonLabel,
  successAnnouncement,
  liveRegionId,
  onQuantityChange,
  onCommit,
}: {
  nextAction: EquipmentAcquisitionPanelViewModel['nextAction']
  quantity: number
  isDisclosureLayout: boolean
  isPending?: boolean
  commitButtonLabel: string
  successAnnouncement?: string
  liveRegionId: string
  onQuantityChange: (quantity: number) => void
  onCommit: (requestedQuantity: number) => void
}) {
  return (
    <div className={isDisclosureLayout ? 'space-y-0' : 'space-y-2'}>
      {nextAction.heading ? (
        <Heading variant="group" as="h4">
          {nextAction.heading}
        </Heading>
      ) : null}

      {nextAction.blocked ? (
        <Text as="p" variant="muted">
          {nextAction.blockerNote}
        </Text>
      ) : (
        <AcquisitionNextActionActiveContent
          nextAction={nextAction}
          quantity={quantity}
          isDisclosureLayout={isDisclosureLayout}
          isPending={isPending}
          commitButtonLabel={commitButtonLabel}
          onQuantityChange={onQuantityChange}
          onCommit={onCommit}
        />
      )}

      <div id={liveRegionId} aria-live="polite" aria-atomic="true" className="sr-only">
        {successAnnouncement}
      </div>
    </div>
  )
}

export function EquipmentAcquisitionPanelBody({
  draft,
  context,
  catalogIndex,
  equipment,
  rows,
  budget,
  quantity,
  onQuantityChange,
  isPending,
  successQuantity,
  onSourceAction,
  onCommit,
  layout = 'default',
}: EquipmentAcquisitionPanelBodyProps) {
  const liveRegionId = useId()
  const isDisclosureLayout = layout === 'disclosure'

  const viewModel = useMemo(
    () =>
      buildEquipmentAcquisitionPanelViewModel({
        draft,
        context,
        catalogIndex,
        equipment,
        rows,
        requestedQuantity: quantity,
        budget,
        isPending,
      }),
    [budget, catalogIndex, context, draft, equipment, isPending, quantity, rows],
  )

  const { owned, nextAction } = viewModel
  const commitButtonLabel = resolveAcquisitionCommitButtonLabel({
    isPending,
    successQuantity,
    primaryActionLabel: nextAction.primaryActionLabel,
  })
  const successAnnouncement =
    successQuantity !== undefined
      ? formatAcquisitionCommitSuccessAnnouncement(successQuantity)
      : undefined

  return (
    <DividedStack density="compact">
      {owned ? (
        <AcquisitionOwnedSection
          owned={owned}
          isDisclosureLayout={isDisclosureLayout}
          isPending={isPending}
          onSourceAction={onSourceAction}
        />
      ) : null}

      <AcquisitionNextActionSection
        nextAction={nextAction}
        quantity={quantity}
        isDisclosureLayout={isDisclosureLayout}
        isPending={isPending}
        commitButtonLabel={commitButtonLabel}
        successAnnouncement={successAnnouncement}
        liveRegionId={liveRegionId}
        onQuantityChange={onQuantityChange}
        onCommit={onCommit}
      />
    </DividedStack>
  )
}
