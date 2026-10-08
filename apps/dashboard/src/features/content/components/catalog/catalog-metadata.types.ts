import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

export type CatalogMetadataTextEmphasis = 'default' | 'strong'

export type CatalogMetadataTextPart = {
  text: string
  emphasis?: CatalogMetadataTextEmphasis
}

export type CatalogMetadataTextSegment = {
  type: 'text'
  text: string
  /** Space-separated parts inside this one metadata item. */
  parts?: readonly CatalogMetadataTextPart[]
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
