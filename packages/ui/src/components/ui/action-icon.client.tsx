'use client'

import { cn } from '../../lib/utils'
import { ACTION_ICONS, type ActionIconVerb } from './action-icons.map'
import { iconGlyphRootClasses, type IconGlyphStep } from './icon-glyph.variants'

export type ActionIconProps = {
  action: ActionIconVerb
  /** Pass `false` to size the glyph only via `className` (e.g. dialog header nav). */
  step?: IconGlyphStep | false
  className?: string
}

/** Renders the glyph for a closed action verb — no button chrome or destructive treatment. */
export function ActionIcon({ action, step = 'lg', className }: ActionIconProps) {
  const Icon = ACTION_ICONS[action]
  const glyphStepClass = step === false ? undefined : iconGlyphRootClasses[step]
  return <Icon aria-hidden className={cn(glyphStepClass, className)} />
}
