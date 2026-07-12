'use client'

import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

import { EQUIPMENT_COMPACT_SEPARATOR } from '@rpg/contracts'
import { SemanticText, Text, cn } from '@rpg/ui'

import type { EquipmentPickerRowViewModel } from '@/features/content'

import { getEquipmentCalloutPresentation } from './equipment-picker-callout-presentation.lib'
import { EQUIPMENT_PICKER_HEADER_DIVIDER } from './equipment-picker-drawer.variants'
import type { EquipmentPickerCallout } from './equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_ITEM_HEADER_DIVIDER_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_INFO_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_METADATA_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_NAME_CLASSES,
  equipmentPickerItemHeaderDisabledClasses,
  equipmentPickerItemHeaderRowClasses,
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
  const metadataLine =
    item.metadata.length > 0 ? item.metadata.join(EQUIPMENT_COMPACT_SEPARATOR) : undefined

  return (
    <div
      className={cn(
        equipmentPickerItemHeaderRowClasses,
        disabled ? equipmentPickerItemHeaderDisabledClasses : undefined,
      )}
    >
      <div className={EQUIPMENT_PICKER_ITEM_HEADER_INFO_CLASSES}>
        <Text as="span" className={EQUIPMENT_PICKER_ITEM_HEADER_NAME_CLASSES}>
          {item.name}
        </Text>
        {metadataLine ? (
          <Text as="span" className={EQUIPMENT_PICKER_ITEM_HEADER_METADATA_CLASSES}>
            {metadataLine}
          </Text>
        ) : null}
        <div className={EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES}>
          <Text as="span" className={EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES}>
            {item.kindLabel}
          </Text>
          {callout ? (
            <>
              <span className={EQUIPMENT_PICKER_ITEM_HEADER_DIVIDER_CLASSES} aria-hidden>
                {EQUIPMENT_PICKER_HEADER_DIVIDER}
              </span>
              <EquipmentPickerCalloutText callout={callout} />
            </>
          ) : null}
        </div>
      </div>
      {commerce}
    </div>
  )
}

function EquipmentPickerCalloutText({ callout }: { callout: EquipmentPickerCallout }) {
  const presentation = getEquipmentCalloutPresentation(callout)
  const icon = presentation.icon === 'warning' ? <TriangleAlert aria-hidden /> : undefined

  return (
    <SemanticText tone={presentation.tone} emphasis={presentation.emphasis} icon={icon}>
      {callout.label}
    </SemanticText>
  )
}
