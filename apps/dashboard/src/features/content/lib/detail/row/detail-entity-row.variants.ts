import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemChromeColumnClasses } from '@rpg/ui'

export const detailEntityRowVariants = cva('flex items-center justify-between gap-4 py-1', {
  variants: {
    inset: {
      self: 'px-4',
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

export const detailEntityRowSubheadingVariants = cva('text-xs text-muted-foreground')

/** One caret column — shared column class from `@rpg/ui` collapsible leading chrome. */
export const detailEntityRowDisclosureButtonColumnClasses = collapsibleListItemChromeColumnClasses

export const detailEntityRowDisclosureItemVariants = cva('min-w-0')

export const detailEntityRowDisclosureRowVariants = cva(
  'flex items-center justify-between gap-4 py-1',
  {
    variants: {
      inset: {
        self: 'px-4',
        parent: '',
      },
    },
    defaultVariants: {
      inset: 'self',
    },
  },
)

export const detailEntityRowDisclosureButtonVariants = cva(
  cn(
    'flex shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'size-control-action-compact [&_svg]:size-icon-glyph-md',
  ),
)

export const detailEntityRowDisclosureContentVariants = cva('pl-[var(--content-column-indent)]')

/** Left rail wrapping disclosure preview child rows. */
export const detailEntityRowDisclosurePreviewGroupVariants = cva(
  'border-l border-border-subtle pl-3',
)

export type DetailEntityRowDisclosurePreviewRowEdge = 'first' | 'middle' | 'last' | 'only'

export function resolveDetailEntityRowDisclosurePreviewRowEdge(
  index: number,
  total: number,
): DetailEntityRowDisclosurePreviewRowEdge {
  if (total <= 1) return 'only'
  if (index === 0) return 'first'
  if (index === total - 1) return 'last'
  return 'middle'
}

export const detailEntityRowDisclosurePreviewRowVariants = cva('py-1', {
  variants: {
    edge: {
      first: 'pt-0',
      middle: '',
      last: 'pb-0',
      only: 'py-0',
    },
  },
  defaultVariants: {
    edge: 'middle',
  },
})
