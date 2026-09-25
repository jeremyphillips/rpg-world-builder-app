import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { COMPACT_LABEL_SM_MIN_HEIGHT_CLASS } from './compact-label.variants'
import { cardBorderClasses, cardRadiusClasses } from './card.variants'
import { fieldSurfaceRaisedShadowClasses } from './field-surface.variants'
import { establishSurfaceCurrent } from './surface-current.lib'
import { identityInsetRowVariants } from './identity-frame.variants'

/** Shared selected-state chrome for static and radio option cards. */
export const optionCardSelectedChromeClasses =
  'border-card-selected-border bg-surface-strong ring-1 ring-primary/20 [--surface-current:var(--surface-strong)]'

/** Compact option shell — 12px left when decorative control is present, 16px right, 8px vertical. */
export const optionCardCompactOptionBodyLayoutClasses = 'pl-3 pr-4 py-2'

/** Compact chooser summary — full 16px horizontal inset, 8px vertical (no control column). */
export const optionCardCompactSummaryBodyLayoutClasses = 'px-4 py-2'

/** Density-owned card body padding — compact option cards only; summaries use {@link optionCardCompactSummaryBodyLayoutClasses}. */
export const optionCardDensityBodyLayoutVariants = cva('', {
  variants: {
    density: {
      default: 'px-4 py-3',
      compact: optionCardCompactOptionBodyLayoutClasses,
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Density-owned vertical gap between card content blocks. */
export const optionCardDensityContentGapVariants = cva('', {
  variants: {
    density: {
      default: 'gap-2',
      compact: 'gap-1',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Compact chooser summary — flush eyebrow→title (tighter than option-card content gap). */
export const optionCardCompactSummaryContentGapClasses = 'gap-0'

export const optionCardBodyVariants = cva('flex min-w-0 flex-1 flex-col', {
  variants: {
    density: {
      default: 'gap-0.5',
      compact: 'gap-0',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Shared vertical gap between option/summary title and description — one token for both surfaces. */
export const optionCardPrimaryCopyStackVariants = cva('flex flex-col', {
  variants: {
    density: {
      default: 'gap-0.5',
      compact: 'gap-0',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Compact option metadata typography — tight line-height for card secondary copy. */
export const optionCardCompactSecondaryTypographyClasses = 'text-xs leading-snug'

/** Secondary copy stack under the title row. */
export const optionCardSecondaryCopyStackVariants = cva('min-w-0', {
  variants: {
    density: {
      default: '',
      compact: optionCardCompactSecondaryTypographyClasses,
    },
    copyWidth: {
      fill: 'w-full',
      content: 'w-fit max-w-full',
    },
  },
  defaultVariants: {
    density: 'default',
    copyWidth: 'fill',
  },
})

/** Title row with a trailing end slot — spans the content column so the slot can align end. */
export const optionCardTitleLineVariants = cva(
  'flex w-full min-w-0 items-center justify-between gap-2',
)

export const optionCardTitleVariants = cva('font-bold', {
  variants: {
    density: {
      default: 'text-base',
      compact: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Chooser summary title — matches comfortable option heading scale. */
export const optionCardSummaryTitleVariants = cva('font-bold', {
  variants: {
    density: {
      default: 'text-base',
      compact: 'text-base',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

export const optionCardTitleRowVariants = cva('flex min-w-0 flex-wrap items-center gap-2')

/** Inline muted copy immediately after the card title (e.g. dependent-choice status). */
export const optionCardTitleMetaVariants = cva('text-muted-foreground')

export const optionCardSummaryLinesVariants = cva('flex flex-col gap-0.5')

/** Muted secondary copy under the card title (descriptions, summaries). */
export const optionCardDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    density: {
      default: 'text-sm',
      compact: optionCardCompactSecondaryTypographyClasses,
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

export const optionCardSummaryVariants = optionCardDescriptionVariants

/** Reserved row for optional summary badges — matches Badge/Chip sm height. */
export const optionCardSummaryBadgeRowVariants = cva(
  cn('mt-auto pt-1', COMPACT_LABEL_SM_MIN_HEIGHT_CLASS),
)

/** Two-line clamp for compact card descriptions in equal-height grids. */
export const optionCardDescriptionClampVariants = cva('line-clamp-2 min-h-[2lh]')

/** Single-line clamp for compact card titles in equal-height grids. */
export const optionCardTitleClampVariants = cva('line-clamp-1')

/** Static resolved option shell — selected chrome only, no hover. */
export const selectionOptionCardShellVariants = cva(
  cn(
    `relative overflow-hidden ${cardRadiusClasses} ${cardBorderClasses} text-left text-card-foreground ${fieldSurfaceRaisedShadowClasses}`,
    establishSurfaceCurrent('surface-strong'),
  ),
  {
    variants: {
      selected: {
        true: optionCardSelectedChromeClasses,
        false: cn('bg-surface-subtle', establishSurfaceCurrent('surface-subtle')),
      },
      disabled: {
        true: 'opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
      disabled: false,
    },
  },
)

export const selectionOptionCardBodyVariants = cva(
  cn(optionCardCompactSummaryBodyLayoutClasses, optionCardCompactSummaryContentGapClasses),
  {
    variants: {
      density: {
        default: '',
        compact: '',
      },
    },
    defaultVariants: {
      density: 'default',
    },
  },
)

export const selectionOptionCardHeaderRowVariants = cva(
  'flex flex-wrap items-center justify-between gap-2',
)

/** Identity row inside the content column — inset-row geometry for optional leading media. */
export const optionCardIdentityRowVariants = cva('flex min-w-0 items-start', {
  variants: {
    density: {
      default: identityInsetRowVariants({ density: 'comfortable', align: 'start' }),
      compact: identityInsetRowVariants({ density: 'compact', align: 'start' }),
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Summary anatomy body — flush header row to title; title→description gap stays on primary copy stack. */
export const selectionOptionCardAnatomyBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-0')

/** Compact header action — pairs with Button text + sm + compact density. */
export const selectionOptionCardHeaderActionClasses = 'shrink-0'

export const selectionOptionCardHeaderActionSlotVariants = cva(
  'flex shrink-0 items-center min-h-control-action-compact',
)

/** Horizontal padding for compact chooser summaries and symmetric breakout contexts. */
export const optionCardCompactPaddingXClasses = 'px-4'

export const optionCardCompactPaddingRightClasses = 'pr-4'

/**
 * Left inset aligning panel copy with the compact card body column
 * (option shell padding + radio control + column gap).
 */
export const optionCardCompactBodyInsetClasses = 'pl-[calc(0.75rem+1rem+0.75rem)]'

/** Panel horizontal padding: body-column inset left, shell padding right. */
export const optionCardCompactPanelPaddingClasses = `${optionCardCompactBodyInsetClasses} ${optionCardCompactPaddingRightClasses}`

/** Slot below the primary card row when a selected option reveals nested content. */
export const optionCardEmbeddedSlotVariants = cva(
  cn('bg-background', establishSurfaceCurrent('background')),
  {
    variants: {
      tone: {
        divider: 'border-t border-border',
        panel: 'border-t border-border',
      },
      density: {
        default: '',
        compact: '',
      },
    },
    compoundVariants: [
      { tone: 'divider', density: 'default', class: 'mt-4 pt-4' },
      { tone: 'divider', density: 'compact', class: 'mt-2 pt-2' },
      {
        tone: 'panel',
        density: 'default',
        class: '-mx-4 -mb-3 mt-4 rounded-b-card pb-3 pt-4',
      },
      {
        tone: 'panel',
        density: 'compact',
        class: '-mb-2 -ml-3 -mr-4 mt-2 rounded-b-card pb-2 pt-2',
      },
    ],
    defaultVariants: {
      tone: 'divider',
      density: 'default',
    },
  },
)

/** Always-visible region below the primary shell row (e.g. validation reasons). */
export const optionCardFooterSlotVariants = cva('min-w-0', {
  variants: {
    density: {
      default: 'mt-2',
      compact: 'mt-1',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

export const selectionOptionCardAnatomyRootVariants = cva('flex w-full min-w-0 items-start', {
  variants: {
    controlPosition: {
      left: '',
      right: 'flex-row-reverse',
    },
    density: {
      default: 'gap-4',
      compact: 'gap-3',
    },
  },
  defaultVariants: {
    controlPosition: 'left',
    density: 'default',
  },
})
