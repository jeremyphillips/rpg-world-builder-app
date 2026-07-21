'use client'

import { Check, TriangleAlert } from 'lucide-react'

import { Badge, Text } from '@rpg/ui'

import type { EquipmentPickerRowViewModel } from '@/features/content'

import {
  CatalogPickerMetadataRenderer,
  mapEquipmentCompactSummaryToMetadataLines,
} from '../picker/catalog-picker-metadata'
import { getEquipmentCalloutPresentation } from './equipment-picker-callout-presentation.lib'
import type { EquipmentPickerCallout } from './equipment-picker-drawer.types'
import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import type { EquipmentPickerHeaderAction } from './equipment-picker-item-header.lib'
import {
  EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_NAME_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_ROOT_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_SUMMARY_METADATA_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_SUMMARY_ROW_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_SUMMARY_TRAILING_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_TITLE_ROW_CLASSES,
} from './equipment-picker-item-header.variants'

export type EquipmentPickerItemHeaderProps = {
  item: EquipmentPickerRowViewModel
  callout?: EquipmentPickerCallout
  summaryTrailingLabel?: string
  summaryTrailingTone?: 'default' | 'muted' | 'blocked'
  action: EquipmentPickerHeaderAction
  ownedQuantity?: number
  addButtonLabel?: string
  isPending?: boolean
  onAdd?: () => void
}

export function EquipmentPickerItemHeader({
  item,
  callout,
  summaryTrailingLabel,
  summaryTrailingTone = 'default',
  action,
  ownedQuantity = 0,
  addButtonLabel = 'Add',
  isPending = false,
  onAdd,
}: EquipmentPickerItemHeaderProps) {
  const metadataLines = mapEquipmentCompactSummaryToMetadataLines({
    kindLabel: item.kindLabel,
    comparisonGroups: item.comparisonGroups,
  })
  const hasMetadata = metadataLines.length > 0
  const showSummaryRow = hasMetadata || Boolean(summaryTrailingLabel)
  const showCommerce = action.kind === 'add' || (action.kind === 'manage_only' && ownedQuantity > 0)
  const addDisabled = action.kind === 'add' ? action.disabled : false

  return (
    <div className={EQUIPMENT_PICKER_ITEM_HEADER_ROOT_CLASSES}>
      <div className={EQUIPMENT_PICKER_ITEM_HEADER_TITLE_ROW_CLASSES}>
        <Text as="span" className={EQUIPMENT_PICKER_ITEM_HEADER_NAME_CLASSES}>
          {item.name}
        </Text>
        {showCommerce ? (
          <EquipmentPickerCommerce
            ownedQuantity={ownedQuantity}
            showAdd={action.kind === 'add'}
            disabled={addDisabled}
            buttonLabel={addButtonLabel}
            isPending={isPending}
            onAdd={onAdd ?? (() => undefined)}
          />
        ) : null}
      </div>
      {showSummaryRow ? (
        <div className={EQUIPMENT_PICKER_ITEM_HEADER_SUMMARY_ROW_CLASSES}>
          {hasMetadata ? (
            <div className={EQUIPMENT_PICKER_ITEM_HEADER_SUMMARY_METADATA_CLASSES}>
              <CatalogPickerMetadataRenderer lines={metadataLines} />
            </div>
          ) : (
            <span aria-hidden className={EQUIPMENT_PICKER_ITEM_HEADER_SUMMARY_METADATA_CLASSES} />
          )}
          {summaryTrailingLabel ? (
            <Text
              as="span"
              className={EQUIPMENT_PICKER_ITEM_HEADER_SUMMARY_TRAILING_CLASSES[summaryTrailingTone]}
            >
              {summaryTrailingLabel}
            </Text>
          ) : null}
        </div>
      ) : null}
      <div className={EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES}>
        <span className={EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES}>{item.kindLabel}</span>
        {callout ? <EquipmentPickerCalloutBadge callout={callout} /> : null}
      </div>
    </div>
  )
}

function EquipmentPickerCalloutBadge({ callout }: { callout: EquipmentPickerCallout }) {
  const presentation = getEquipmentCalloutPresentation(callout)
  const leadingIcon =
    presentation.leadingIcon === 'check' ? (
      <Check aria-hidden />
    ) : presentation.leadingIcon === 'warning' ? (
      <TriangleAlert aria-hidden />
    ) : undefined

  return (
    <Badge
      appearance={presentation.appearance}
      tone={presentation.tone}
      size={presentation.size}
      leadingIcon={leadingIcon}
    >
      {callout.label}
    </Badge>
  )
}
