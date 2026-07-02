import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

export type ArrayItemIssueProminence = 'action' | 'structural' | 'nav' | 'aggregate'

export const arrayItemIssueBadgeClasses = cva(
  cn(
    'inline-flex h-6 shrink-0 items-center gap-1 rounded-sm px-1.5',
    'text-xs font-medium leading-none',
    'hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ),
  {
    variants: {
      compact: {
        true: 'mt-0',
        false: '',
      },
      prominence: {
        action: 'text-destructive',
        structural: 'text-destructive',
        nav: 'text-destructive-muted',
        aggregate: 'text-destructive-subtle',
      },
    },
    defaultVariants: {
      compact: false,
      prominence: 'nav',
    },
  },
)

export const arrayItemIssueSummaryClasses = cva(
  cn(
    'flex min-w-0 items-center gap-1 text-xs leading-snug',
    '[&_button]:rounded-sm [&_button]:font-medium [&_button]:underline-offset-2',
    '[&_button]:hover:underline [&_button]:focus-visible:outline-none',
    '[&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-ring',
  ),
  {
    variants: {
      placement: {
        collapsed: 'pb-1 text-destructive',
        expanded: 'mb-3 text-destructive',
        compactSummary: 'pb-1 text-destructive font-normal',
      },
    },
    defaultVariants: {
      placement: 'collapsed',
    },
  },
)

export const arrayLegendIssueLinkClasses = cva(
  cn(
    'ml-2 inline-flex items-center gap-1 rounded-sm align-baseline',
    'text-xs font-medium underline-offset-2 hover:underline',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ),
  {
    variants: {
      prominence: {
        nav: 'text-destructive-muted',
        aggregate: 'text-destructive-subtle',
      },
    },
    defaultVariants: {
      prominence: 'nav',
    },
  },
)
