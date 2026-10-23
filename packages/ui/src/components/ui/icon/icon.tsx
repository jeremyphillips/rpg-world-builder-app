import { cn } from '../../../lib/utils'
import { ICON_GLYPHS } from './icon-glyphs'
import type { IconProps } from './icon.types'

/** Always decorative. Accessible names stay on the interactive control. */
export function Icon({ name, size, className }: IconProps) {
  const Glyph = ICON_GLYPHS[name]
  return (
    <Glyph
      aria-hidden="true"
      data-icon={name}
      className={cn('ui-icon', `ui-icon--${size}`, className)}
    />
  )
}
