import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { interactiveRowVariants } from './interactive-row.variants'

export const DESTINATION_LIST_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type DestinationListDensity = (typeof DESTINATION_LIST_DENSITIES)[number]

export const DESTINATION_LIST_APPEARANCES = ['panel', 'embedded', 'filled'] as const
export type DestinationListAppearance = (typeof DESTINATION_LIST_APPEARANCES)[number]

export const DESTINATION_LIST_TONES = ['strong'] as const
export type DestinationListTone = (typeof DESTINATION_LIST_TONES)[number]

export const UI_DESTINATION_LIST_CLASS = 'ui-destination-list' as const
export const UI_DESTINATION_LIST_PANEL_CLASS = 'ui-destination-list--panel' as const
export const UI_DESTINATION_LIST_EMBEDDED_CLASS = 'ui-destination-list--embedded' as const
export const UI_DESTINATION_LIST_FILLED_CLASS = 'ui-destination-list--filled' as const
export const UI_DESTINATION_LIST_TONE_STRONG_CLASS = 'ui-destination-list--tone-strong' as const
export const UI_DESTINATION_LIST_COMPACT_CLASS = 'ui-destination-list--compact' as const
export const UI_DESTINATION_LIST_COMFORTABLE_CLASS = 'ui-destination-list--comfortable' as const
export const UI_DESTINATION_LIST_SPACIOUS_CLASS = 'ui-destination-list--spacious' as const

export const UI_DESTINATION_ITEM_CLASS = 'ui-destination-item' as const
export const UI_DESTINATION_ROW_CLASS = 'ui-destination-row' as const
export const UI_DESTINATION_ROW_MAIN_CLASS = 'ui-destination-row__main' as const
export const UI_DESTINATION_ROW_TITLE_CLASS = 'ui-destination-row__title' as const
export const UI_DESTINATION_ROW_DESCRIPTION_CLASS = 'ui-destination-row__description' as const
export const UI_DESTINATION_ROW_METADATA_CLASS = 'ui-destination-row__metadata' as const
export const UI_DESTINATION_ROW_CHEVRON_CLASS = 'ui-destination-row__chevron' as const
export const UI_DESTINATION_ROW_IDENTITY_CLUSTER_CLASS =
  'ui-destination-row__identity-cluster' as const
export const UI_DESTINATION_ROW_TRAILING_INFO_CLASS = 'ui-destination-row__trailing-info' as const

export const destinationListVariants = cva(UI_DESTINATION_LIST_CLASS, {
  variants: {
    appearance: {
      panel: UI_DESTINATION_LIST_PANEL_CLASS,
      embedded: UI_DESTINATION_LIST_EMBEDDED_CLASS,
      filled: UI_DESTINATION_LIST_FILLED_CLASS,
    },
    density: {
      compact: UI_DESTINATION_LIST_COMPACT_CLASS,
      comfortable: UI_DESTINATION_LIST_COMFORTABLE_CLASS,
      spacious: UI_DESTINATION_LIST_SPACIOUS_CLASS,
    },
    tone: {
      strong: UI_DESTINATION_LIST_TONE_STRONG_CLASS,
    },
  },
  defaultVariants: {
    appearance: 'panel',
    density: 'comfortable',
  },
})

export const destinationRowLinkVariants = cva(
  cn(
    UI_DESTINATION_ROW_CLASS,
    interactiveRowVariants({
      interaction: 'hoverable',
      hoverFamily: 'navigation',
      hitTarget: 'pointer',
    }),
    interactiveFocusVariants({ context: 'embedded' }),
  ),
)
