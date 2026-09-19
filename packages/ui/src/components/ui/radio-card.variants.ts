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
  optionCardSelectedChromeClasses,
} from './selection-option-card.variants'

const radioCardCardBase = cn(
  `group relative flex w-full cursor-pointer flex-col ${cardRadiusClasses} ${cardBorderClasses} bg-surface-subtle text-left text-card-foreground ${fieldSurfaceRaisedShadowClasses} transition-colors hover:border-primary/50 hover:bg-control-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-card-selected-border data-[state=checked]:bg-surface-strong data-[state=checked]:[--surface-current:var(--surface-strong)] data-[state=checked]:ring-1 data-[state=checked]:ring-primary/20 aria-invalid:border-destructive`,
  establishSurfaceCurrent('surface-subtle'),
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

/** Outer shell when a details action sits beside the radio item (avoids nested interactives). */
export const radioCardShellVariants = cva(
  cn(
    `relative overflow-hidden ${cardRadiusClasses} ${cardBorderClasses} bg-surface-subtle text-left text-card-foreground ${fieldSurfaceRaisedShadowClasses} transition-colors has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background`,
    establishSurfaceCurrent('surface-subtle'),
  ),
  {
    variants: {
      density: {
        default: optionCardDensityBodyLayoutVariants({ density: 'default' }),
        compact: optionCardDensityBodyLayoutVariants({ density: 'compact' }),
      },
      selected: {
        true: optionCardSelectedChromeClasses,
        false: 'hover:border-primary/50 hover:bg-control-hover',
      },
    },
    defaultVariants: {
      density: 'default',
      selected: false,
    },
  },
)

/** Grid for radio + title row + right-aligned details link on one line. */
export const radioCardDetailsGridVariants = cva(
  'grid w-full grid-cols-[auto_1fr_auto] items-start',
  {
    variants: {
      density: {
        default: 'gap-x-3 gap-y-2',
        compact: 'gap-x-3 gap-y-1',
      },
    },
    defaultVariants: {
      density: 'default',
    },
  },
)

/** Radix item wrapper — children participate in the parent details grid. */
export const radioCardItemWithDetailsVariants = cva(
  'contents cursor-pointer border-0 bg-transparent p-0 text-left text-inherit shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-50',
)

/** Transparent radio row inside an outer shell (embedded/footer slots below). */
export const radioCardShellItemVariants = cva(
  'flex w-full cursor-pointer border-0 bg-transparent p-0 text-left text-inherit shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-50',
)

/** Right-aligned details action aligned with the title row. */
export const radioCardDetailsInlineSlotVariants = cva(
  'col-start-3 row-start-1 shrink-0 self-center',
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

export const radioCardDetailsActionVariants = cva('shrink-0 text-muted-foreground')

/** Vertical gap between sibling radio options in a group. */
export const radioCardGroupGapVariants = cva('grid w-full min-w-0', {
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
      two: 'grid-cols-1 sm:grid-cols-2',
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
