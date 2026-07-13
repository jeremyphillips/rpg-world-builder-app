'use client'

import type { ReactNode } from 'react'

import { Text, cn } from '@rpg/ui'

import {
  CATALOG_PICKER_ITEM_HEADER_INFO_CLASSES,
  CATALOG_PICKER_ITEM_HEADER_METADATA_CLASSES,
  CATALOG_PICKER_ITEM_HEADER_NAME_CLASSES,
  catalogPickerItemHeaderDisabledClasses,
  catalogPickerItemHeaderRowClasses,
} from './catalog-picker-item-header.variants'

export type CatalogPickerItemHeaderProps = {
  name: string
  metadataLine?: string
  footer?: ReactNode
  actions: ReactNode
  disabled?: boolean
}

export function CatalogPickerItemHeader({
  name,
  metadataLine,
  footer,
  actions,
  disabled = false,
}: CatalogPickerItemHeaderProps) {
  return (
    <div
      className={cn(
        catalogPickerItemHeaderRowClasses,
        disabled ? catalogPickerItemHeaderDisabledClasses : undefined,
      )}
    >
      <div className={CATALOG_PICKER_ITEM_HEADER_INFO_CLASSES}>
        <Text as="span" className={CATALOG_PICKER_ITEM_HEADER_NAME_CLASSES}>
          {name}
        </Text>
        {metadataLine ? (
          <Text as="span" className={CATALOG_PICKER_ITEM_HEADER_METADATA_CLASSES}>
            {metadataLine}
          </Text>
        ) : null}
        {footer}
      </div>
      {actions}
    </div>
  )
}
