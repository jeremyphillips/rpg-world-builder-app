import { cn } from '../../lib/utils'

export type OptionCardEmbeddedSlotTone = 'divider' | 'panel'

export function selectionOptionCardAnatomyClassName({
  controlPosition = 'left',
}: {
  controlPosition?: 'left' | 'right'
} = {}): string {
  return cn(
    'ui-selection-option-card__anatomy',
    controlPosition === 'right' && 'ui-selection-option-card__anatomy--control-end',
  )
}

/** In-flow indent and panel breakout live in `ui-radio-card.css`, keyed by shell density. */
export function optionCardEmbeddedSlotClassName(
  tone: OptionCardEmbeddedSlotTone = 'divider',
): string {
  return tone === 'panel' ? 'ui-option-card__embedded--panel' : 'ui-option-card__embedded--in-flow'
}
