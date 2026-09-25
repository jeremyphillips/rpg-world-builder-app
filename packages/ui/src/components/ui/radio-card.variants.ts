import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { interactiveRowVariants } from './interactive-row.variants'
import { cardBorderClasses, cardRadiusClasses } from './card.variants'
import {
  choiceControlIndicatorGroupCheckedBorderClasses,
  choiceControlIndicatorShellClasses,
} from './choice-control-chrome.variants'
import { fieldSurfaceRaisedShadowClasses } from './field-surface.variants'
import { establishSurfaceCurrent } from './surface-current.lib'
import {
  optionCardDensityBodyLayoutVariants,
  optionCardDensityContentGapVariants,
  optionCardSummaryBadgeRowVariants,
} from './selection-option-card.variants'

const radioCardCardBase = cn(
  `group relative flex h-full w-full cursor-pointer flex-col ${cardRadiusClasses} ${cardBorderClasses} bg-background text-left text-card-foreground ${fieldSurfaceRaisedShadowClasses} transition-colors hover:border-primary hover:bg-surface-subtle hover:[--surface-current:var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-surface-strong data-[state=checked]:[--surface-current:var(--surface-strong)] data-[state=checked]:ring-1 data-[state=checked]:ring-primary/20 aria-invalid:border-destructive`,
  establishSurfaceCurrent('background'),
)

const radioCardRowBase = cn(
  'group relative flex w-full cursor-pointer flex-col rounded-md border-0 bg-transparent text-left text-card-foreground',
  interactiveRowVariants({
    interaction: 'hoverable',
    hoverFamily: 'selectable',
    selectedData: 'checked',
  }),
  interactiveFocusVariants({ context: 'standalone' }),
  'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border aria-invalid:border-destructive',
)

export type RadioCardVariant = 'card' | 'row'

export type RadioCardVisualControl = 'radio' | 'icon'

/** Card-style radio option: selected, hover, and focus states use design tokens only. */
export const radioCardVariants = cva('', {
  variants: {
    variant: {
      card: radioCardCardBase,
      row: radioCardRowBase,
    },
    density: {
      default: '',
      compact: '',
    },
  },
  compoundVariants: [
    {
      variant: 'card',
      density: 'default',
      class: cn(
        optionCardDensityContentGapVariants({ density: 'default' }),
        optionCardDensityBodyLayoutVariants({ density: 'default' }),
      ),
    },
    {
      variant: 'card',
      density: 'compact',
      class: cn(
        optionCardDensityContentGapVariants({ density: 'compact' }),
        optionCardDensityBodyLayoutVariants({ density: 'compact' }),
      ),
    },
    { variant: 'row', density: 'default', class: 'gap-1 px-0 py-2' },
    { variant: 'row', density: 'compact', class: 'gap-0.5 px-0 py-2' },
  ],
  defaultVariants: {
    variant: 'card',
    density: 'default',
  },
})

/** Selected/hover chrome for radio card shells (distinct from static selection cards). */
export const radioCardShellSelectedChromeClasses =
  'border-primary bg-surface-strong ring-1 ring-primary/20 [--surface-current:var(--surface-strong)]'

/** Outer shell when a details action sits beside the radio item (avoids nested interactives). */
export const radioCardShellVariants = cva(
  cn(
    `relative flex h-full flex-col overflow-hidden ${cardRadiusClasses} ${cardBorderClasses} bg-background text-left text-card-foreground ${fieldSurfaceRaisedShadowClasses} transition-colors has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background`,
    establishSurfaceCurrent('background'),
  ),
  {
    variants: {
      hasMedia: {
        true: 'p-0',
        false: '',
      },
      selected: {
        true: radioCardShellSelectedChromeClasses,
        false:
          'hover:border-primary hover:bg-surface-subtle hover:[--surface-current:var(--surface-subtle)]',
      },
    },
    defaultVariants: {
      hasMedia: false,
      selected: false,
    },
  },
)

/** Body region below a full-bleed media slot. */
export const radioCardShellBodyVariants = cva('flex min-h-0 flex-1 flex-col', {
  variants: {
    density: {
      default: optionCardDensityBodyLayoutVariants({ density: 'default' }),
      compact: optionCardDensityBodyLayoutVariants({ density: 'compact' }),
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Full-bleed top image slot for card-variant radio options. */
export const radioCardMediaSlotVariants = cva('shrink-0 overflow-hidden')

/** Transparent radio row inside an outer shell (embedded/footer slots below). */
export const radioCardShellItemVariants = cva(
  'flex w-full cursor-pointer border-0 bg-transparent p-0 text-left text-inherit shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-50',
)

/** Centers the leading radio with the option title line when a title-end action is present. */
export const radioCardLeadingControlTitleLineVariants = cva(
  'flex shrink-0 items-center self-start',
  {
    variants: {
      density: {
        default: 'h-5',
        compact: 'h-5',
      },
    },
    defaultVariants: {
      density: 'default',
    },
  },
)

/** Decorative radio circle shown inside the card, synced to the parent item state. */
export const radioCardControlVariants = cva(
  `${choiceControlIndicatorShellClasses} ${choiceControlIndicatorGroupCheckedBorderClasses} flex aspect-square shrink-0 items-center justify-center rounded-full text-primary`,
  {
    variants: {
      variant: {
        card: 'size-5',
        row: 'size-4',
      },
      density: {
        default: '',
        compact: '',
      },
    },
    compoundVariants: [{ variant: 'card', density: 'compact', class: 'size-4' }],
    defaultVariants: {
      variant: 'card',
      density: 'default',
    },
  },
)

export const radioCardIndicatorVariants = cva(
  'opacity-0 transition-opacity group-data-[state=checked]:opacity-100',
)

/** Leading icon column when visualControl="icon" — muted by default, primary when selected. */
export const radioCardIconControlVariants = cva(
  'flex shrink-0 items-center justify-center text-muted-foreground transition-colors group-data-[state=checked]:text-primary',
  {
    variants: {
      density: {
        default: 'size-5 [&_svg]:size-5',
        compact: 'size-4 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      density: 'default',
    },
  },
)

export const radioCardDetailsActionVariants = cva('shrink-0 [&_svg]:size-4')

/** Reserved third-row height for spellcasting badges in equal-height card grids. */
export const radioCardSummaryBadgeRowVariants = optionCardSummaryBadgeRowVariants

/** Vertical gap between sibling radio options in a group. */
export const radioCardGroupGapVariants = cva('@container grid w-full min-w-0 items-stretch', {
  variants: {
    variant: {
      card: '',
      row: 'gap-1',
    },
    density: {
      default: '',
      compact: '',
    },
    columns: {
      one: 'grid-cols-1',
      two: 'grid-cols-1 @min-[32rem]:grid-cols-2',
      three: 'grid-cols-1 @min-[32rem]:grid-cols-2 @min-[48rem]:grid-cols-3',
    },
  },
  compoundVariants: [
    { variant: 'card', density: 'default', class: 'gap-3' },
    { variant: 'card', density: 'compact', class: 'gap-2' },
  ],
  defaultVariants: {
    variant: 'card',
    density: 'default',
    columns: 'one',
  },
})
