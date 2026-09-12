import { cva } from 'class-variance-authority'

import { cn, collapsibleListItemBodyFrameClasses, establishSurfaceCurrent } from '@rpg/ui'

import { ENTITY_SURFACE_INLINE_END_VAR } from '../../../anatomy/entity-geometry.tokens'
import {
  entitySurfaceHorizontalInsetClasses,
  entitySurfaceInsetVariants,
} from '../../entity-surface-inset.variants'

/** Body content start — value published on DEC article as {@link ENTITY_BODY_INLINE_START_VAR}. */
export const disclosureEntityCardBodyInlineStartClasses = 'pl-[var(--entity-body-inline-start)]'

/** Body content end: surface inline-end inset only — independent of trailing actions. */
export const disclosureEntityCardBodyInlineEndClasses = `pr-[var(${ENTITY_SURFACE_INLINE_END_VAR})]`

/** Bordered disclosure shell — subtle header plane; body wash uses canvas below. */
export const disclosureEntityCardShellVariants = cva(
  cn(
    'w-full min-w-0 overflow-hidden rounded-md border border-border bg-surface-subtle',
    establishSurfaceCurrent('surface-subtle'),
  ),
  {
    variants: {
      density: {
        compact: '',
        comfortable: '',
      },
      disabled: {
        true: 'opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
      disabled: false,
    },
  },
)

/** DEC article — shell chrome plus surface inset tokens (always leading: disclosure caret). */
export function disclosureEntityCardArticleVariants({
  density,
  disabled = false,
}: {
  density: 'compact' | 'comfortable'
  disabled?: boolean
}) {
  return cn(
    disclosureEntityCardShellVariants({ density, disabled }),
    entitySurfaceInsetVariants({ density, leading: true }),
  )
}

/** Strip CollapsibleListItem outer chrome — density tokens live on DEC article. */
export const disclosureEntityCardListItemVariants = cva('border-0 rounded-none shadow-none')

/** Surface-aware header inset — horizontal only; CLI owns vertical rhythm. */
export const disclosureEntityCardHeaderPaddingVariants = cva(
  cn('w-full min-w-0', entitySurfaceHorizontalInsetClasses),
)

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
