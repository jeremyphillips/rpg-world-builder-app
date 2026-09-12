import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import { ENTITY_SURFACE_INLINE_END_VAR } from '../../anatomy/entity-geometry.tokens'
import {
  entitySurfaceHorizontalInsetClasses,
  entitySurfaceInsetVariants,
} from '../entity-surface-inset.variants'

const catalogEntityRowBodyInlineStartClasses = 'pl-[var(--entity-body-inline-start)]'
const catalogEntityRowBodyInlineEndClasses = `pr-[var(${ENTITY_SURFACE_INLINE_END_VAR})]`

/** Inset CSS variables only — border/background stay on the CLI catalog shell. */
export const catalogEntityRowInsetRootVariants = cva('w-full min-w-0', {
  variants: {
    leading: {
      true: entitySurfaceInsetVariants({ density: 'compact', leading: true }),
      false: entitySurfaceInsetVariants({ density: 'compact', leading: false }),
    },
  },
  defaultVariants: {
    leading: false,
  },
})

/** Header padding — horizontal inset from surface tokens only; CLI owns vertical rhythm. */
export const catalogEntityRowHeaderPaddingVariants = cva(
  cn('w-full min-w-0', entitySurfaceHorizontalInsetClasses),
)

/** Expanded body wash — entity-aware inline start/end; replaces CLI catalog bleed. */
export const catalogEntityRowBodyWashVariants = cva(
  cn(
    collapsibleListItemBodyFrameClasses,
    'bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
    catalogEntityRowBodyInlineStartClasses,
    catalogEntityRowBodyInlineEndClasses,
  ),
)
