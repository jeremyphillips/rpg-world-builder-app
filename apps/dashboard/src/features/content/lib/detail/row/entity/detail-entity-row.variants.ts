import { cva } from 'class-variance-authority'

import { iconGhostControlVariants } from '@rpg/ui'

import {
  DASH_ENTITY_SURFACE_DISCLOSURE_CONTENT_CLASS,
  DASH_ENTITY_SURFACE_DISCLOSURE_PREVIEW_OFFSET_CLASS,
  DASH_ENTITY_SURFACE_INSET_HORIZONTAL_CLASS,
} from '../../../entity/surfaces/dash-entity-surface.variants'

export const detailEntityRowVariants = cva('min-w-0 py-1', {
  variants: {
    inset: {
      self: DASH_ENTITY_SURFACE_INSET_HORIZONTAL_CLASS,
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
      self: DASH_ENTITY_SURFACE_INSET_HORIZONTAL_CLASS,
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

export const detailEntityRowDisclosureButtonVariants = cva(
  iconGhostControlVariants({ hover: 'text', layout: 'flex' }),
)

/** Expanded preview — start follows the header edge; end always uses the base inset. */
export const detailEntityRowDisclosureContentVariants = cva('mb-2', {
  variants: {
    inset: {
      self: DASH_ENTITY_SURFACE_DISCLOSURE_CONTENT_CLASS,
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

/** Indents preview rail by disclosure utility + content gap — rail-to-copy gap stays on the group. */
export const detailEntityRowDisclosurePreviewOffsetVariants = cva(
  DASH_ENTITY_SURFACE_DISCLOSURE_PREVIEW_OFFSET_CLASS,
)

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
