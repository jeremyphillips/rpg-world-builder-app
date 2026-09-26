'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { ACTION_ICONS, type ActionIconVerb } from './action-icons.map'
import { Button, type ButtonForwardingProps } from './button.client'
import { iconGlyphRootClasses, type IconGlyphStep } from './icon-glyph.variants'

export type ActionButtonProps = Omit<ButtonForwardingProps, 'children'> & {
  action: ActionIconVerb
  children?: React.ReactNode
  iconStep?: IconGlyphStep
}

/**
 * Button with a registry-backed leading action glyph. Does not infer destructive styling
 * from `action="remove"` — use remove wrappers or pass `variant` explicitly.
 */
export function ActionButton({
  action,
  children,
  iconStep = 'lg',
  className,
  variant = 'default',
  ...props
}: ActionButtonProps) {
  const Icon = ACTION_ICONS[action]
  const hasLabel = children != null && children !== ''

  return (
    <Button type="button" variant={variant} className={className} {...props}>
      <Icon aria-hidden className={cn(iconGlyphRootClasses[iconStep], hasLabel && 'shrink-0')} />
      {hasLabel ? children : null}
    </Button>
  )
}
