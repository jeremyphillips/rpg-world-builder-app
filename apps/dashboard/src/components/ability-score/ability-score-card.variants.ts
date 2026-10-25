import { cva } from 'class-variance-authority'

import { cn, interactiveFocusVariants } from '@rpg/ui'

/** Fills grid columns; width constraints belong on the parent layout only. */
export const abilityScoreCardShellClasses = 'w-full min-w-0'

export const abilityScoreCardVariants = cva(
  cn('rounded-md bg-surface-lift text-center transition-colors', abilityScoreCardShellClasses),
  {
    variants: {
      state: {
        resting: 'border border-border bg-surface-lift',
        dragOver: 'border border-dashed border-primary bg-surface-lift ring-2 ring-primary/30',
        draggingFrom: 'border border-dashed border-muted-foreground/40 bg-surface-muted',
        invalid: 'border border-destructive bg-surface-lift ring-2 ring-destructive/30',
      },
      size: {
        sm: '',
        md: '',
      },
      interaction: {
        none: '',
        select: '',
        numeric: '',
      },
      scoreLayout: {
        centered: '',
        stepper: '',
        'select-filled': '',
        choose: 'relative cursor-pointer',
      },
    },
    compoundVariants: [
      {
        state: 'resting',
        interaction: 'select',
        className: 'hover:border-foreground',
      },
      {
        scoreLayout: 'choose',
        className: 'group/choose',
      },
    ],
    defaultVariants: {
      state: 'resting',
      size: 'md',
      interaction: 'none',
      scoreLayout: 'centered',
    },
  },
)

export const abilityScoreCardBodyPaddingClasses = {
  sm: 'p-2',
  md: 'p-3',
} as const

/** 6px above the score row; `gap-2` before the modifier except in stepper layout. */
export const abilityScoreCardScoreSectionVariants = cva('flex flex-col pt-[6px]', {
  variants: {
    layout: {
      centered: 'gap-2',
      stepper: 'gap-0',
      'select-filled': 'gap-2',
      choose: 'gap-2',
    },
  },
  defaultVariants: {
    layout: 'centered',
  },
})

export type AbilityScoreCardScoreLayout = 'centered' | 'stepper' | 'select-filled' | 'choose'

export const abilityScoreCardHeaderClasses =
  'grid min-h-[var(--control-action-compact-height)] grid-cols-[1fr_auto_1fr] items-center gap-1 px-1 text-sm font-semibold'

export const abilityScoreCardHeaderLabelClasses = 'col-start-2 text-center'

export const abilityScoreCardHeaderAdornmentClasses =
  'col-start-3 flex items-center justify-end self-center'

export const abilityScoreCardScoreRowVariants = cva('flex w-full min-w-0 items-center', {
  variants: {
    layout: {
      centered: 'justify-center',
      stepper: 'justify-center gap-2',
      'select-filled': 'justify-center',
      choose: 'justify-center',
    },
  },
  defaultVariants: {
    layout: 'centered',
  },
})

/** Locks score-row height so modifiers align across numerals, prompts, and display dashes. */
export function abilityScoreCardScoreSlotMinHeightClassesFor(size: 'sm' | 'md'): string {
  return size === 'sm'
    ? 'min-h-[length:var(--text-ability-score-sm--line-height)]'
    : 'min-h-[length:var(--text-ability-score-md--line-height)]'
}

/** Stepper mode: score width follows the numeral; row centers score + stepper as one group. */
export const abilityScoreCardScoreStepperSlotClasses =
  'min-w-0 shrink-0 overflow-hidden tabular-nums'

/** Centered score (display, select-filled score, choose). */
export const abilityScoreCardScoreCenteredSlotClasses =
  'w-full min-w-0 max-w-full overflow-hidden tabular-nums text-center'

/**
 * Filled select: score stays card-centered; pencil sits in a matching right lane.
 * Left lane mirrors pencil width so the numeral does not shift when the edit control appears.
 */
export const abilityScoreCardSelectFilledClusterClasses = cn(
  'inline-grid max-w-full min-w-0 items-center gap-1',
  'grid-cols-[var(--control-action-compact-height)_auto_var(--control-action-compact-height)]',
)

export const abilityScoreCardSelectFilledBalanceSlotClasses =
  'size-control-action-compact shrink-0 justify-self-end'

export const abilityScoreCardSelectInlineNumeralClasses =
  'justify-self-center overflow-hidden tabular-nums'

export const abilityScoreCardSelectPencilButtonClasses =
  'inline-flex shrink-0 items-center justify-center'

export const ABILITY_SCORE_SELECT_CHOOSE_LABEL = 'Choose' as const

export const ABILITY_SCORE_SELECT_RELEASE_TO_ASSIGN_LABEL = 'Release to assign' as const

/** Decorative outline control for empty choose cards (real trigger is the full-card overlay). */
export const abilityScoreCardChooseTriggerClasses = cn(
  'ui-button ui-button--outline ui-button--sm font-body',
  'pointer-events-none inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
  'group-hover/choose:bg-[var(--interactive-outline-hover-bg)]',
  'group-active/choose:bg-[var(--interactive-outline-active-bg)]',
)

/** Drag-over preview numeral + absolutely positioned hint (hint does not expand the score row). */
export const abilityScoreCardDragOverPreviewClasses = 'relative w-full min-w-0'

export const abilityScoreCardDragOverPreviewHintClasses = cn(
  'pointer-events-none absolute inset-x-0 top-full -translate-y-1 truncate text-center text-control-action-xs text-muted-foreground',
)

/** Covers the card hit target; popover trigger sits above chrome but below header adornment tooltips. */
export const abilityScoreCardChooseOverlayClasses =
  'absolute inset-0 z-10 rounded-md opacity-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export const abilityScoreCardStepperStackClasses = 'flex shrink-0 flex-col items-center gap-0.5'

const abilityScoreCardScoreValueBaseClasses = 'font-semibold tabular-nums text-foreground'

/** Score numerals — sm 28px (`--text-ability-score-sm`), md 32px. */
export function abilityScoreCardScoreValueClassesFor(size: 'sm' | 'md'): string {
  return cn(
    abilityScoreCardScoreValueBaseClasses,
    size === 'sm'
      ? 'text-[length:var(--text-ability-score-sm)] leading-[length:var(--text-ability-score-sm--line-height)]'
      : 'text-[length:var(--text-ability-score-md)] leading-[length:var(--text-ability-score-md--line-height)]',
  )
}

/** 24px compact lane — matches `--control-height-compact` / `size-control-action-compact`. */
export const abilityScoreCardStepperButtonSize = 'xs' as const

export const abilityScoreCardStepperButtonAppearance = 'isolated' as const

export const abilityScoreCardModifierClasses = 'text-base tabular-nums text-muted-foreground'

export const abilityScoreCardFooterActionLabelClasses = 'text-style-caption font-body'

/** Checkbox on footer row — surface stays visible over outline hover/active on the label. */
export const abilityScoreCardFooterCheckboxClasses =
  'bg-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground'

/** Entire footer row — outline hover/active, padding, and card bottom radius (no inner button chrome). */
export const abilityScoreCardFooterClasses = cn(
  'ui-button ui-button--outline ui-button--xs-compact font-body',
  interactiveFocusVariants({ context: 'standalone' }),
  'flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border-0 border-t border-border-subtle px-2 py-[2px] shadow-none',
  'rounded-none rounded-b-md',
)

export type AbilityScoreCardState = 'resting' | 'dragOver' | 'draggingFrom' | 'invalid'
