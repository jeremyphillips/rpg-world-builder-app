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

export function radioCardLeadingControlTitleLineClassName({
  density,
  titleEnd,
}: {
  density: 'comfortable' | 'compact'
  titleEnd: boolean
}): string {
  return cn(
    'ui-radio-card__leading-title-line',
    titleEnd && 'ui-radio-card__leading-title-line--title-end',
    !titleEnd &&
      (density === 'compact'
        ? 'ui-radio-card__leading-title-line--compact'
        : 'ui-radio-card__leading-title-line--comfortable'),
  )
}

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
