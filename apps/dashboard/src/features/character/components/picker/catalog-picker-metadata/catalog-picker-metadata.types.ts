import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

export type CatalogPickerMetadataTextSegment = {
  type: 'text'
  text: string
}

export type CatalogPickerMetadataBadgeSegment = {
  type: 'badge'
  text: string
  tone: BadgeTone
  appearance: BadgeAppearance
}

export type CatalogPickerMetadataSegment =
  | CatalogPickerMetadataTextSegment
  | CatalogPickerMetadataBadgeSegment

export type CatalogPickerMetadataLine = {
  segments: readonly CatalogPickerMetadataSegment[]
}
