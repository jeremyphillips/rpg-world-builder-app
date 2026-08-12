import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

import {
  entitySurfaceHorizontalInsetClasses,
  entitySurfaceInsetVariants,
  ENTITY_SURFACE_INLINE_END_VAR,
} from './entity-surface-inset.variants'

const catalogEntityDisclosureRowBodyInlineStartClasses = 'pl-[var(--entity-body-inline-start)]'
const catalogEntityDisclosureRowBodyInlineEndClasses = `pr-[var(${ENTITY_SURFACE_INLINE_END_VAR})]`

/** Catalog entity-disclosure row surface — inset tokens + content offset published here. */
export const catalogEntityDisclosureRowSurfaceVariants = cva(
  cn('w-full min-w-0', entitySurfaceInsetVariants({ density: 'compact', leading: true })),
)

/** Header padding — surface horizontal inset; vertical rhythm for compact picker rows. */
export const catalogEntityDisclosureRowHeaderPaddingVariants = cva(
  cn('w-full min-w-0 py-2', entitySurfaceHorizontalInsetClasses),
)

/** Expanded body wash — entity-aware inline start/end; replaces CLI catalog bleed. */
export const catalogEntityDisclosureRowBodyWashVariants = cva(
  cn(
    'border-t border-border-subtle bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
    catalogEntityDisclosureRowBodyInlineStartClasses,
    catalogEntityDisclosureRowBodyInlineEndClasses,
    'pb-3 pt-3',
  ),
)
