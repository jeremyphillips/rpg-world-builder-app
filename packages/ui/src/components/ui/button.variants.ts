import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  CONTROL_ACTION_GAP_CLASSES,
  controlActionCompactIconClasses,
  controlActionDefaultIconClasses,
  controlActionLgIconClasses,
  controlActionCompactTextWithIconClasses,
  controlActionXsCompactTextOnlyClasses,
  controlActionXsCompactTextWithIconClasses,
  controlActionXsIconClasses,
  controlActionXsTextClasses,
} from './control-action.variants'
import { fieldGroupedSegmentEndClasses } from './field-input-chrome.variants'
import { fieldGroupedControlActionPaddingClasses } from './field-sizing.variants'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'
import {
  ghostControlExpandedClasses,
  ghostControlVisualStateClasses,
} from './ghost-control.variants'
import {
  outlineControlExpandedClasses,
  outlineControlShellClasses,
} from './outline-control.variants'

const chromeButtonVariants: Array<
  'default' | 'destructive' | 'warning' | 'outline' | 'secondary' | 'ghost'
> = ['default', 'destructive', 'warning', 'outline', 'secondary', 'ghost']

const textButtonTransparentClasses = 'bg-transparent hover:bg-transparent active:bg-transparent'

/** Default labeled-button icon scale — applied per size recipe, not on the CVA base (xs/sm/md tiers override). */
const defaultLabeledButtonIconGlyphClasses = iconGlyphDescendantClasses.lg

/**
 * Button class variants. Kept in a non-client module so server components (e.g.
 * styling a Next.js `<Link>`) can call `buttonVariants()` without pulling in the
 * client boundary of `button.tsx`.
 */
export const buttonVariants = cva(
  // `cursor-pointer` is explicit because Tailwind v4 preflight resets buttons to `cursor: default`.
  cn(
    'inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-body-emphasis transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    interactiveFocusVariants({ context: 'standalone' }),
  ),
  {
    variants: {
      variant: {
        default:
          'bg-action-primary text-action-primary-foreground shadow-sm hover:bg-action-primary/90 active:bg-action-primary/80',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80',
        warning:
          'bg-semantic-warning-strong text-semantic-warning-strong-foreground shadow-sm hover:bg-semantic-warning-strong/90 active:bg-semantic-warning-strong/80',
        attached:
          'border-0 bg-transparent shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        outline: `${outlineControlShellClasses} ${outlineControlExpandedClasses}`,
        secondary:
          'bg-action-secondary text-action-secondary-foreground shadow-sm hover:bg-action-secondary/80 active:bg-action-secondary/60',
        ghost: `${ghostControlVisualStateClasses} ${ghostControlExpandedClasses}`,
        text: textButtonTransparentClasses,
      },
      size: {
        default: '',
        xs: '',
        sm: 'text-xs',
        lg: '',
        icon: '',
        'icon-xs': '',
        'icon-lg': '',
      },
      density: {
        default: '',
        compact: '',
      },
    },
    compoundVariants: [
      {
        variant: chromeButtonVariants,
        size: 'default',
        density: 'default',
        class: cn(
          'h-9 px-4 py-2',
          CONTROL_ACTION_GAP_CLASSES.md,
          defaultLabeledButtonIconGlyphClasses,
        ),
      },
      {
        variant: chromeButtonVariants,
        size: 'xs',
        density: 'default',
        class: cn('rounded-md', controlActionXsTextClasses),
      },
      {
        variant: chromeButtonVariants,
        size: 'xs',
        density: 'compact',
        class: cn('rounded-md', controlActionXsCompactTextWithIconClasses),
      },
      {
        variant: chromeButtonVariants,
        size: 'sm',
        density: 'default',
        class: cn(
          'h-8 rounded-md px-3',
          CONTROL_ACTION_GAP_CLASSES.sm,
          iconGlyphDescendantClasses.sm,
        ),
      },
      {
        variant: chromeButtonVariants,
        size: 'lg',
        density: 'default',
        class: cn(
          'h-10 rounded-md px-6',
          CONTROL_ACTION_GAP_CLASSES.md,
          defaultLabeledButtonIconGlyphClasses,
        ),
      },
      { size: 'icon', density: 'default', class: controlActionDefaultIconClasses },
      { size: 'icon-xs', class: controlActionXsIconClasses },
      { size: 'icon-lg', class: controlActionLgIconClasses },
      {
        variant: chromeButtonVariants,
        size: 'default',
        density: 'compact',
        class: cn(
          'h-8 px-3 py-1',
          CONTROL_ACTION_GAP_CLASSES.sm,
          defaultLabeledButtonIconGlyphClasses,
        ),
      },
      {
        variant: chromeButtonVariants,
        size: 'sm',
        density: 'compact',
        class: cn(controlActionCompactTextWithIconClasses, 'px-2 py-0'),
      },
      {
        variant: chromeButtonVariants,
        size: 'lg',
        density: 'compact',
        class: cn(
          'h-9 px-5 py-1.5',
          CONTROL_ACTION_GAP_CLASSES.md,
          defaultLabeledButtonIconGlyphClasses,
        ),
      },
      {
        size: 'icon',
        density: 'compact',
        class: controlActionCompactIconClasses,
      },
      {
        variant: 'text',
        size: 'default',
        density: 'default',
        class: cn(
          'h-8 px-0 w-fit',
          CONTROL_ACTION_GAP_CLASSES.md,
          textButtonTransparentClasses,
          defaultLabeledButtonIconGlyphClasses,
        ),
      },
      {
        variant: 'text',
        size: 'default',
        density: 'compact',
        class: cn(
          'h-6 px-0 w-fit',
          CONTROL_ACTION_GAP_CLASSES.xs,
          textButtonTransparentClasses,
          iconGlyphDescendantClasses.sm,
        ),
      },
      {
        variant: 'text',
        size: 'sm',
        density: 'default',
        class: cn(
          'h-8 px-0 w-fit',
          CONTROL_ACTION_GAP_CLASSES.sm,
          textButtonTransparentClasses,
          iconGlyphDescendantClasses.sm,
        ),
      },
      {
        variant: 'text',
        size: 'sm',
        density: 'compact',
        class: cn(
          'h-6 px-0 w-fit',
          CONTROL_ACTION_GAP_CLASSES.xs,
          textButtonTransparentClasses,
          iconGlyphDescendantClasses.sm,
        ),
      },
      {
        variant: 'text',
        size: 'xs',
        density: 'default',
        class: cn(
          'h-8 px-0 w-fit text-sm',
          CONTROL_ACTION_GAP_CLASSES.sm,
          textButtonTransparentClasses,
          iconGlyphDescendantClasses.sm,
        ),
      },
      {
        variant: 'text',
        size: 'xs',
        density: 'compact',
        class: cn(
          'w-fit',
          controlActionXsCompactTextOnlyClasses,
          CONTROL_ACTION_GAP_CLASSES.xs,
          textButtonTransparentClasses,
          iconGlyphDescendantClasses.xs,
        ),
      },
      {
        variant: 'text',
        size: 'lg',
        density: 'default',
        class: cn(
          'h-8 px-0 w-fit',
          CONTROL_ACTION_GAP_CLASSES.md,
          textButtonTransparentClasses,
          defaultLabeledButtonIconGlyphClasses,
        ),
      },
      {
        variant: 'attached',
        size: 'sm',
        class: cn(
          'h-full min-h-0 w-full py-0',
          fieldGroupedControlActionPaddingClasses.sm,
          fieldGroupedSegmentEndClasses,
          CONTROL_ACTION_GAP_CLASSES.sm,
          iconGlyphDescendantClasses.sm,
        ),
      },
      {
        variant: 'attached',
        size: 'xs',
        class: cn(
          'h-full min-h-0 w-full py-0 text-xs',
          fieldGroupedControlActionPaddingClasses.sm,
          fieldGroupedSegmentEndClasses,
          CONTROL_ACTION_GAP_CLASSES.xs,
          iconGlyphDescendantClasses.xs,
        ),
      },
      {
        variant: 'attached',
        size: 'default',
        class: cn(
          'h-full min-h-0 w-full py-0',
          fieldGroupedControlActionPaddingClasses.md,
          fieldGroupedSegmentEndClasses,
          CONTROL_ACTION_GAP_CLASSES.md,
          defaultLabeledButtonIconGlyphClasses,
        ),
      },
      {
        variant: 'attached',
        size: 'lg',
        class: cn(
          'h-full min-h-0 w-full py-0',
          fieldGroupedControlActionPaddingClasses.lg,
          fieldGroupedSegmentEndClasses,
          CONTROL_ACTION_GAP_CLASSES.md,
          defaultLabeledButtonIconGlyphClasses,
        ),
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
