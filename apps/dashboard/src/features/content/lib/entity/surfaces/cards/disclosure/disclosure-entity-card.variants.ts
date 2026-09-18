import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import { ENTITY_SURFACE_INLINE_END_VAR } from '../../../anatomy/entity-geometry.tokens'

/** Body content start — value published on DEC article as {@link ENTITY_BODY_INLINE_START_VAR}. */
export const disclosureEntityCardBodyInlineStartClasses = 'pl-[var(--entity-body-inline-start)]'

/** Body content end: surface inline-end inset only — independent of trailing actions. */
export const disclosureEntityCardBodyInlineEndClasses = `pr-[var(${ENTITY_SURFACE_INLINE_END_VAR})]`

/** Strip CollapsibleListItem outer chrome — perimeter lives on EntityCardFrame. */
export const disclosureEntityCardListItemVariants = cva('border-0 rounded-none shadow-none')

/**
 * Full-bleed expanded body wash — divider/wash span shell edge.
 * Inline-start = surface start inset + content offset; inline-end = surface end inset only.
 */
export const disclosureEntityCardBodyWashVariants = cva(
  cn(
    collapsibleListItemBodyFrameClasses,
    'bg-background',
    establishSurfaceCurrent('background'),
    disclosureEntityCardBodyInlineStartClasses,
    disclosureEntityCardBodyInlineEndClasses,
  ),
)
