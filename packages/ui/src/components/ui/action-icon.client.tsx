'use client'

import { cn } from '../../lib/utils'
import { ACTION_ICONS, type ActionIconVerb } from './action-icons.map'
import { iconGlyphRootClasses, type IconGlyphStep } from './icon-glyph.variants'

export type ActionIconProps = {
  action: ActionIconVerb
  step?: IconGlyphStep
  className?: string
}

/** Renders the glyph for a closed action verb — no button chrome or destructive treatment. */
export function ActionIcon({ action, step = 'lg', className }: ActionIconProps) {
  const Icon = ACTION_ICONS[action]
  return <Icon aria-hidden className={cn(iconGlyphRootClasses[step], className)} />
}
