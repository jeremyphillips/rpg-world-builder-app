import { cn } from '../../lib/utils'

/** Title → supporting copy stack inside the primary column. */
export const UI_OPTION_CARD_PRIMARY_CLASS = 'ui-option-card__primary' as const

/** Main content column: eyebrow, primary copy, embedded, footer. */
export const UI_OPTION_CARD_BODY_CLASS = 'ui-option-card__body' as const

/** Static selection card inset shell (pairs with `ui-card` density). */
export const UI_SELECTION_OPTION_CARD_BODY_CLASS = 'ui-selection-option-card__body' as const

/** Radio / chooser row: leading control + {@link UI_OPTION_CARD_BODY_CLASS}. */
export const UI_SELECTION_OPTION_CARD_ANATOMY_CLASS = 'ui-selection-option-card__anatomy' as const

export const UI_SELECTION_OPTION_CARD_ANATOMY_CONTROL_END_CLASS =
  'ui-selection-option-card__anatomy--control-end' as const

export function selectionOptionCardAnatomyClassName({
  controlPosition = 'left',
}: {
  controlPosition?: 'left' | 'right'
} = {}): string {
  return cn(
    UI_SELECTION_OPTION_CARD_ANATOMY_CLASS,
    controlPosition === 'right' && UI_SELECTION_OPTION_CARD_ANATOMY_CONTROL_END_CLASS,
  )
}

export const UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS = 'ui-option-card__embedded--in-flow' as const

export const UI_OPTION_CARD_EMBEDDED_PANEL_CLASS = 'ui-option-card__embedded--panel' as const

export type OptionCardEmbeddedSlotTone = 'divider' | 'panel'

/** In-flow indent and panel breakout live in `ui-radio-card.css`, keyed by shell density. */
export function optionCardEmbeddedSlotClassName(
  tone: OptionCardEmbeddedSlotTone = 'divider',
): string {
  return tone === 'panel'
    ? UI_OPTION_CARD_EMBEDDED_PANEL_CLASS
    : UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS
}

export const UI_OPTION_CARD_EMBEDDED_PANEL_CLASS_NAME = 'ui-option-card-embedded-panel' as const

export const UI_OPTION_CARD_EMBEDDED_PANEL_HEADER_CLASS =
  'ui-option-card-embedded-panel__header' as const
