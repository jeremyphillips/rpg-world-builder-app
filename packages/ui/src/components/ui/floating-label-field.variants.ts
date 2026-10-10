import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSizeTypographyClasses } from './field-sizing.variants'

/**
 * Geometry and state for {@link FloatingLabelField}.
 * Resting size from `fieldSizeTypographyClasses`; floated size from
 * `--field-floating-label-sm` / `--field-floating-label-md` in globals.css.
 *
 * Class names are written out in full so Tailwind emits them.
 */

const floatingLabelMotionVars =
  '[--floating-label-move:150ms] [--floating-label-placeholder-fade:100ms] [--floating-label-mask-pad:0.25rem]'

/** Placeholder stays hidden until the label has left the resting position. */
const floatingLabelPlaceholderSequencing = cn(
  '[&_input]:placeholder:opacity-0',
  '[&_input]:placeholder:transition-opacity',
  '[&_input]:placeholder:duration-[var(--floating-label-placeholder-fade)]',
  '[&_input]:placeholder:ease-out',
  'focus-within:data-[populated=false]:[&_input]:placeholder:opacity-100',
  'focus-within:data-[populated=false]:[&_input]:placeholder:delay-[var(--floating-label-move)]',
  'has-[[aria-expanded=true]]:data-[populated=false]:[&_input]:placeholder:opacity-100',
  'has-[[aria-expanded=true]]:data-[populated=false]:[&_input]:placeholder:delay-[var(--floating-label-move)]',
  '[&_[data-placeholder]]:opacity-0',
  '[&_[data-placeholder]]:transition-opacity',
  '[&_[data-placeholder]]:duration-[var(--floating-label-placeholder-fade)]',
  '[&_[data-placeholder]]:ease-out',
  'focus-within:data-[populated=false]:[&_[data-placeholder]]:opacity-100',
  'focus-within:data-[populated=false]:[&_[data-placeholder]]:delay-[var(--floating-label-move)]',
  'has-[[aria-expanded=true]]:data-[populated=false]:[&_[data-placeholder]]:opacity-100',
  'has-[[aria-expanded=true]]:data-[populated=false]:[&_[data-placeholder]]:delay-[var(--floating-label-move)]',
  'motion-reduce:[&_input]:placeholder:!delay-0',
  'motion-reduce:[&_input]:placeholder:!duration-0',
  'motion-reduce:[&_[data-placeholder]]:!delay-0',
  'motion-reduce:[&_[data-placeholder]]:!duration-0',
)

const floatingLabelLayerFloatedEnd = cn(
  'group-focus-within/float:end-2.5',
  'group-data-[populated=true]/float:end-2.5',
  'group-has-[[aria-expanded=true]]/float:end-2.5',
  'group-has-[:autofill]/float:end-2.5',
  'group-has-[:-webkit-autofill]/float:end-2.5',
)

const floatingLabelLayerFloatedEndMd = cn(
  'group-focus-within/float:end-3',
  'group-data-[populated=true]/float:end-3',
  'group-has-[[aria-expanded=true]]/float:end-3',
  'group-has-[:autofill]/float:end-3',
  'group-has-[:-webkit-autofill]/float:end-3',
)

const floatingLabelFloatedFontSizeSm = cn(
  'group-focus-within/float:text-[length:var(--field-floating-label-sm)]',
  'group-data-[populated=true]/float:text-[length:var(--field-floating-label-sm)]',
  'group-has-[[aria-expanded=true]]/float:text-[length:var(--field-floating-label-sm)]',
  'group-has-[:autofill]/float:text-[length:var(--field-floating-label-sm)]',
  'group-has-[:-webkit-autofill]/float:text-[length:var(--field-floating-label-sm)]',
)

const floatingLabelFloatedFontSizeMd = cn(
  'group-focus-within/float:text-[length:var(--field-floating-label-md)]',
  'group-data-[populated=true]/float:text-[length:var(--field-floating-label-md)]',
  'group-has-[[aria-expanded=true]]/float:text-[length:var(--field-floating-label-md)]',
  'group-has-[:autofill]/float:text-[length:var(--field-floating-label-md)]',
  'group-has-[:-webkit-autofill]/float:text-[length:var(--field-floating-label-md)]',
)

export const floatingLabelShellVariants = cva(
  cn(
    'group/float relative min-w-0 overflow-visible [&>button]:align-top [&>input]:align-top',
    floatingLabelMotionVars,
    floatingLabelPlaceholderSequencing,
  ),
  {
    variants: {
      size: {
        sm: '[--floating-label-control-h:calc(var(--spacing)*8)]',
        md: '[--floating-label-control-h:calc(var(--spacing)*9)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/**
 * Centres the label in the control and stops it before the caret column (`w-8`).
 * `top-0` keeps the floated half outside the shell so the control aligns with
 * neighboring inline controls. Start inset matches the value padding.
 */
export const floatingLabelLayerVariants = cva(
  'pointer-events-none absolute top-0 z-10 flex h-[var(--floating-label-control-h)] items-center overflow-visible',
  {
    variants: {
      size: {
        sm: cn('start-2.5 end-8', floatingLabelLayerFloatedEnd),
        md: cn('start-3 end-8', floatingLabelLayerFloatedEndMd),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const floatingLabelFloatedMotion = cn(
  'group-focus-within/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-focus-within/float:text-muted-foreground',
  'group-focus-within/float:delay-0',
  'group-focus-within/float:before:opacity-100',
  'group-focus-within/float:before:delay-0',
  'group-data-[populated=true]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-data-[populated=true]/float:text-muted-foreground',
  'group-data-[populated=true]/float:delay-0',
  'group-data-[populated=true]/float:before:opacity-100',
  'group-data-[populated=true]/float:before:delay-0',
  'group-has-[[aria-expanded=true]]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-has-[[aria-expanded=true]]/float:text-muted-foreground',
  'group-has-[[aria-expanded=true]]/float:delay-0',
  'group-has-[[aria-expanded=true]]/float:before:opacity-100',
  'group-has-[[aria-expanded=true]]/float:before:delay-0',
  'group-has-[:autofill]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-has-[:autofill]/float:text-muted-foreground',
  'group-has-[:autofill]/float:delay-0',
  'group-has-[:autofill]/float:before:opacity-100',
  'group-has-[:autofill]/float:before:delay-0',
  'group-has-[:-webkit-autofill]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-has-[:-webkit-autofill]/float:text-muted-foreground',
  'group-has-[:-webkit-autofill]/float:delay-0',
  'group-has-[:-webkit-autofill]/float:before:opacity-100',
  'group-has-[:-webkit-autofill]/float:before:delay-0',
)

export const floatingLabelTextVariants = cva(
  cn(
    'pointer-events-none relative block w-fit max-w-full min-w-0 font-normal',
    'origin-left rtl:origin-right',
    'text-input-placeholder',
    'transition-[translate,font-size,color] duration-[var(--floating-label-move)] ease-out delay-[var(--floating-label-placeholder-fade)]',
    "before:absolute before:-inset-y-px before:-inset-x-[var(--floating-label-mask-pad)] before:-z-10 before:rounded-sm before:opacity-0 before:transition-opacity before:duration-[var(--floating-label-move)] before:ease-out before:delay-[var(--floating-label-placeholder-fade)] before:content-['']",
    'before:bg-[var(--surface-current)]',
    'before:[mask-image:linear-gradient(to_bottom,black_50%,transparent)]',
    'before:[-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent)]',
    'motion-reduce:!duration-0 motion-reduce:!delay-0 motion-reduce:before:!duration-0 motion-reduce:before:!delay-0',
    'forced-colors:before:bg-none',
    'group-focus-within/float:forced-colors:bg-[Canvas] group-focus-within/float:forced-colors:text-[CanvasText]',
    'group-data-[populated=true]/float:forced-colors:bg-[Canvas] group-data-[populated=true]/float:forced-colors:text-[CanvasText]',
    'group-has-[[aria-expanded=true]]/float:forced-colors:bg-[Canvas]',
    'group-has-[:autofill]/float:forced-colors:bg-[Canvas]',
    'group-has-[:-webkit-autofill]/float:forced-colors:bg-[Canvas]',
    floatingLabelFloatedMotion,
    'group-has-[[aria-invalid=true]]/float:text-destructive',
    'group-has-[:disabled]/float:text-input-disabled',
  ),
  {
    variants: {
      size: {
        sm: cn(fieldSizeTypographyClasses.sm, floatingLabelFloatedFontSizeSm),
        md: cn(fieldSizeTypographyClasses.md, floatingLabelFloatedFontSizeMd),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const floatingLabelTextClipFloated = cn(
  'group-focus-within/float:max-w-none group-focus-within/float:overflow-visible group-focus-within/float:text-clip',
  'group-data-[populated=true]/float:max-w-none group-data-[populated=true]/float:overflow-visible group-data-[populated=true]/float:text-clip',
  'group-has-[[aria-expanded=true]]/float:max-w-none group-has-[[aria-expanded=true]]/float:overflow-visible group-has-[[aria-expanded=true]]/float:text-clip',
  'group-has-[:autofill]/float:max-w-none group-has-[:autofill]/float:overflow-visible group-has-[:autofill]/float:text-clip',
  'group-has-[:-webkit-autofill]/float:max-w-none group-has-[:-webkit-autofill]/float:overflow-visible group-has-[:-webkit-autofill]/float:text-clip',
)

/**
 * Resting label may ellipsize before the caret. Floated label uses full control
 * width (capped fields still ellipsize via `max-w-full` on the ancestor).
 */
export const floatingLabelTextClipClass = cn(
  'block min-w-0 max-w-full overflow-x-clip text-ellipsis whitespace-nowrap',
  floatingLabelTextClipFloated,
)

export type FloatingLabelFieldSize = NonNullable<
  VariantProps<typeof floatingLabelShellVariants>['size']
>
