import { cva } from 'class-variance-authority'

export const detailEntityRowVariants = cva('min-w-0 py-1', {
  variants: {
    inset: {
      self: 'dash-entity-surface__inset-horizontal',
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

export const detailEntityRowSubheadingVariants = cva('text-style-caption')

export const detailEntityRowDisclosureItemVariants = cva('min-w-0')

export const detailEntityRowDisclosureRowVariants = cva('min-w-0 py-1', {
  variants: {
    inset: {
      self: 'dash-entity-surface__inset-horizontal',
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

export const detailEntityRowDisclosureButtonVariants =
  'inline-flex shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground cursor-pointer ui-compact-control ui-compact-control--icon-compact ui-focus-ring ui-focus-ring--embedded hover:text-foreground flex'

/** Expanded preview — start follows the header edge; end always uses the base inset. */
export const detailEntityRowDisclosureContentVariants = cva('mb-2', {
  variants: {
    inset: {
      self: 'dash-entity-surface__disclosure-content',
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

/** Left rail wrapping disclosure preview child rows. */
export const detailEntityRowDisclosurePreviewGroupVariants = 'border-l border-border-subtle pl-3'

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
