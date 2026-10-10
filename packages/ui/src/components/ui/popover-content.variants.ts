import { cn } from '../../lib/utils'

/** Radix open/close motion. Stays utilities; not part of the content chrome. */
export const popoverContentMotionClasses =
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

export const tooltipContentMotionClasses =
  'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

export type PopoverContentTone = 'menu' | 'popover' | 'tooltip' | 'filter'

/** Styling primitive for overlay content chrome. Hosts add motion utilities. */
export function popoverContentVariants({
  tone = 'popover',
}: { tone?: PopoverContentTone } = {}): string {
  return cn('ui-popover-content', `ui-popover-content--${tone}`, 'shadow-md')
}

export const menuItemClasses = 'ui-menu-item'

export const POPOVER_CONTENT_CLASS_SPECS = [
  {
    key: 'menu',
    className: popoverContentVariants({ tone: 'menu' }),
    keyValues: 'field-container, padding 4px',
    useCase: 'Dropdown menu',
  },
  {
    key: 'tooltip',
    className: popoverContentVariants({ tone: 'tooltip' }),
    keyValues: 'surface-lift, max-width 20rem',
    useCase: 'Tooltip',
  },
  {
    key: 'filter',
    className: popoverContentVariants({ tone: 'filter' }),
    keyValues: 'popover fill, padding 16px',
    useCase: 'Filter popover',
  },
] as const
