'use client'

import { cn } from '../../lib/utils'
import { Icon } from './icon/icon'
import type { IconSizeMode } from './icon/icon.types'

export type DisclosureIndicatorProps = {
  size: IconSizeMode
  className?: string
}

/** Chevron that rotates when an ancestor Collapsible/Accordion trigger is open (`data-state=open`). */
export function DisclosureIndicator({ size, className }: DisclosureIndicatorProps) {
  return (
    <Icon
      name="chevron-down"
      size={size}
      className={cn('transition-transform [[data-state=open]_&]:rotate-180', className)}
    />
  )
}
