import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import { ENTITY_SURFACE_INLINE_END_VAR } from '../../anatomy/entity-geometry.tokens'

const catalogEntityRowBodyInlineStartClasses = 'pl-[var(--entity-body-inline-start)]'
const catalogEntityRowBodyInlineEndClasses = `pr-[var(${ENTITY_SURFACE_INLINE_END_VAR})]`

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
