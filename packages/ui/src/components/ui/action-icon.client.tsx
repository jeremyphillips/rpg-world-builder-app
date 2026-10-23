'use client'

import { cn } from '../../lib/utils'
import { ACTION_ICONS, type ActionIconVerb } from './action-icons.map'
import { Icon } from './icon/icon'
import type { IconSizeMode } from './icon/icon.types'

export type ActionIconProps = {
  action: ActionIconVerb
  /** Required. `owner` reads the enclosing owner's `--icon-size`. */
  size: IconSizeMode
  className?: string
}

/** Renders the glyph for a closed action verb — no button chrome or destructive treatment. */
export function ActionIcon({ action, size, className }: ActionIconProps) {
  return <Icon name={ACTION_ICONS[action]} size={size} className={cn(className)} />
}
