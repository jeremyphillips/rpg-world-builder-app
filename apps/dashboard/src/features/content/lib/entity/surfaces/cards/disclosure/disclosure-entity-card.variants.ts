import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import {
  entityBodyInlineEndClasses,
  entityBodyInlineStartClasses,
} from '../../entity-surface-inset.variants'

/** Strip CollapsibleListItem outer chrome — perimeter lives on EntityCardFrame. */
export const disclosureEntityCardListItemVariants = cva('border-0 rounded-none shadow-none')

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
    entityBodyInlineStartClasses,
    entityBodyInlineEndClasses,
  ),
)
