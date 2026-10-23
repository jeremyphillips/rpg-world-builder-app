import { cva, type VariantProps } from 'class-variance-authority'

export const METADATA_LIST_SIZES = ['default', 'sm', 'xs'] as const

export const METADATA_LIST_COLUMN_GAPS = ['md', 'sm'] as const

export const METADATA_LIST_VALUE_TRACKS = ['content', 'fill'] as const

export const METADATA_LIST_EMPHASES = ['label', 'value'] as const

export type MetadataListSize = (typeof METADATA_LIST_SIZES)[number]

export type MetadataListColumnGap = (typeof METADATA_LIST_COLUMN_GAPS)[number]

export type MetadataListValueTrack = (typeof METADATA_LIST_VALUE_TRACKS)[number]

export type MetadataListEmphasis = (typeof METADATA_LIST_EMPHASES)[number]

/** twMerge group — metadata list type and row gap. */
export const UI_METADATA_LIST_SIZE_CLASSES = [
  'ui-metadata-list--default',
  'ui-metadata-list--sm',
  'ui-metadata-list--xs',
] as const

/** twMerge group — metadata list column gap. */
export const UI_METADATA_LIST_COLUMN_GAP_CLASSES = [
  'ui-metadata-list--gap-md',
  'ui-metadata-list--gap-sm',
] as const

/** twMerge group — metadata list value column track. */
export const UI_METADATA_LIST_VALUE_TRACK_CLASSES = [
  'ui-metadata-list--track-content',
  'ui-metadata-list--track-fill',
] as const

/** twMerge group — metadata list label/value hierarchy. */
export const UI_METADATA_LIST_EMPHASIS_CLASSES = [
  'ui-metadata-list--emphasis-label',
  'ui-metadata-list--emphasis-value',
] as const

/** Conditional modifiers only. Anatomy classes stay on the owning elements. */
export const metadataListVariants = cva('', {
  variants: {
    size: {
      default: 'ui-metadata-list--default',
      sm: 'ui-metadata-list--sm',
      xs: 'ui-metadata-list--xs',
    },
    columnGap: {
      md: 'ui-metadata-list--gap-md',
      sm: 'ui-metadata-list--gap-sm',
    },
    valueTrack: {
      content: 'ui-metadata-list--track-content',
      fill: 'ui-metadata-list--track-fill',
    },
    emphasis: {
      label: 'ui-metadata-list--emphasis-label',
      value: 'ui-metadata-list--emphasis-value',
    },
    divider: {
      true: 'ui-metadata-list--ruled ui-border--subtle',
      false: '',
    },
  },
  defaultVariants: {
    size: 'default',
    columnGap: 'md',
    valueTrack: 'content',
    emphasis: 'label',
    divider: true,
  },
})

export type MetadataListVariantProps = VariantProps<typeof metadataListVariants>
