import { isValidElement, type ReactNode } from 'react'
import type { RowAnatomyBand } from '@rpg/ui'

/** Maps leading media frame size to the row band minimum (heading-band matches frame height). */
export function resolveEntityAnatomyBand(media: ReactNode | undefined): RowAnatomyBand {
  if (media == null) {
    return 'control'
  }

  if (isValidElement<{ size?: string }>(media) && media.props.size === 'sm') {
    return 'media-sm'
  }

  return 'media-xs'
}
