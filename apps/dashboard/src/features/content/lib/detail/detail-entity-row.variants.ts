import { cva } from 'class-variance-authority'

import { cn } from '@rpg/ui'

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

export const detailEntityRowContentVariants = cva('min-w-0 flex-1')

export const detailEntityRowSubheadingVariants = cva('text-xs text-muted-foreground')

/** Mirrors collapsible-list-item leading chrome: one caret column + gap before content. */
export const DETAIL_ENTITY_ROW_DISCLOSURE_CHROME_STYLE = {
  '--leading-chrome-size': 'calc(var(--spacing)*6)',
  '--leading-chrome-gap': 'calc(var(--spacing)*1)',
  '--content-column-indent': 'calc(var(--leading-chrome-size) + var(--leading-chrome-gap))',
} as const

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

export const detailEntityRowDisclosureButtonColumnVariants = cva(
  'flex w-[var(--leading-chrome-size)] shrink-0 items-center justify-center',
)

export const detailEntityRowDisclosureIdentityVariants = cva(
  'flex min-w-0 flex-1 items-center gap-[var(--leading-chrome-gap)]',
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
