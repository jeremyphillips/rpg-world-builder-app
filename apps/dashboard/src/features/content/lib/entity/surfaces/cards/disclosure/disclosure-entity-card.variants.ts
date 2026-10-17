import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import { DASH_ENTITY_CARD_BODY_CLASS } from '../../dash-entity-surface.variants'

/** Entity-card CLI host — chrome reset lives in `ui-collapsible-list-item--entity-card`. */
export const disclosureEntityCardListItemVariants = cva('')

/**
 * Full-bleed expanded body wash — divider/wash span shell edge.
 * Inline-start = surface start inset + content offset; inline-end = base surface inset
 * (never the header's utility edge).
 */
export const disclosureEntityCardBodyWashVariants = cva(
  cn(
    collapsibleListItemBodyFrameClasses,
    'bg-background',
    establishSurfaceCurrent('background'),
    DASH_ENTITY_CARD_BODY_CLASS,
  ),
)
