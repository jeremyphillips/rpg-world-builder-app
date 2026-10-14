import { cva } from 'class-variance-authority'

import { buttonVariants, cn } from '@rpg/ui'

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
        className: 'hover:border-foreground hover:bg-surface-subtle',
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

/** 6px above the score row; 8px (`gap-2`) before the modifier when shown. */
export const abilityScoreCardScoreSectionClasses = 'flex flex-col gap-2 pt-[6px]'

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
      stepper: 'justify-end gap-2',
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
    ? 'min-h-[length:var(--text-heading-3--line-height)]'
    : 'min-h-[length:var(--text-ability-score-md--line-height)]'
}

/** Stepper mode: score sits in remaining space, flush toward the stepper column. */
export const abilityScoreCardScoreStepperSlotClasses =
  'min-w-0 flex-1 overflow-hidden text-end tabular-nums'

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

/** Shared vertical prompt for empty Choose and drag-over Drop. */
export const abilityScoreCardSelectPromptClasses = cn(
  'flex w-full min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-xs text-muted-foreground',
)

export const abilityScoreCardSelectPromptIconClasses = 'size-5 shrink-0'

export const abilityScoreCardSelectPromptLabelClasses = 'w-full min-w-0 truncate'

/** Covers the card hit target; popover trigger sits above chrome but below header adornment tooltips. */
export const abilityScoreCardChooseOverlayClasses =
  'absolute inset-0 z-10 rounded-md opacity-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export const abilityScoreCardStepperStackClasses = 'flex shrink-0 flex-col items-center gap-0.5'

const abilityScoreCardScoreValueBaseClasses = 'font-semibold tabular-nums text-foreground'

/** Score numerals — sm ~28px (heading-3), md ~32px. */
export function abilityScoreCardScoreValueClassesFor(size: 'sm' | 'md'): string {
  return cn(
    abilityScoreCardScoreValueBaseClasses,
    size === 'sm'
      ? 'text-[length:var(--text-heading-3)] leading-[length:var(--text-heading-3--line-height)]'
      : 'text-[length:var(--text-ability-score-md)] leading-[length:var(--text-ability-score-md--line-height)]',
  )
}

/** 24px compact lane — matches `--control-height-compact` / `size-control-action-compact`. */
export const abilityScoreCardStepperButtonSize = 'xs' as const

export const abilityScoreCardStepperButtonAppearance = 'isolated' as const

export const abilityScoreCardModifierClasses = 'text-style-label tabular-nums text-muted-foreground'

/** Footer shell — border only; padding lives on footer actions (e.g. monster save prof). */
export const abilityScoreCardFooterClasses = 'border-t border-border'

export const abilityScoreCardFooterActionLabelClasses = 'text-xs'

export const abilityScoreCardFooterActionClasses = cn(
  buttonVariants({ variant: 'outline', size: 'xs', density: 'compact' }),
  'border-0 shadow-none',
  'inline-flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap px-2 py-[2px]',
)

export type AbilityScoreCardState = 'resting' | 'dragOver' | 'draggingFrom' | 'invalid'
