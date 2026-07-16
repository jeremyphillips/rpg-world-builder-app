'use client'

import type { ReactNode } from 'react'

import { Text, cn } from '@rpg/ui'

import { CatalogPickerMetadataRenderer } from './catalog-picker-metadata/catalog-picker-metadata-renderer.client'
import type { CatalogPickerMetadataLine } from './catalog-picker-metadata/catalog-picker-metadata.types'
import {
  CATALOG_PICKER_ITEM_HEADER_INFO_CLASSES,
  CATALOG_PICKER_ITEM_HEADER_NAME_CLASSES,
  catalogPickerItemHeaderDisabledClasses,
  catalogPickerItemHeaderRowClasses,
} from './catalog-picker-item-header.variants'

export type CatalogPickerItemHeaderProps = {
  name: string
  metadataLines?: readonly CatalogPickerMetadataLine[]
  footer?: ReactNode
  actions: ReactNode
  disabled?: boolean
}

export function CatalogPickerItemHeader({
  name,
  metadataLines,
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
        {metadataLines && metadataLines.length > 0 ? (
          <CatalogPickerMetadataRenderer lines={metadataLines} />
        ) : null}
        {footer}
      </div>
      {actions}
    </div>
  )
}
