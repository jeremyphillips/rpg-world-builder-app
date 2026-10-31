import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'
import type { CardElevation } from './card.variants'
import { LIST_DENSITIES, type ListDensity } from './list-density.lib'

export const DESTINATION_LIST_DENSITIES = LIST_DENSITIES
export type DestinationListDensity = ListDensity

export const DESTINATION_LIST_APPEARANCES = ['panel', 'embedded', 'filled'] as const
export type DestinationListAppearance = (typeof DESTINATION_LIST_APPEARANCES)[number]

export const DESTINATION_LIST_TONES = ['strong'] as const
export type DestinationListTone = (typeof DESTINATION_LIST_TONES)[number]

/** Same elevation ladder as {@link CardElevation} — shared shadow tokens. */
export type DestinationListElevation = CardElevation

export const destinationListVariants = cva('ui-destination-list', {
  variants: {
    appearance: {
      panel: cn('ui-destination-list--panel', borderStrength()),
      embedded: 'ui-destination-list--embedded',
      filled: cn('ui-destination-list--filled', borderStrength()),
    },
    tone: {
      strong: 'ui-destination-list--tone-strong',
    },
    elevation: {
      subtle: 'ui-destination-list--elevation-subtle',
      raised: 'ui-destination-list--elevation-raised',
    },
  },
  defaultVariants: {
    appearance: 'panel',
  },
})
