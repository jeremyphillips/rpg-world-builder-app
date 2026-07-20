'use client'

import { useId, useMemo } from 'react'

import { Button, Heading, NumberStepper, Text } from '@rpg/ui'

import { EQUIPMENT_ACQUISITION_ADDING_LABEL } from '../../lib/equipment-step.lib'
import {
  clampEquipmentStepQuantity,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../lib/equipment-quantity.lib'
import {
  buildEquipmentAcquisitionPanelViewModel,
  type EquipmentAcquisitionPanelViewModel,
  type EquipmentOwnedSourceAction,
} from './equipment-acquisition-panel.lib'
import {
  equipmentAcquisitionPanelBlockerClasses,
  equipmentAcquisitionPanelBodyClasses,
  equipmentAcquisitionPanelDividerClasses,
  equipmentAcquisitionPanelNextActionClasses,
  equipmentAcquisitionPanelPreviewLineClasses,
  equipmentAcquisitionPanelPurchaseFooterClasses,
  equipmentAcquisitionPanelQuantityLabelClasses,
  equipmentAcquisitionPanelQuantityRowClasses,
  equipmentAcquisitionPanelSectionHeadingClasses,
  equipmentAcquisitionPanelSourceActionsClasses,
  equipmentAcquisitionPanelSourceLabelClasses,
  equipmentAcquisitionPanelSourceListClasses,
  equipmentAcquisitionPanelSourceMetaClasses,
  equipmentAcquisitionPanelSourceQuantityClasses,
  equipmentAcquisitionPanelSourceRowClasses,
  equipmentAcquisitionPanelSuccessClasses,
} from './equipment-acquisition-panel.variants'
import type { EquipmentAcquisitionPanelBodyProps } from './equipment-acquisition-panel-body.types'

function OwnedSourceRow({
  source,
  onSourceAction,
  disabled,
}: {
  source: NonNullable<EquipmentAcquisitionPanelViewModel['owned']>['sources'][number]
  onSourceAction: (action: EquipmentOwnedSourceAction) => void
  disabled?: boolean
}) {
  return (
    <div className={equipmentAcquisitionPanelSourceRowClasses}>
      <div className={equipmentAcquisitionPanelSourceMetaClasses}>
        <Text as="p" className={equipmentAcquisitionPanelSourceLabelClasses}>
          {source.label}
        </Text>
      </div>
      <Text as="span" className={equipmentAcquisitionPanelSourceQuantityClasses}>
        {source.quantity}
      </Text>
      <div className={equipmentAcquisitionPanelSourceActionsClasses}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => onSourceAction(source.action)}
        >
          {source.action.label}
        </Button>
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
  successMessage,
  onSourceAction,
  onCommit,
}: EquipmentAcquisitionPanelBodyProps) {
  const liveRegionId = useId()

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
        successMessage,
      }),
    [budget, catalogIndex, context, draft, equipment, isPending, quantity, rows, successMessage],
  )

  const { owned, nextAction } = viewModel

  return (
    <div className={equipmentAcquisitionPanelBodyClasses}>
      {owned ? (
        <>
          <div className="space-y-3">
            <Heading
              variant="group"
              as="h4"
              className={equipmentAcquisitionPanelSectionHeadingClasses}
            >
              {owned.heading}
            </Heading>
            <div className={equipmentAcquisitionPanelSourceListClasses}>
              {owned.sources.map((source) => (
                <OwnedSourceRow
                  key={source.key}
                  source={source}
                  onSourceAction={onSourceAction}
                  disabled={isPending}
                />
              ))}
              {owned.purchaseSpendLabel ? (
                <div className={equipmentAcquisitionPanelPurchaseFooterClasses}>
                  {owned.purchaseSpendLabel}
                </div>
              ) : null}
            </div>
          </div>
          <div className={equipmentAcquisitionPanelDividerClasses} />
        </>
      ) : null}

      <div className={equipmentAcquisitionPanelNextActionClasses}>
        <Heading variant="group" as="h4" className={equipmentAcquisitionPanelSectionHeadingClasses}>
          {nextAction.heading}
        </Heading>

        {nextAction.blocked ? (
          <Text as="p" className={equipmentAcquisitionPanelBlockerClasses}>
            {nextAction.blockerNote}
          </Text>
        ) : (
          <>
            {nextAction.showQuantity ? (
              <div className={equipmentAcquisitionPanelQuantityRowClasses}>
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
              <Text key={line} as="p" className={equipmentAcquisitionPanelPreviewLineClasses}>
                {line}
              </Text>
            ))}

            <Button
              type="button"
              size="sm"
              disabled={nextAction.disabled}
              onClick={() => onCommit(nextAction.commitQuantity)}
            >
              {isPending ? EQUIPMENT_ACQUISITION_ADDING_LABEL : nextAction.primaryActionLabel}
            </Button>
          </>
        )}

        {successMessage ? (
          <>
            <Text as="p" className={equipmentAcquisitionPanelSuccessClasses} aria-live="polite">
              {successMessage}
            </Text>
            <div id={liveRegionId} aria-live="polite" aria-atomic="true" className="sr-only">
              {successMessage}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
