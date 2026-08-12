import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

import {
  entitySurfaceHorizontalInsetClasses,
  entitySurfaceInsetVariants,
  ENTITY_SURFACE_INLINE_END_VAR,
} from './entity-surface-inset.variants'

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

/** Header padding — horizontal inset from surface tokens; compact vertical rhythm. */
export const catalogEntityRowHeaderPaddingVariants = cva(
  cn('w-full min-w-0 py-2', entitySurfaceHorizontalInsetClasses),
)

/** Expanded body wash — entity-aware inline start/end; replaces CLI catalog bleed. */
export const catalogEntityRowBodyWashVariants = cva(
  cn(
    'border-t border-border-subtle bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
    catalogEntityRowBodyInlineStartClasses,
    catalogEntityRowBodyInlineEndClasses,
    'pb-3 pt-3',
  ),
)
