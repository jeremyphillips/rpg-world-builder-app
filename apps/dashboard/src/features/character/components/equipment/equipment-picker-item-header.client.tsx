'use client'

import type { ReactNode } from 'react'

import { EQUIPMENT_COMPACT_SEPARATOR } from '@rpg/contracts'
import { Text, cn } from '@rpg/ui'

import type { EquipmentPickerRowViewModel } from '@/features/content'

import { EQUIPMENT_PICKER_HEADER_DIVIDER } from './equipment-picker-drawer.variants'
import type { EquipmentPickerCallout } from './equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_ITEM_HEADER_ACTIONS_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_CALLOUT_INFO_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_CALLOUT_WARNING_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_DIVIDER_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_METADATA_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_NAME_CLASSES,
  equipmentPickerItemHeaderColumnClasses,
  equipmentPickerItemHeaderDisabledClasses,
} from './equipment-picker-item-header.variants'

export type EquipmentPickerItemHeaderProps = {
  item: EquipmentPickerRowViewModel
  callout?: EquipmentPickerCallout
  actions: ReactNode
  disabled?: boolean
}

export function EquipmentPickerItemHeader({
  item,
  callout,
  actions,
  disabled = false,
}: EquipmentPickerItemHeaderProps) {
  const metadataLine =
    item.metadata.length > 0 ? item.metadata.join(EQUIPMENT_COMPACT_SEPARATOR) : undefined

  return (
    <div
      className={cn(
        equipmentPickerItemHeaderColumnClasses,
        disabled ? equipmentPickerItemHeaderDisabledClasses : undefined,
      )}
    >
      <Text as="span" className={EQUIPMENT_PICKER_ITEM_HEADER_NAME_CLASSES}>
        {item.name}
      </Text>
      {metadataLine ? (
        <Text as="span" className={EQUIPMENT_PICKER_ITEM_HEADER_METADATA_CLASSES}>
          {metadataLine}
        </Text>
      ) : null}
      <div className={EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_CLASSES}>
        <div className={EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES}>
          <Text as="span" className={EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES}>
            {item.kindLabel}
          </Text>
          {callout ? (
            <>
              <span className={EQUIPMENT_PICKER_ITEM_HEADER_DIVIDER_CLASSES} aria-hidden>
                {EQUIPMENT_PICKER_HEADER_DIVIDER}
              </span>
              <Text
                as="span"
                className={
                  callout.emphasis === 'warning'
                    ? EQUIPMENT_PICKER_ITEM_HEADER_CALLOUT_WARNING_CLASSES
                    : EQUIPMENT_PICKER_ITEM_HEADER_CALLOUT_INFO_CLASSES
                }
              >
                {callout.label}
              </Text>
            </>
          ) : null}
        </div>
        <div className={EQUIPMENT_PICKER_ITEM_HEADER_ACTIONS_CLASSES}>{actions}</div>
      </div>
    </div>
  )
}
