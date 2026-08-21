'use client'

import { useId, useMemo } from 'react'

import { Badge, Button, Heading, NumberStepper, Text } from '@rpg/ui'
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
import {
  equipmentAcquisitionPanelBlockerClasses,
  equipmentAcquisitionPanelBodyClasses,
  equipmentAcquisitionPanelCommitButtonClasses,
  equipmentAcquisitionPanelDividerClasses,
  equipmentAcquisitionPanelNextActionClasses,
  equipmentAcquisitionPanelNextActionDisclosureClasses,
  equipmentAcquisitionPanelOwnedHeadingRowClasses,
  equipmentAcquisitionPanelOwnedHeadingRowDisclosureClasses,
  equipmentAcquisitionPanelOwnedSectionClasses,
  equipmentAcquisitionPanelOwnedSectionDisclosureClasses,
  equipmentAcquisitionPanelOwnedSourceListDisclosureClasses,
  equipmentAcquisitionPanelPreviewLineClasses,
  equipmentAcquisitionPanelPreviewLineDisclosureClasses,
  equipmentAcquisitionPanelQuantityLabelClasses,
  equipmentAcquisitionPanelQuantityRowClasses,
  equipmentAcquisitionPanelQuantityRowDisclosureClasses,
  equipmentAcquisitionPanelSectionHeadingClasses,
  equipmentAcquisitionPanelSourceActionsClasses,
  equipmentAcquisitionPanelSourceLabelClasses,
  equipmentAcquisitionPanelSourceListClasses,
  equipmentAcquisitionPanelSourceMetaClasses,
  equipmentAcquisitionPanelSourceQuantityClasses,
  equipmentAcquisitionPanelSourceQuantityInlineClasses,
  equipmentAcquisitionPanelSourceQuantityWrapClasses,
  equipmentAcquisitionPanelSourceRowClasses,
  equipmentAcquisitionPanelSourceSpendSuffixClasses,
} from './equipment-acquisition-panel.variants'
import { EquipmentInventorySourceActionButton } from '../inventory/equipment-inventory-source-action-button.client'
import type { EquipmentAcquisitionPanelBodyProps } from './equipment-acquisition-panel-body.types'

type LayoutVariant = {
  default: string
  disclosure: string
}

function resolveAcquisitionPanelLayoutClass(
  isDisclosureLayout: boolean,
  classes: LayoutVariant,
): string {
  return isDisclosureLayout ? classes.disclosure : classes.default
}

function OwnedSourceQuantity({ source }: { source: EquipmentOwnedSourceViewModel }) {
  if (!source.spendSuffix) {
    return (
      <Text as="span" className={equipmentAcquisitionPanelSourceQuantityClasses}>
        {source.quantityLabel}
      </Text>
    )
  }

  return (
    <div className={equipmentAcquisitionPanelSourceQuantityWrapClasses}>
      <span className={equipmentAcquisitionPanelSourceQuantityInlineClasses}>
        <span>{source.quantityLabel}</span>
        <span className="hidden min-[22rem]:inline"> · {source.spendSuffix}</span>
      </span>
      <span className={`${equipmentAcquisitionPanelSourceSpendSuffixClasses} min-[22rem]:hidden`}>
        {source.spendSuffix}
      </span>
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
    <div className={equipmentAcquisitionPanelSourceRowClasses}>
      <Text as="span" className={equipmentAcquisitionPanelSourceLabelClasses}>
        {source.label}
      </Text>
      <div className={equipmentAcquisitionPanelSourceMetaClasses}>
        <OwnedSourceQuantity source={source} />
      </div>
      <div className={equipmentAcquisitionPanelSourceActionsClasses}>
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
    <>
      <div
        className={resolveAcquisitionPanelLayoutClass(isDisclosureLayout, {
          default: equipmentAcquisitionPanelOwnedSectionClasses,
          disclosure: equipmentAcquisitionPanelOwnedSectionDisclosureClasses,
        })}
      >
        <div
          className={resolveAcquisitionPanelLayoutClass(isDisclosureLayout, {
            default: equipmentAcquisitionPanelOwnedHeadingRowClasses,
            disclosure: equipmentAcquisitionPanelOwnedHeadingRowDisclosureClasses,
          })}
        >
          <Heading
            variant="group"
            as="h4"
            className={equipmentAcquisitionPanelSectionHeadingClasses}
          >
            {owned.heading}
          </Heading>
          {owned.totalQuantity > 0 ? (
            <Badge appearance="soft" tone="neutral" size="sm">
              {owned.totalQuantity}
            </Badge>
          ) : null}
        </div>
        <div
          className={resolveAcquisitionPanelLayoutClass(isDisclosureLayout, {
            default: equipmentAcquisitionPanelSourceListClasses,
            disclosure: equipmentAcquisitionPanelOwnedSourceListDisclosureClasses,
          })}
        >
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
      <div className={equipmentAcquisitionPanelDividerClasses} />
    </>
  )
}

function AcquisitionNextActionQuantityRow({
  nextAction,
  quantity,
  isDisclosureLayout,
  isPending,
  onQuantityChange,
}: {
  nextAction: EquipmentAcquisitionPanelViewModel['nextAction']
  quantity: number
  isDisclosureLayout: boolean
  isPending?: boolean
  onQuantityChange: (quantity: number) => void
}) {
  if (!nextAction.showQuantity) {
    return null
  }

  return (
    <div
      className={resolveAcquisitionPanelLayoutClass(isDisclosureLayout, {
        default: equipmentAcquisitionPanelQuantityRowClasses,
        disclosure: equipmentAcquisitionPanelQuantityRowDisclosureClasses,
      })}
    >
      <Text as="span" className={equipmentAcquisitionPanelQuantityLabelClasses}>
        {nextAction.quantityLabel}
      </Text>
      <NumberStepper
        aria-label={nextAction.quantityLabel}
        size="sm"
        bordered
        digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
        min={1}
        max={nextAction.maxQuantity}
        value={quantity}
        disabled={isPending}
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
    <Text
      key={line}
      as="p"
      className={resolveAcquisitionPanelLayoutClass(isDisclosureLayout, {
        default: equipmentAcquisitionPanelPreviewLineClasses,
        disclosure: equipmentAcquisitionPanelPreviewLineDisclosureClasses,
      })}
    >
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
        isDisclosureLayout={isDisclosureLayout}
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
        className={equipmentAcquisitionPanelCommitButtonClasses}
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
    <div
      className={resolveAcquisitionPanelLayoutClass(isDisclosureLayout, {
        default: equipmentAcquisitionPanelNextActionClasses,
        disclosure: equipmentAcquisitionPanelNextActionDisclosureClasses,
      })}
    >
      {nextAction.heading ? (
        <Heading variant="group" as="h4" className={equipmentAcquisitionPanelSectionHeadingClasses}>
          {nextAction.heading}
        </Heading>
      ) : null}

      {nextAction.blocked ? (
        <Text as="p" className={equipmentAcquisitionPanelBlockerClasses}>
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
    <div className={equipmentAcquisitionPanelBodyClasses}>
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
    </div>
  )
}
