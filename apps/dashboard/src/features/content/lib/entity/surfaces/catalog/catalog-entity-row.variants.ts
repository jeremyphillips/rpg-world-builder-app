import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import {
  entityBodyInlineEndClasses,
  entityBodyInlineStartClasses,
} from '../entity-surface-inset.variants'

/** Expanded body wash — entity-aware inline start/end; replaces CLI catalog bleed. */
export const catalogEntityRowBodyWashVariants = cva(
  cn(
    collapsibleListItemBodyFrameClasses,
    'bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
    entityBodyInlineStartClasses,
    entityBodyInlineEndClasses,
  ),
)
