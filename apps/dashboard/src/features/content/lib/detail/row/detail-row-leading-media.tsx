import type { ReactNode } from 'react'

import { cn, identityFrameVariants } from '@rpg/ui'
import type { IdentityFrameShape, IdentityFrameSize } from '@rpg/ui'

export type DetailRowLeadingMediaProps = {
  children: ReactNode
  /** Outer clip shape — same lane dimensions for box vs circle. */
  shape?: IdentityFrameShape
  /**
   * Fixed IdentityFrame geometry — non-anatomy exceptions only.
   * Standard row anatomy uses density-owned `--ui-anatomy-leading-size` instead.
   */
  size?: Extract<IdentityFrameSize, 'xs' | 'sm'>
}

/**
 * Single geometry owner for detail-row and search startSlot leading media.
 * Children render content only; intrinsic media dimensions must not size the row.
 */
export function DetailRowLeadingMedia({
  children,
  shape = 'box',
  size,
}: DetailRowLeadingMediaProps) {
  const usesAnatomyShell = size == null

  return (
    <div
      className={cn(
        usesAnatomyShell ? 'ui-anatomy-leading-media' : identityFrameVariants({ shape, size }),
      )}
      data-detail-row-leading-media=""
      data-shape={shape}
      {...(size != null ? { 'data-size': size } : {})}
    >
      <div className="size-full overflow-hidden [&>*]:size-full">{children}</div>
    </div>
  )
}
