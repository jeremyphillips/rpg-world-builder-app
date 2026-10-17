import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import { DASH_ENTITY_CARD_BODY_CLASS } from '../dash-entity-surface.variants'

/** Expanded body wash — entity-aware inline start/end; replaces CLI catalog bleed. */
export const catalogEntityRowBodyWashVariants = cva(
  cn(
    collapsibleListItemBodyFrameClasses,
    'bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
    DASH_ENTITY_CARD_BODY_CLASS,
  ),
)
