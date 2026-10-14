import { cva } from 'class-variance-authority'

import { cn } from '@rpg/ui'

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
    },
  },
)

export const abilityScoreCardBodyPaddingClasses = {
  sm: 'p-2',
  md: 'p-3',
} as const

export const abilityScoreCardHeaderClasses = 'relative px-6 text-sm font-semibold text-center'

export const abilityScoreCardHeaderAdornmentClasses = 'absolute right-0 top-0'

/** Symmetric compact lanes reserve stepper width via `--control-action-compact-height`. */
export const abilityScoreCardScoreRowClasses =
  'grid grid-cols-[var(--control-action-compact-height)_minmax(0,4.5ch)_var(--control-action-compact-height)] items-center'

export const abilityScoreCardScoreCenterClasses =
  'w-full min-w-0 max-w-[4.5ch] overflow-hidden tabular-nums text-center'

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

export const abilityScoreCardFooterClasses = 'border-t border-border px-2 py-[2px]'

export const abilityScoreCardFooterActionLabelClasses = 'text-xs'

export const abilityScoreCardStepperStackClasses = 'flex w-full flex-col items-center gap-0.5'

export type AbilityScoreCardState = 'resting' | 'dragOver' | 'draggingFrom' | 'invalid'
