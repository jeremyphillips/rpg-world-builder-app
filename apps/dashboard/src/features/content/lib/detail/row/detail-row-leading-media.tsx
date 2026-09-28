import type { ReactNode } from 'react'

import { cn, identityFrameVariants } from '@rpg/ui'
import type { IdentityFrameShape, IdentityFrameSize } from '@rpg/ui'

import { detailRowLeadingMediaChildSlotVariants } from './detail-row-leading-media.variants'

export type DetailRowLeadingMediaProps = {
  children: ReactNode
  /** Outer clip shape — same lane dimensions for box vs circle. */
  shape?: IdentityFrameShape
  /** Compact detail-row lane size — matches ContentMediaImage square / ContentCardMedia compact (`xs`). */
  size?: Extract<IdentityFrameSize, 'xs' | 'sm'>
}

/**
 * Single geometry owner for DetailEntityRow / RelationshipList leading media.
 * Children render content only; intrinsic media dimensions must not size the row.
 */
export function DetailRowLeadingMedia({
  children,
  shape = 'box',
  size = 'xs',
}: DetailRowLeadingMediaProps) {
  return (
    <div
      className={cn(identityFrameVariants({ shape, size }))}
      data-detail-row-leading-media=""
      data-size={size}
      data-shape={shape}
    >
      <div className={detailRowLeadingMediaChildSlotVariants()}>{children}</div>
    </div>
  )
}
