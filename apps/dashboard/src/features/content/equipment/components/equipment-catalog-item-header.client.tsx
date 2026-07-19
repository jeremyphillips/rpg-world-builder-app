'use client'

import type { ReactNode } from 'react'

import { Text, cn } from '@rpg/ui'

import type { CatalogMetadataLine } from '../../components/catalog/catalog-metadata.types'
import { CatalogMetadataRenderer } from '../../components/catalog/catalog-metadata-renderer.client'
import {
  EQUIPMENT_CATALOG_ITEM_HEADER_INFO_CLASSES,
  EQUIPMENT_CATALOG_ITEM_HEADER_NAME_CLASSES,
  equipmentCatalogItemHeaderMutedClasses,
  equipmentCatalogItemHeaderRowClasses,
  equipmentCatalogItemHeaderUnavailableClasses,
} from './equipment-catalog-item-header.variants'

export type EquipmentCatalogItemHeaderTone = 'default' | 'muted' | 'unavailable'

export type EquipmentCatalogItemHeaderProps = {
  name: string
  metadataLines?: readonly CatalogMetadataLine[]
  footer?: ReactNode
  actions?: ReactNode
  tone?: EquipmentCatalogItemHeaderTone
}

function resolveToneClasses(tone: EquipmentCatalogItemHeaderTone): string | undefined {
  if (tone === 'muted') return equipmentCatalogItemHeaderMutedClasses
  if (tone === 'unavailable') return equipmentCatalogItemHeaderUnavailableClasses
  return undefined
}

export function EquipmentCatalogItemHeader({
  name,
  metadataLines,
  footer,
  actions,
  tone = 'default',
}: EquipmentCatalogItemHeaderProps) {
  return (
    <div className={cn(equipmentCatalogItemHeaderRowClasses, resolveToneClasses(tone))}>
      <div className={EQUIPMENT_CATALOG_ITEM_HEADER_INFO_CLASSES}>
        <Text as="span" className={EQUIPMENT_CATALOG_ITEM_HEADER_NAME_CLASSES}>
          {name}
        </Text>
        {metadataLines && metadataLines.length > 0 ? (
          <CatalogMetadataRenderer lines={metadataLines} />
        ) : null}
        {footer}
      </div>
      {actions}
    </div>
  )
}
