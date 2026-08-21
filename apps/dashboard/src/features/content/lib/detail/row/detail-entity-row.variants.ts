import { cva } from 'class-variance-authority'

import { cn, iconGhostControlVariants } from '@rpg/ui'

import {
  ENTITY_CONTENT_OFFSET_VAR,
  ENTITY_SURFACE_INLINE_END_VAR,
  ENTITY_SURFACE_INLINE_START_VAR,
} from '../../entity/item/entity-geometry.tokens'
import { entitySurfaceHorizontalInsetClasses } from '../../entity/surfaces/entity-surface-inset.variants'

export const detailEntityRowVariants = cva('min-w-0 py-1', {
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

export const detailEntityRowDisclosureItemVariants = cva('min-w-0')

export const detailEntityRowDisclosureRowVariants = cva('min-w-0 py-1', {
  variants: {
    inset: {
      self: entitySurfaceHorizontalInsetClasses,
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

export const detailEntityRowDisclosureContentVariants = cva('mb-2', {
  variants: {
    inset: {
      self: cn(
        `pl-[var(${ENTITY_SURFACE_INLINE_START_VAR})]`,
        `pr-[var(${ENTITY_SURFACE_INLINE_END_VAR})]`,
      ),
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

/** Indents preview rail by disclosure utility + content gap — rail-to-copy gap stays on the group. */
export const detailEntityRowDisclosurePreviewOffsetVariants = cva(
  `pl-[var(${ENTITY_CONTENT_OFFSET_VAR})]`,
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
