import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Bordered disclosure shell — shares entity card chrome; internal list item is borderless. */
export const disclosureEntityCardShellVariants = cva(
  'w-full min-w-0 overflow-hidden rounded-md border border-border',
  {
    variants: {
      disabled: {
        true: 'opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

/** Strip CollapsibleListItem outer chrome — EntityCard-style shell owns border/radius. */
export const disclosureEntityCardListItemClasses = cn(
  'border-0 rounded-none shadow-none',
  '[--entity-content-indent:var(--content-column-indent)]',
)

/** Density-aware header inset inside the borderless collapsible shell. */
export const disclosureEntityCardHeaderPaddingVariants = cva('min-w-0', {
  variants: {
    density: {
      compact: 'px-3 py-2',
      comfortable: 'px-5 py-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/** Full-bleed expanded body wash — divider spans shell edge; alignment uses entity content indent. */
export const disclosureEntityCardBodyWashVariants = cva(
  cn(
    'border-t border-border-subtle bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
    'pl-[var(--entity-content-indent)]',
  ),
  {
    variants: {
      density: {
        compact: 'pb-3 pt-3',
        comfortable: 'pb-3 pt-3',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)
