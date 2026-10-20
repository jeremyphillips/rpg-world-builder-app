import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type { CardElevation } from './card.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { interactiveRowVariants } from './interactive-row.variants'

export const DESTINATION_LIST_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type DestinationListDensity = (typeof DESTINATION_LIST_DENSITIES)[number]

export const DESTINATION_LIST_APPEARANCES = ['panel', 'embedded', 'filled'] as const
export type DestinationListAppearance = (typeof DESTINATION_LIST_APPEARANCES)[number]

export const DESTINATION_LIST_TONES = ['strong'] as const
export type DestinationListTone = (typeof DESTINATION_LIST_TONES)[number]

/** Same elevation ladder as {@link CardElevation} — shared shadow tokens. */
export type DestinationListElevation = CardElevation

export const UI_DESTINATION_LIST_ELEVATION_SUBTLE_CLASS =
  'ui-destination-list--elevation-subtle' as const
export const UI_DESTINATION_LIST_ELEVATION_RAISED_CLASS =
  'ui-destination-list--elevation-raised' as const

export const UI_DESTINATION_LIST_CLASS = 'ui-destination-list' as const
export const UI_DESTINATION_LIST_PANEL_CLASS = 'ui-destination-list--panel' as const
export const UI_DESTINATION_LIST_EMBEDDED_CLASS = 'ui-destination-list--embedded' as const
export const UI_DESTINATION_LIST_FILLED_CLASS = 'ui-destination-list--filled' as const
export const UI_DESTINATION_LIST_TONE_STRONG_CLASS = 'ui-destination-list--tone-strong' as const
export const UI_DESTINATION_LIST_COMPACT_CLASS = 'ui-destination-list--compact' as const
export const UI_DESTINATION_LIST_COMFORTABLE_CLASS = 'ui-destination-list--comfortable' as const
export const UI_DESTINATION_LIST_SPACIOUS_CLASS = 'ui-destination-list--spacious' as const

export const UI_DESTINATION_ITEM_CLASS = 'ui-destination-item' as const
export const UI_DESTINATION_ITEM_LINK_CLASS = 'ui-destination-item__link' as const
export const UI_DESTINATION_ITEM_MAIN_CLASS = 'ui-destination-item__main' as const
export const UI_DESTINATION_ITEM_TITLE_CLASS = 'ui-destination-item__title' as const
export const UI_DESTINATION_ITEM_DESCRIPTION_CLASS = 'ui-destination-item__description' as const
export const UI_DESTINATION_ITEM_METADATA_CLASS = 'ui-destination-item__metadata' as const
export const UI_DESTINATION_ITEM_CHEVRON_CLASS = 'ui-destination-item__chevron' as const
export const UI_DESTINATION_ITEM_IDENTITY_CLUSTER_CLASS =
  'ui-destination-item__identity-cluster' as const
export const UI_DESTINATION_ITEM_TRAILING_INFO_CLASS = 'ui-destination-item__trailing-info' as const

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
    elevation: {
      subtle: UI_DESTINATION_LIST_ELEVATION_SUBTLE_CLASS,
      raised: UI_DESTINATION_LIST_ELEVATION_RAISED_CLASS,
    },
  },
  defaultVariants: {
    appearance: 'panel',
    density: 'comfortable',
  },
})

export const destinationItemLinkVariants = cva(
  cn(
    UI_DESTINATION_ITEM_LINK_CLASS,
    interactiveRowVariants({
      interaction: 'hoverable',
      hoverFamily: 'navigation',
      hitTarget: 'pointer',
    }),
    interactiveFocusVariants({ context: 'embedded' }),
  ),
)
