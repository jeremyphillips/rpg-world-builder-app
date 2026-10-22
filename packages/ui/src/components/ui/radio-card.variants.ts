import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { interactiveRowVariants } from './interactive-row.variants'
import {
  radioCardDecorativeControlClasses,
  resolveRadioCardIndicatorSize,
} from './choice-control.variants'
const radioCardRowBase = cn(
  'group relative flex w-full cursor-pointer flex-col rounded-md border-0 bg-transparent text-left text-card-foreground',
  interactiveRowVariants({
    interaction: 'hoverable',
    selectedData: 'checked',
  }),
  interactiveFocusVariants({ context: 'standalone' }),
  'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border aria-invalid:border-destructive',
)

export type RadioCardVariant = 'card' | 'row'

export type RadioCardVisualControl = 'radio' | 'icon'

export function radioCardGroupItemRowClasses({
  density,
}: {
  density: 'comfortable' | 'compact'
}): string {
  return cn(radioCardRowBase, density === 'comfortable' ? 'gap-1 px-0 py-2' : 'gap-0.5 px-0 py-2')
}

/** Card-style radio option density padding (applied inside ui-radio-card body). */
export const radioCardVariants = cva('', {
  variants: {
    variant: {
      card: '',
      row: radioCardRowBase,
    },
    density: {
      comfortable: '',
      compact: '',
    },
  },
  compoundVariants: [
    { variant: 'row', density: 'comfortable', class: 'gap-1 px-0 py-2' },
    { variant: 'row', density: 'compact', class: 'gap-0.5 px-0 py-2' },
  ],
  defaultVariants: {
    variant: 'card',
    density: 'comfortable',
  },
})

/** Card variant: vertically centers the leading control on the title line (text-base / text-sm). */
export const radioCardLeadingControlTitleLineVariants = cva(
  'flex shrink-0 items-center self-start',
  {
    variants: {
      density: {
        comfortable: '',
        compact: '',
      },
      titleEnd: {
        true: 'h-control-action-compact',
        false: '',
      },
    },
    compoundVariants: [
      { density: 'comfortable', titleEnd: false, class: 'h-6' },
      { density: 'compact', titleEnd: false, class: 'h-5' },
    ],
    defaultVariants: {
      density: 'comfortable',
      titleEnd: false,
    },
  },
)

/** Decorative radio circle shown inside the card, synced to the parent item state. */
export const radioCardControlVariants = cva('', {
  variants: {
    variant: {
      card: '',
      row: '',
    },
    density: {
      comfortable: '',
      compact: '',
    },
  },
  compoundVariants: [
    {
      variant: 'card',
      density: 'comfortable',
      class: radioCardDecorativeControlClasses({ indicatorSize: 'lg' }),
    },
    {
      variant: 'card',
      density: 'compact',
      class: radioCardDecorativeControlClasses({ indicatorSize: 'sm' }),
    },
    {
      variant: 'row',
      density: 'comfortable',
      class: radioCardDecorativeControlClasses({ indicatorSize: 'sm' }),
    },
    {
      variant: 'row',
      density: 'compact',
      class: radioCardDecorativeControlClasses({ indicatorSize: 'sm' }),
    },
  ],
  defaultVariants: {
    variant: 'card',
    density: 'comfortable',
  },
})

export { resolveRadioCardIndicatorSize }

export const radioCardIndicatorVariants = cva(
  'opacity-0 transition-opacity group-data-[state=checked]:opacity-100',
)

/** Leading icon column when visualControl="icon" — muted by default, primary when selected. */
export const radioCardIconControlVariants = cva(
  'flex shrink-0 items-center justify-center text-muted-foreground transition-colors group-data-[state=checked]:text-primary',
  {
    variants: {
      density: {
        comfortable: 'size-5 [&_svg]:size-5',
        compact: 'size-4 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

export const radioCardDetailsActionVariants = cva('shrink-0 [&_svg]:size-4')

export const radioCardMediaSlotClasses = 'shrink-0 overflow-hidden'

/** Vertical gap between sibling radio options in a group. */
export const radioCardGroupGapVariants = cva('@container grid w-full min-w-0 items-stretch', {
  variants: {
    variant: {
      card: '',
      row: 'gap-1',
    },
    density: {
      comfortable: '',
      compact: '',
    },
    columns: {
      one: 'grid-cols-1',
      two: 'grid-cols-1 @min-[32rem]:grid-cols-2',
      three: 'grid-cols-1 @min-[32rem]:grid-cols-2 @min-[48rem]:grid-cols-3',
    },
  },
  compoundVariants: [
    { variant: 'card', density: 'comfortable', class: 'gap-3' },
    { variant: 'card', density: 'compact', class: 'gap-2' },
  ],
  defaultVariants: {
    variant: 'card',
    density: 'comfortable',
  },
})
