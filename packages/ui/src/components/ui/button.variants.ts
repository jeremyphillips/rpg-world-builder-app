import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  controlActionCompactIconClasses,
  controlActionCompactTextWithIconClasses,
} from './control-action.variants'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'
import {
  outlineControlExpandedClasses,
  outlineControlShellClasses,
} from './outline-control.variants'

/**
 * Button class variants. Kept in a non-client module so server components (e.g.
 * styling a Next.js `<Link>`) can call `buttonVariants()` without pulling in the
 * client boundary of `button.tsx`.
 */
export const buttonVariants = cva(
  // `cursor-pointer` is explicit because Tailwind v4 preflight resets buttons to `cursor: default`.
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-body-emphasis transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    iconGlyphDescendantClasses.lg,
  ),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80',
        outline: `${outlineControlShellClasses} ${outlineControlExpandedClasses}`,
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/60',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline',
        text: 'bg-transparent text-primary hover:bg-transparent hover:text-primary/90 active:bg-transparent active:text-primary/80',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'rounded-md px-3 text-xs',
        lg: 'rounded-md px-6',
        icon: '',
      },
      density: {
        default: '',
        compact: '',
      },
    },
    compoundVariants: [
      { size: 'default', density: 'default', class: 'h-9' },
      { size: 'sm', density: 'default', class: 'h-8' },
      { size: 'lg', density: 'default', class: 'h-10' },
      { size: 'icon', density: 'default', class: 'size-control-action-default' },
      { size: 'default', density: 'compact', class: 'h-8 px-3 py-1' },
      {
        size: 'sm',
        density: 'compact',
        class: cn(controlActionCompactTextWithIconClasses, 'px-2 py-0'),
      },
      { size: 'lg', density: 'compact', class: 'h-9 px-5 py-1.5' },
      {
        size: 'icon',
        density: 'compact',
        class: controlActionCompactIconClasses,
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      density: 'default',
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
