import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { COMPACT_LABEL_SM_MIN_HEIGHT_CLASS } from './compact-label.variants'

/** Density-owned vertical gap between card content blocks (primary row, embedded, footer). */
export const optionCardDensityContentGapVariants = cva('', {
  variants: {
    density: {
      comfortable: 'gap-2',
      compact: 'gap-1',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/** Header/eyebrow → title. Not the title → supporting gap. */
export const optionCardBodyVariants = cva('flex min-w-0 flex-1 flex-col', {
  variants: {
    density: {
      comfortable: 'gap-0.5',
      compact: 'gap-0',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/** Title → supporting copy. Spacing is `--ui-anatomy-row-gap` on `.ui-option-card__primary`. */
export const UI_OPTION_CARD_PRIMARY_CLASS = 'ui-option-card__primary' as const

export const optionCardSupportingClassName = 'ui-copy-supporting text-muted-foreground'

/** Secondary copy stack under the title row. */
export const optionCardSecondaryCopyStackVariants = cva('min-w-0', {
  variants: {
    copyWidth: {
      fill: 'w-full',
      content: 'w-fit max-w-full',
    },
  },
  defaultVariants: {
    copyWidth: 'fill',
  },
})

/** Title row with a trailing end slot — spans the content column so the slot can align end. */
export const optionCardTitleLineVariants = cva(
  'flex w-full min-w-0 items-center justify-between gap-2',
)

export const optionCardTitleClassName = 'ui-copy-title'

export const optionCardTitleRowVariants = cva('flex min-w-0 flex-wrap items-center gap-2')

export const optionCardSummaryLinesVariants = cva('flex flex-col gap-0.5')

/** Reserved row for optional summary badges — matches Badge/Chip sm height. */
export const optionCardSummaryBadgeRowVariants = cva(
  cn('mt-auto pt-1', COMPACT_LABEL_SM_MIN_HEIGHT_CLASS),
)

/** Two-line clamp for compact card descriptions in equal-height grids. */
export const optionCardDescriptionClampVariants = cva('line-clamp-2 min-h-[2lh]')

/** Single-line clamp for compact card titles in equal-height grids. */
export const optionCardTitleClampVariants = cva('line-clamp-1')

export const UI_SELECTION_OPTION_CARD_BODY_CLASS = 'ui-selection-option-card__body' as const

/** Summary shell body — flush eyebrow to title. */
export const selectionOptionCardBodyClassName = cn(UI_SELECTION_OPTION_CARD_BODY_CLASS, 'gap-0')

export const selectionOptionCardHeaderRowVariants = cva(
  'flex flex-wrap items-center justify-between gap-2',
)

/** Summary anatomy body — flush header row to title; title→supporting gap stays on the primary stack. */
export const selectionOptionCardAnatomyBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-0')

/** Compact header action — pairs with Button text + sm + compact density. */
export const selectionOptionCardHeaderActionClasses = 'shrink-0'

export const selectionOptionCardHeaderActionSlotVariants = cva(
  'flex shrink-0 items-center min-h-control-action-compact',
)

export const UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS = 'ui-option-card__embedded--in-flow' as const

export const UI_OPTION_CARD_EMBEDDED_PANEL_CLASS = 'ui-option-card__embedded--panel' as const

export type OptionCardEmbeddedSlotTone = 'divider' | 'panel'

/** In-flow indent and panel breakout live in `ui-radio-card.css`, keyed by the shell density class. */
export function optionCardEmbeddedSlotClassName(
  tone: OptionCardEmbeddedSlotTone = 'divider',
): string {
  return tone === 'panel'
    ? UI_OPTION_CARD_EMBEDDED_PANEL_CLASS
    : UI_OPTION_CARD_EMBEDDED_IN_FLOW_CLASS
}

/** Always-visible region below the primary shell row (e.g. validation reasons). */
export const optionCardFooterSlotVariants = cva('min-w-0', {
  variants: {
    density: {
      comfortable: 'mt-2',
      compact: 'mt-1',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const UI_OPTION_CARD_EMBEDDED_PANEL_CLASS_NAME = 'ui-option-card-embedded-panel' as const

export const UI_OPTION_CARD_EMBEDDED_PANEL_HEADER_CLASS =
  'ui-option-card-embedded-panel__header' as const

/** Inner embedded panel body — symmetric 12px padding. Copy scale is the compact ladder. */
export const optionCardEmbeddedPanelContentClasses = cn(
  UI_OPTION_CARD_EMBEDDED_PANEL_CLASS_NAME,
  'flex flex-col gap-3 p-3',
)

export const optionCardEmbeddedPanelHeaderRowClasses = 'flex items-start justify-between gap-3'

export const optionCardEmbeddedPanelListClasses = 'flex flex-col'

export const optionCardEmbeddedPanelRowClasses =
  'flex min-h-8 items-center justify-between gap-3 border-t border-border-subtle py-1.5'

export const optionCardEmbeddedPanelRowLabelClasses = 'min-w-0 flex-1 ui-copy-supporting'

export const optionCardEmbeddedPanelRowControlsClasses = 'flex shrink-0 items-center gap-2'

export const optionCardEmbeddedPanelRowStatusClasses =
  'text-control-action-xs text-muted-foreground'

export const selectionOptionCardAnatomyRootVariants = cva('flex w-full min-w-0 items-start', {
  variants: {
    controlPosition: {
      left: '',
      right: 'flex-row-reverse',
    },
    density: {
      comfortable: 'gap-4',
      compact: 'gap-3',
    },
  },
  defaultVariants: {
    controlPosition: 'left',
    density: 'comfortable',
  },
})
