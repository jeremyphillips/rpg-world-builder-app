import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSizeTypographyClasses } from './field-sizing.variants'

/**
 * Geometry and state for {@link FloatingLabelField}.
 * Typography endpoints: resting size from `fieldSizeTypographyClasses`, floated
 * colour from the caption recipe. Font-size stays at the resting endpoint;
 * comfortable density reaches the caption size by scale.
 *
 * Class names are written out in full so Tailwind emits them.
 */

const floatingLabelMotionVars =
  '[--floating-label-move:150ms] [--floating-label-placeholder-fade:100ms] [--floating-label-mask-pad:0.25rem] [--floating-label-mask-fill:var(--field-control-bg)]'

const floatingLabelMaskStateVars = cn(
  'has-[:disabled]:[--floating-label-mask-fill:var(--field-control-bg-disabled)]',
  'has-[:read-only]:[--floating-label-mask-fill:var(--field-control-bg-readonly)]',
  'has-[[aria-invalid=true]]:[--floating-label-mask-fill:var(--field-control-bg-invalid)]',
)

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

export const floatingLabelShellVariants = cva(
  cn(
    'group/float relative min-w-0 [&>button]:align-top [&>input]:align-top',
    floatingLabelMotionVars,
    floatingLabelMaskStateVars,
    floatingLabelPlaceholderSequencing,
  ),
  {
    variants: {
      size: {
        sm: '[--floating-label-control-h:calc(var(--spacing)*8)] [--floating-label-scale:1]',
        md: '[--floating-label-control-h:calc(var(--spacing)*9)] [--floating-label-scale:var(--floating-label-scale-md)] supports-[scale:calc(1rem/1rem)]:[--floating-label-scale:calc(var(--text-sm)/var(--text-md))]',
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
  'pointer-events-none absolute top-0 z-10 flex h-[var(--floating-label-control-h)] items-center',
  {
    variants: {
      size: {
        sm: 'start-2.5 end-8',
        md: 'start-3 end-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const floatingLabelFloatedMotion = cn(
  'group-focus-within/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-focus-within/float:scale-[var(--floating-label-scale)]',
  'group-focus-within/float:text-muted-foreground',
  'group-focus-within/float:delay-0',
  'group-focus-within/float:before:opacity-100',
  'group-focus-within/float:before:delay-0',
  'group-data-[populated=true]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-data-[populated=true]/float:scale-[var(--floating-label-scale)]',
  'group-data-[populated=true]/float:text-muted-foreground',
  'group-data-[populated=true]/float:delay-0',
  'group-data-[populated=true]/float:before:opacity-100',
  'group-data-[populated=true]/float:before:delay-0',
  'group-has-[[aria-expanded=true]]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-has-[[aria-expanded=true]]/float:scale-[var(--floating-label-scale)]',
  'group-has-[[aria-expanded=true]]/float:text-muted-foreground',
  'group-has-[[aria-expanded=true]]/float:delay-0',
  'group-has-[[aria-expanded=true]]/float:before:opacity-100',
  'group-has-[[aria-expanded=true]]/float:before:delay-0',
  'group-has-[:autofill]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-has-[:autofill]/float:scale-[var(--floating-label-scale)]',
  'group-has-[:autofill]/float:text-muted-foreground',
  'group-has-[:autofill]/float:delay-0',
  'group-has-[:autofill]/float:before:opacity-100',
  'group-has-[:autofill]/float:before:delay-0',
  'group-has-[:-webkit-autofill]/float:-translate-y-[calc(var(--floating-label-control-h)/2)]',
  'group-has-[:-webkit-autofill]/float:scale-[var(--floating-label-scale)]',
  'group-has-[:-webkit-autofill]/float:text-muted-foreground',
  'group-has-[:-webkit-autofill]/float:delay-0',
  'group-has-[:-webkit-autofill]/float:before:opacity-100',
  'group-has-[:-webkit-autofill]/float:before:delay-0',
)

export const floatingLabelTextVariants = cva(
  cn(
    'pointer-events-none relative block w-fit max-w-full min-w-0 font-normal leading-none',
    'origin-left rtl:origin-right',
    // Tailwind translates and scales via the translate/scale properties, not transform.
    'text-input-placeholder',
    // Mask padding lives on ::before so it cannot ellipsize the label text.
    // The layer sits above the control so the mask fade stays visible.
    'transition-[translate,scale,color] duration-[var(--floating-label-move)] ease-out delay-[var(--floating-label-placeholder-fade)]',
    "before:absolute before:inset-y-0 before:-inset-x-[var(--floating-label-mask-pad)] before:-z-10 before:opacity-0 before:transition-opacity before:duration-[var(--floating-label-move)] before:ease-out before:delay-[var(--floating-label-placeholder-fade)] before:content-['']",
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
        sm: fieldSizeTypographyClasses.sm,
        md: fieldSizeTypographyClasses.md,
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/** Clips label text. The mask stays on the outer element so its padding cannot ellipsize the word. */
export const floatingLabelTextClipClass = 'block truncate'

export type FloatingLabelFieldSize = NonNullable<
  VariantProps<typeof floatingLabelShellVariants>['size']
>
