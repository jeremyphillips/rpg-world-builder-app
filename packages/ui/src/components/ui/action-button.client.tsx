'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { ACTION_ICONS, type ActionIconVerb } from './action-icons.map'
import { Button, type ButtonProps } from './button.client'
import { iconGlyphRootClasses, type IconGlyphStep } from './icon-glyph.variants'

export type ActionButtonProps = Omit<ButtonProps, 'children'> & {
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
  ...buttonProps
}: ActionButtonProps) {
  const Icon = ACTION_ICONS[action]
  const hasLabel = children != null && children !== ''

  return (
    <Button type="button" className={className} {...(buttonProps as ButtonProps)}>
      <Icon aria-hidden className={cn(iconGlyphRootClasses[iconStep], hasLabel && 'shrink-0')} />
      {hasLabel ? children : null}
    </Button>
  )
}
