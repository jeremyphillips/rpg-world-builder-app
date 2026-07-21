import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

export type CatalogMetadataTextSegment = {
  type: 'text'
  text: string
}

export type CatalogMetadataBadgeSegment = {
  type: 'badge'
  text: string
  tone: BadgeTone
  appearance: BadgeAppearance
}

export type CatalogMetadataSegment = CatalogMetadataTextSegment | CatalogMetadataBadgeSegment

export type CatalogMetadataLine = {
  segments: readonly CatalogMetadataSegment[]
}
