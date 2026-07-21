'use client'

import { useId, useMemo } from 'react'

import { Badge, Button, Heading, NumberStepper, Text } from '@rpg/ui'

import { EQUIPMENT_ACQUISITION_ADDING_LABEL } from '../../lib/equipment-step.lib'
import {
  clampEquipmentStepQuantity,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../lib/equipment-quantity.lib'
import {
  buildEquipmentAcquisitionPanelViewModel,
  formatAcquisitionCommitSuccessAnnouncement,
  formatAcquisitionCommitSuccessButtonLabel,
  type EquipmentOwnedSourceAction,
  type EquipmentOwnedSourceViewModel,
} from './equipment-acquisition-panel.lib'
import {
  equipmentAcquisitionPanelBlockerClasses,
  equipmentAcquisitionPanelBodyClasses,
  equipmentAcquisitionPanelCommitButtonClasses,
  equipmentAcquisitionPanelDividerClasses,
  equipmentAcquisitionPanelNextActionClasses,
  equipmentAcquisitionPanelNextActionDisclosureClasses,
  equipmentAcquisitionPanelOwnedHeadingRowClasses,
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
import type { EquipmentAcquisitionPanelBodyProps } from './equipment-acquisition-panel-body.types'

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
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => onSourceAction(source.action)}
        >
          {source.action.label}
        </Button>
      </div>
    </div>
  )
}

function resolveCommitButtonLabel(args: {
  isPending?: boolean
  successQuantity?: number
  primaryActionLabel: string
}): string {
  if (args.isPending) return EQUIPMENT_ACQUISITION_ADDING_LABEL
  if (args.successQuantity !== undefined) {
    return formatAcquisitionCommitSuccessButtonLabel(args.successQuantity)
  }
  return args.primaryActionLabel
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
  const commitButtonLabel = resolveCommitButtonLabel({
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
        <>
          <div
            className={
              isDisclosureLayout
                ? equipmentAcquisitionPanelOwnedSectionDisclosureClasses
                : equipmentAcquisitionPanelOwnedSectionClasses
            }
          >
            <div className={equipmentAcquisitionPanelOwnedHeadingRowClasses}>
              <Heading
                variant="group"
                as="h4"
                className={equipmentAcquisitionPanelSectionHeadingClasses}
              >
                {owned.heading}
              </Heading>
              {owned.totalQuantity > 0 ? (
                <Badge appearance="neutral" tone="neutral" size="sm">
                  {owned.totalQuantity}
                </Badge>
              ) : null}
            </div>
            <div
              className={
                isDisclosureLayout
                  ? equipmentAcquisitionPanelOwnedSourceListDisclosureClasses
                  : equipmentAcquisitionPanelSourceListClasses
              }
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
      ) : null}

      <div
        className={
          isDisclosureLayout
            ? equipmentAcquisitionPanelNextActionDisclosureClasses
            : equipmentAcquisitionPanelNextActionClasses
        }
      >
        {nextAction.heading ? (
          <Heading
            variant="group"
            as="h4"
            className={equipmentAcquisitionPanelSectionHeadingClasses}
          >
            {nextAction.heading}
          </Heading>
        ) : null}

        {nextAction.blocked ? (
          <Text as="p" className={equipmentAcquisitionPanelBlockerClasses}>
            {nextAction.blockerNote}
          </Text>
        ) : (
          <>
            {nextAction.showQuantity ? (
              <div
                className={
                  isDisclosureLayout
                    ? equipmentAcquisitionPanelQuantityRowDisclosureClasses
                    : equipmentAcquisitionPanelQuantityRowClasses
                }
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
            ) : null}

            {nextAction.previewLines.map((line) => (
              <Text
                key={line}
                as="p"
                className={
                  isDisclosureLayout
                    ? equipmentAcquisitionPanelPreviewLineDisclosureClasses
                    : equipmentAcquisitionPanelPreviewLineClasses
                }
              >
                {line}
              </Text>
            ))}

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
        )}

        <div id={liveRegionId} aria-live="polite" aria-atomic="true" className="sr-only">
          {successAnnouncement}
        </div>
      </div>
    </div>
  )
}
