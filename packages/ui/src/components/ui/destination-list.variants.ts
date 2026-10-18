import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { interactiveFocusVariants, interactivePointerClasses } from './interactive-focus.variants'
import { interactiveRowVariants } from './interactive-row.variants'

export const DESTINATION_LIST_DENSITIES = ['compact', 'comfortable'] as const
export type DestinationListDensity = (typeof DESTINATION_LIST_DENSITIES)[number]

export const UI_DESTINATION_LIST_CLASS = 'ui-destination-list' as const
export const UI_DESTINATION_LIST_COMPACT_CLASS = 'ui-destination-list--compact' as const
export const UI_DESTINATION_LIST_COMFORTABLE_CLASS = 'ui-destination-list--comfortable' as const

export const UI_DESTINATION_ITEM_CLASS = 'ui-destination-item' as const
export const UI_DESTINATION_ROW_CLASS = 'ui-destination-row' as const
export const UI_DESTINATION_ROW_MAIN_CLASS = 'ui-destination-row__main' as const
export const UI_DESTINATION_ROW_TITLE_CLASS = 'ui-destination-row__title' as const
export const UI_DESTINATION_ROW_DESCRIPTION_CLASS = 'ui-destination-row__description' as const
export const UI_DESTINATION_ROW_METADATA_CLASS = 'ui-destination-row__metadata' as const
export const UI_DESTINATION_ROW_CHEVRON_CLASS = 'ui-destination-row__chevron' as const

export const destinationListVariants = cva(UI_DESTINATION_LIST_CLASS, {
  variants: {
    density: {
      compact: UI_DESTINATION_LIST_COMPACT_CLASS,
      comfortable: UI_DESTINATION_LIST_COMFORTABLE_CLASS,
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const destinationRowLinkVariants = cva(
  cn(
    UI_DESTINATION_ROW_CLASS,
    'flex w-full min-w-0 items-center gap-3 no-underline text-foreground',
    interactiveRowVariants({
      interaction: 'hoverable',
      hoverFamily: 'navigation',
      hitTarget: 'pointer',
    }),
    interactiveFocusVariants({ context: 'embedded' }),
    interactivePointerClasses,
  ),
)
