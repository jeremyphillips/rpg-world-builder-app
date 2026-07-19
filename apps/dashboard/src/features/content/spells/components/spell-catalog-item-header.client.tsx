'use client'

import type { ReactNode } from 'react'

import { Badge, Text, cn } from '@rpg/ui'

import type { CatalogMetadataLine } from '../../components/catalog/catalog-metadata.types'
import { CatalogMetadataRenderer } from '../../components/catalog/catalog-metadata-renderer.client'
import {
  SPELL_CATALOG_ITEM_HEADER_INFO_CLASSES,
  SPELL_CATALOG_ITEM_HEADER_NAME_CLASSES,
  spellCatalogItemHeaderRowClasses,
  spellCatalogItemHeaderMutedClasses,
  spellCatalogItemHeaderUnavailableClasses,
  spellCatalogItemMarkerRowClasses,
} from './spell-catalog-item-header.variants'

export type SpellMarker = string

export type SpellCatalogItemHeaderTone = 'default' | 'muted' | 'unavailable'

export type SpellCatalogItemHeaderProps = {
  name: string
  metadataLines?: readonly CatalogMetadataLine[]
  markers?: readonly SpellMarker[]
  footer?: ReactNode
  actions?: ReactNode
  tone?: SpellCatalogItemHeaderTone
}

function resolveToneClasses(tone: SpellCatalogItemHeaderTone): string | undefined {
  if (tone === 'muted') return spellCatalogItemHeaderMutedClasses
  if (tone === 'unavailable') return spellCatalogItemHeaderUnavailableClasses
  return undefined
}

function SpellCatalogItemMarkers({ markers }: { markers: readonly SpellMarker[] }) {
  if (markers.length === 0) return null

  return (
    <div className={spellCatalogItemMarkerRowClasses}>
      {markers.map((marker) => (
        <Badge key={marker} appearance="outline" tone="neutral" size="sm">
          {marker}
        </Badge>
      ))}
    </div>
  )
}

export function SpellCatalogItemHeader({
  name,
  metadataLines,
  markers,
  footer,
  actions,
  tone = 'default',
}: SpellCatalogItemHeaderProps) {
  return (
    <div className={cn(spellCatalogItemHeaderRowClasses, resolveToneClasses(tone))}>
      <div className={SPELL_CATALOG_ITEM_HEADER_INFO_CLASSES}>
        <Text as="span" className={SPELL_CATALOG_ITEM_HEADER_NAME_CLASSES}>
          {name}
        </Text>
        {metadataLines && metadataLines.length > 0 ? (
          <CatalogMetadataRenderer lines={metadataLines} />
        ) : null}
        {markers && markers.length > 0 ? <SpellCatalogItemMarkers markers={markers} /> : null}
        {footer}
      </div>
      {actions}
    </div>
  )
}
