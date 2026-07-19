'use client'

import type { ReactNode } from 'react'
import { Check, TriangleAlert } from 'lucide-react'

import { Badge } from '@rpg/ui'

import { EquipmentCatalogItemHeader } from '@/features/content/equipment'
import type { EquipmentPickerRowViewModel } from '@/features/content'

import { mapEquipmentCompactSummaryToMetadataLines } from '../picker/catalog-picker-metadata'
import { getEquipmentCalloutPresentation } from './equipment-picker-callout-presentation.lib'
import type { EquipmentPickerCallout } from './equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES,
} from './equipment-picker-item-header.variants'

export type EquipmentPickerItemHeaderProps = {
  item: EquipmentPickerRowViewModel
  callout?: EquipmentPickerCallout
  /** Price, owned quantity, and quick-add actions — right-aligned commerce column. */
  commerce: ReactNode
  disabled?: boolean
}

export function EquipmentPickerItemHeader({
  item,
  callout,
  commerce,
  disabled = false,
}: EquipmentPickerItemHeaderProps) {
  const metadataLines = mapEquipmentCompactSummaryToMetadataLines({
    kindLabel: item.kindLabel,
    comparisonGroups: item.comparisonGroups,
  })

  return (
    <EquipmentCatalogItemHeader
      name={item.name}
      metadataLines={metadataLines}
      tone={disabled ? 'muted' : 'default'}
      footer={
        <div className={EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES}>
          <span className={EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES}>{item.kindLabel}</span>
          {callout ? <EquipmentPickerCalloutBadge callout={callout} /> : null}
        </div>
      }
      actions={commerce}
    />
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
